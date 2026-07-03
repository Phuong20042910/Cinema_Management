import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
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
    <Container className="page-container fade-in">
      <div className="text-center mb-5">
        <h1 className="page-title text-gradient">Lịch Chiếu Phim</h1>
        <p className="page-subtitle mb-0">Chọn suất chiếu phù hợp nhất với bạn</p>
      </div>

      {Object.values(groupedShowtimes).length === 0 ? (
        <div className="text-center py-5 text-muted">Hiện tại chưa có lịch chiếu nào.</div>
      ) : (
        <div className="showtimes-list">
          {Object.values(groupedShowtimes).map((group) => (
            <Card key={group.movie._id} className="movie-group border-0 shadow-sm mb-4 bg-elevated overflow-hidden">
              <Card.Body className="p-4">
                <Row className="g-4">
                  <Col md={3} sm={12} className="text-center text-md-start">
                    <img 
                      src={group.movie.posterUrl} 
                      alt={group.movie.title} 
                      className="movie-group-poster img-fluid rounded shadow" 
                      style={{ maxWidth: '160px', height: 'auto', objectFit: 'cover' }}
                    />
                  </Col>
                  
                  <Col md={9} sm={12} className="movie-group-info text-start">
                    <h2 className="card-title fw-bold fs-4 mb-3" style={{ color: 'var(--color-text-primary)' }}>{group.movie.title}</h2>
                    
                    <div className="d-flex flex-column gap-3">
                      {Object.values(group.cinemas).map((cGroup) => (
                        <div key={cGroup.cinema._id} className="cinema-group border-top pt-3">
                          <h4 className="fw-bold fs-6 text-primary mb-3">🍿 {cGroup.cinema.name}</h4>
                          <div className="time-slots d-flex flex-wrap gap-2">
                            {cGroup.times.map((st) => (
                              <Button 
                                key={st._id} 
                                onClick={() => navigate(`/booking/${st._id}/seats`)}
                                variant="outline-primary"
                                className="time-slot-btn px-4 py-2"
                              >
                                {new Date(st.startTime).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                              </Button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          ))}
        </div>
      )}
    </Container>
  );
}

export default ShowtimesPage;
