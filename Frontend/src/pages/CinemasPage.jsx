import React, { useState, useEffect, useRef, useMemo } from 'react';
import api from '../services/api';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Form } from 'react-bootstrap';
import './CustomerPages.css';

function CinemasPage() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const [selectedCinemaId, setSelectedCinemaId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('Tất cả');

  const goongTilesKey = import.meta.env.VITE_GOONG_MAPTILES_KEY;
  const goongApiKey = import.meta.env.VITE_GOONG_API_KEY;

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const response = await api.get('/cinemas');
        setCinemas(response.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách rạp", error);
        toast.error("Lỗi lấy danh sách rạp");
      } finally {
        setLoading(false);
      }
    };
    fetchCinemas();
  }, []);

  // Compute unique cities for the filter tabs
  const cities = useMemo(() => {
    if (cinemas.length === 0) return ['Tất cả'];
    const uniqueCities = [...new Set(cinemas.map(c => c.city).filter(Boolean))];
    return ['Tất cả', ...uniqueCities];
  }, [cinemas]);

  // Filter cinemas list based on city selection and search query
  const filteredCinemas = useMemo(() => {
    return cinemas.filter(cinema => {
      const matchesCity = selectedCity === 'Tất cả' || cinema.city === selectedCity;
      const matchesSearch = 
        cinema.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        cinema.address.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCity && matchesSearch;
    });
  }, [cinemas, selectedCity, searchQuery]);

  // 1. Initialize Goong Map once when page loads
  useEffect(() => {
    if (loading || cinemas.length === 0 || !goongTilesKey) return;

    let map;
    if (typeof window.goongjs !== 'undefined') {
      window.goongjs.accessToken = goongTilesKey;
      
      // Determine center of map. Use first cinema's coordinates if available, otherwise center of Vietnam.
      const firstCinemaWithCoords = cinemas.find(c => c.lat && c.lng);
      const initialCenter = firstCinemaWithCoords 
        ? [firstCinemaWithCoords.lng, firstCinemaWithCoords.lat] 
        : [108.2062, 16.0471];
      const initialZoom = firstCinemaWithCoords ? 11 : 5;

      map = new window.goongjs.Map({
        container: 'map-container',
        style: 'https://tiles.goong.io/assets/goong_map_web.json',
        center: initialCenter,
        zoom: initialZoom
      });

      map.addControl(new window.goongjs.NavigationControl());
      mapRef.current = map;
    }

    return () => {
      if (map) {
        map.remove();
        mapRef.current = null;
      }
    };
  }, [loading, cinemas, goongTilesKey]);

  // 2. Synchronize markers whenever filteredCinemas change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear old markers
    markersRef.current.forEach(item => item.marker.remove());
    markersRef.current = [];

    const loadedMarkers = [];

    filteredCinemas.forEach(cinema => {
      if (cinema.lat && cinema.lng) {
        const coords = [cinema.lng, cinema.lat];
        
        // Create custom HTML Marker element (pulsing neon design)
        const el = document.createElement('div');
        el.className = 'custom-marker';

        // Create Popup in Dark Theme style
        const popup = new window.goongjs.Popup({ offset: 25 })
          .setHTML(`
            <div style="color: var(--color-text-primary); font-family: var(--font-family-base); min-width: 220px;">
              <h4 style="margin: 0 0 6px 0; font-weight: 700; font-size: 15px; color: var(--color-primary); letter-spacing: 0.5px;">${cinema.name}</h4>
              <p style="margin: 0 0 10px 0; font-size: 12px; color: var(--color-text-secondary); line-height: 1.5;">
                📍 ${cinema.address}
              </p>
              <div style="border-top: 1px solid var(--color-border); padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span style="font-size: 11px; background: rgba(244,63,94,0.1); color: var(--color-primary); padding: 2px 6px; border-radius: 4px; font-weight: 700;">
                  ${cinema.rooms?.length || 0} Phòng Chiếu
                </span>
                <a href="/showtimes?cinemaId=${cinema._id}" style="font-size: 12px; font-weight: 700; color: var(--color-secondary); text-decoration: none; display: flex; align-items: center;">
                  Lịch Chiếu ➔
                </a>
              </div>
            </div>
          `);

        // Create Marker
        const marker = new window.goongjs.Marker(el)
          .setLngLat(coords)
          .setPopup(popup)
          .addTo(map);
        
        loadedMarkers.push({ cinemaId: cinema._id, marker, coords });
      }
    });

    markersRef.current = loadedMarkers;

    // Adjust map view if there are filtered cinemas
    if (loadedMarkers.length > 0) {
      const selectedMarker = loadedMarkers.find(m => m.cinemaId === selectedCinemaId);
      const targetCoords = selectedMarker ? selectedMarker.coords : loadedMarkers[0].coords;
      
      map.flyTo({
        center: targetCoords,
        zoom: selectedMarker ? 15 : 11,
        essential: true
      });
    }
  }, [filteredCinemas, selectedCinemaId]);

  const handleShowMap = (cinema) => {
    setSelectedCinemaId(cinema._id);
    
    if (cinema.lat && cinema.lng) {
      const coords = [cinema.lng, cinema.lat];
      
      if (mapRef.current) {
        mapRef.current.flyTo({
          center: coords,
          zoom: 15,
          essential: true
        });

        // Find the marker corresponding to this cinema and toggle its popup
        const matched = markersRef.current?.find(m => m.cinemaId === cinema._id);
        if (matched) {
          // Close all popups first to avoid clutter
          markersRef.current.forEach(m => {
            if (m.marker.getPopup().isOpen()) {
              m.marker.togglePopup();
            }
          });
          matched.marker.togglePopup();
        }
      }
    } else {
      // Fallback: If no coordinates in DB, call geocoding API
      handleGeocodeAndShow(cinema);
    }
  };

  const handleGeocodeAndShow = async (cinema) => {
    if (!goongApiKey) {
      toast.error("Thiếu Goong API Key cấu hình!");
      return;
    }
    const fullAddress = `${cinema.address}, ${cinema.city}`;

    try {
      const response = await axios.get(`https://rsapi.goong.io/geocode`, {
        params: {
          address: fullAddress,
          api_key: goongApiKey
        }
      });

      if (response.data.results && response.data.results.length > 0) {
        const location = response.data.results[0].geometry.location;
        const coords = [location.lng, location.lat];

        if (mapRef.current) {
          mapRef.current.flyTo({
            center: coords,
            zoom: 15,
            essential: true
          });

          // Create custom element
          const el = document.createElement('div');
          el.className = 'custom-marker';

          // Create Popup
          const popup = new window.goongjs.Popup({ offset: 25 })
            .setHTML(`
              <div style="color: var(--color-text-primary); font-family: var(--font-family-base); min-width: 220px;">
                <h4 style="margin: 0 0 6px 0; font-weight: 700; font-size: 15px; color: var(--color-primary); letter-spacing: 0.5px;">${cinema.name}</h4>
                <p style="margin: 0 0 10px 0; font-size: 12px; color: var(--color-text-secondary); line-height: 1.5;">
                  📍 ${cinema.address}
                </p>
                <div style="border-top: 1px solid var(--color-border); padding-top: 8px; display: flex; justify-content: space-between; align-items: center;">
                  <span style="font-size: 11px; background: rgba(244,63,94,0.1); color: var(--color-primary); padding: 2px 6px; border-radius: 4px; font-weight: 700;">
                    ${cinema.rooms?.length || 0} Phòng Chiếu
                  </span>
                  <a href="/showtimes?cinemaId=${cinema._id}" style="font-size: 12px; font-weight: 700; color: var(--color-secondary); text-decoration: none; display: flex; align-items: center;">
                    Lịch Chiếu ➔
                  </a>
                </div>
              </div>
            `);

          // Create Marker
          const marker = new window.goongjs.Marker(el)
            .setLngLat(coords)
            .setPopup(popup)
            .addTo(mapRef.current);

          markersRef.current.push({ cinemaId: cinema._id, marker, coords });
          marker.togglePopup();
        }
      } else {
        toast.error('Không tìm thấy tọa độ địa chỉ rạp trên Goong Map');
      }
    } catch (error) {
      console.error("Lỗi Geocoding:", error);
      toast.error('Lỗi định vị vị trí rạp');
    }
  };

  if (loading) {
    return (
      <div className="loading-screen fade-in">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="full-map-page-wrapper fade-in">
      {/* Floating Panel Overlay */}
      <div className="floating-cinema-panel">
        <div className="panel-header mb-4">
          <h1 className="text-xl font-bold text-gradient flex items-center gap-1.5">
            🍿 CỤM RẠP CINEMAX
          </h1>
          <p className="text-xs text-muted">Trải nghiệm điện ảnh chất lượng quốc tế</p>
        </div>

        {/* Filters and Search using Bootstrap Form */}
        <Form className="d-flex gap-2 mb-4">
          <Form.Select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="input-field border-0"
            style={{ flex: '1.2', fontSize: '13px', height: '40px' }}
          >
            {cities.map(city => (
              <option key={city} value={city}>
                {city === 'Tất cả' ? '📍 Tất cả Tp' : `📍 ${city}`}
              </option>
            ))}
          </Form.Select>

          <div style={{ flex: '2', position: 'relative' }}>
            <Form.Control
              type="text"
              placeholder="Tìm kiếm rạp..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field border-0"
              style={{ paddingLeft: '32px', fontSize: '13px', height: '40px', width: '100%' }}
            />
            <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', opacity: 0.5 }}>🔍</span>
          </div>
        </Form>

        {/* Scrollable list */}
        <div className="panel-scrollable-list">
          {filteredCinemas.map((cinema) => (
            <div
              key={cinema._id}
              onClick={() => handleShowMap(cinema)}
              className={`floating-cinema-card ${selectedCinemaId === cinema._id ? 'active' : ''}`}
            >
              <div className="flex justify-between items-start mb-1.5">
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-rose-500/10 text-rose-400 rounded border border-rose-500/20">
                  {cinema.city}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 bg-sky-500/10 text-sky-400 rounded border border-sky-500/20">
                  {cinema.rooms?.length || 0} Phòng
                </span>
              </div>

              <h3 className="text-sm font-bold mb-1 flex items-center gap-1" style={{ color: 'var(--color-text-primary)' }}>
                🍿 {cinema.name}
              </h3>
              <p className="text-xs text-muted mb-3" style={{ lineHeight: '1.4' }}>
                📍 {cinema.address}
              </p>

              <div className="flex justify-between items-center pt-2" style={{ borderTop: '1px dashed var(--color-border)' }}>
                {/* Amenities */}
                <div className="flex gap-1.5">
                  <span style={{ fontSize: '12px' }} title="Ghế đôi">🛋️</span>
                  <span style={{ fontSize: '12px' }} title="IMAX">💎</span>
                  <span style={{ fontSize: '12px' }} title="Dolby Atmos">🔊</span>
                </div>
                <a
                  href={`/showtimes?cinemaId=${cinema._id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                >
                  Lịch chiếu 📅
                </a>
              </div>
            </div>
          ))}

          {filteredCinemas.length === 0 && (
            <div className="text-center py-8 text-xs text-muted">
              Không tìm thấy cụm rạp nào.
            </div>
          )}
        </div>
      </div>

      {/* Full-width Map Container */}
      <div id="map-container" style={{ width: '100%', height: '100%', minHeight: '100%' }}></div>
    </div>
  );
}

export default CinemasPage;
