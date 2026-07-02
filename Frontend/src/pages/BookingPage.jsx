import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovieById, getShowtimesByMovie } from '../services/api';
import './BookingPage.css';

function BookingPage() {
  const { movieId } = useParams();
  const [movie, setMovie] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        const m = await getMovieById(movieId);
        setMovie(m);
        const s = await getShowtimesByMovie(movieId);
        setShowtimes(s);
        
        // Extract unique dates
        if (s.length > 0) {
          const dates = [...new Set(s.map(st => st.startTime.split('T')[0]))].sort();
          if (dates.length > 0) {
            setSelectedDate(dates[0]);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Lỗi tải dữ liệu", error);
        setLoading(false);
      }
    };
    fetchData();
  }, [movieId]);

  if (loading) {
    return (
      <div className="loading-screen fade-in">
        <div className="spinner"></div>
      </div>
    );
  }
  if (!movie) {
    return <div className="container error-screen"><h2>Không tìm thấy phim</h2></div>;
  }

  const filteredShowtimes = showtimes.filter(st => st.startTime.startsWith(selectedDate));
  const cinemasMap = {};
  filteredShowtimes.forEach(st => {
    const cinemaId = st.cinema._id;
    if (!cinemasMap[cinemaId]) {
      cinemasMap[cinemaId] = {
        ...st.cinema,
        showtimes: []
      };
    }
    cinemasMap[cinemaId].showtimes.push(st);
  });
  
  const cinemas = Object.values(cinemasMap);
  const availableDates = [...new Set(showtimes.map(st => st.startTime.split('T')[0]))].sort();

  return (
    <div className="booking-page fade-in">
      <div className="container page-content">
        <div className="booking-header">
          <h1 className="page-title">{movie.title}</h1>
          <p className="page-subtitle text-secondary">Chọn Rạp & Suất Chiếu</p>
        </div>
        
        {/* Date Selector */}
        <div className="date-selector slide-up">
          {availableDates.map((dateStr) => {
            const dateObj = new Date(dateStr);
            const dayOfWeek = ['Chủ Nhật', 'Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7'][dateObj.getDay()];
            const label = `${dateObj.getDate().toString().padStart(2, '0')}/${(dateObj.getMonth() + 1).toString().padStart(2, '0')}`;
            const isActive = selectedDate === dateStr;
            
            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`date-btn ${isActive ? 'active' : ''}`}
              >
                <span className="date-day">{dayOfWeek}</span>
                <span className="date-num">{label}</span>
              </button>
            )
          })}
          {availableDates.length === 0 && <p className="text-muted">Chưa có lịch chiếu cho phim này.</p>}
        </div>

        {/* Cinema List */}
        <div className="cinema-list flex-col gap-6 slide-up delay-100">
          {cinemas.map(cinema => (
            <div key={cinema._id} className="cinema-card-wide bg-elevated rounded-lg p-6">
              <h2 className="cinema-name text-2xl font-bold mb-2">{cinema.name}</h2>
              <p className="cinema-address text-secondary mb-6">{cinema.address}</p>
              
              <div className="showtimes-grid flex gap-4">
                {cinema.showtimes.map(st => {
                  const time = new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
                  return (
                    <Link 
                      to={`/booking/${st._id}/seats`}
                      key={st._id} 
                      className="showtime-btn"
                    >
                      {time}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
          {cinemas.length === 0 && availableDates.length > 0 && <p className="text-muted text-center mt-8">Không có suất chiếu nào trong ngày này.</p>}
        </div>
      </div>
    </div>
  );
}

export default BookingPage;
