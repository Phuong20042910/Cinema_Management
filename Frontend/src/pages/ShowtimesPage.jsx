import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import './CustomerPages.css';

function ShowtimesPage() {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchShowtimes = async () => {
      try {
        const response = await api.get('/showtimes');
        setShowtimes(response.data);
      } catch (error) {
        console.error("Lỗi lấy suất chiếu", error);
      } finally {
        setLoading(false);
      }
    };
    fetchShowtimes();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen fade-in">
        <div className="spinner"></div>
      </div>
    );
  }

  // Group showtimes by movie
  const groupedShowtimes = showtimes.reduce((acc, st) => {
    if (!st.movie || !st.cinema) return acc; // Skip invalid
    const movieId = st.movie._id;
    if (!acc[movieId]) {
      acc[movieId] = {
        movie: st.movie,
        cinemas: {}
      };
    }
    const cinemaId = st.cinema._id;
    if (!acc[movieId].cinemas[cinemaId]) {
      acc[movieId].cinemas[cinemaId] = {
        cinema: st.cinema,
        times: []
      };
    }
    acc[movieId].cinemas[cinemaId].times.push(st);
    return acc;
  }, {});

  return (
    <div className="container page-container fade-in">
      <h1 className="page-title text-gradient">Lịch Chiếu Phim</h1>
      <p className="page-subtitle">Chọn suất chiếu phù hợp nhất với bạn</p>

      {Object.values(groupedShowtimes).length === 0 ? (
        <div className="text-center py-10 text-muted">Hiện tại chưa có lịch chiếu nào.</div>
      ) : (
        <div className="showtimes-list">
          {Object.values(groupedShowtimes).map((group) => (
            <div key={group.movie._id} className="movie-group slide-up">
              <img src={group.movie.posterUrl} alt={group.movie.title} className="movie-group-poster" />
              <div className="movie-group-info">
                <h2 className="card-title">{group.movie.title}</h2>
                
                <div>
                  {Object.values(group.cinemas).map((cGroup) => (
                    <div key={cGroup.cinema._id} className="cinema-group">
                      <h4>{cGroup.cinema.name}</h4>
                      <div className="time-slots">
                        {cGroup.times.map((st) => (
                          <button 
                            key={st._id} 
                            onClick={() => navigate(`/booking/${st._id}/seats`)}
                            className="time-slot-btn"
                          >
                            {new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ShowtimesPage;
