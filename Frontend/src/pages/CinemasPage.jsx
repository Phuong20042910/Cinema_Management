import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './CustomerPages.css';

function CinemasPage() {
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCinemas = async () => {
      try {
        const response = await api.get('/cinemas');
        setCinemas(response.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách rạp", error);
      } finally {
        setLoading(false);
      }
    };
    fetchCinemas();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen fade-in">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container page-container fade-in">
      <h1 className="page-title text-gradient">Hệ Thống Rạp CINEMAX</h1>
      <p className="page-subtitle">Tổ hợp giải trí điện ảnh đẳng cấp hàng đầu</p>

      <div className="grid-cards cols-2">
        {cinemas.map((cinema, i) => (
          <div key={cinema._id} className="cinema-card slide-up" style={{ animationDelay: `${i * 0.1}s`}}>
            <div className="cinema-img-placeholder">
              <span className="text-5xl">🍿</span>
            </div>
            <div className="card-content">
              <h2 className="card-title">{cinema.name}</h2>
              <p className="card-desc flex items-center gap-2">
                <span>📍</span> {cinema.location}
              </p>
              <div className="flex-between pt-4" style={{borderTop: '1px solid rgba(255,255,255,0.1)'}}>
                <span className="text-muted text-sm">{cinema.screens || 1} Phòng chiếu chuẩn Quốc tế</span>
                <button className="btn-outline text-sm py-2 px-4">Xem Bản Đồ</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CinemasPage;
