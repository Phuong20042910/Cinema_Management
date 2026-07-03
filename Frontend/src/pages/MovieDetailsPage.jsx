import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovieById } from '../services/api';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import './MovieDetails.css';

function MovieDetailsPage() {
  const { id } = useParams();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        const data = await getMovieById(id);
        setMovie(data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải chi tiết phim", error);
        setLoading(false);
      }
    };
    fetchMovie();
  }, [id]);

  if (loading) {
    return (
      <div className="loading-screen fade-in">
        <div className="spinner"></div>
      </div>
    );
  }

  if (!movie) {
    return (
      <Container className="error-screen text-center mt-5">
        <Card className="border-0 shadow p-5 bg-elevated text-center">
          <Card.Body>
            <h2 className="mb-4">Không tìm thấy phim</h2>
            <Button as={Link} to="/" variant="primary" className="px-4 py-2">
              Quay về trang chủ
            </Button>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  return (
    <div className="movie-details-page fade-in">
      <div 
        className="details-backdrop"
        style={{ backgroundImage: `url(${movie.posterUrl})` }}
      >
        <div className="details-overlay"></div>
      </div>

      <Container className="details-content mt-5">
        <Row className="g-5">
          <Col lg={4} md={12} className="details-poster-col text-center text-lg-start">
            <div className="movie-poster-wrapper rounded shadow-lg overflow-hidden" style={{ maxWidth: '320px', margin: '0 auto' }}>
              <img src={movie.posterUrl} alt={movie.title} className="movie-poster img-fluid w-100" />
            </div>
          </Col>

          <Col lg={8} md={12} className="details-info-col text-start">
            <h1 className="movie-title-large text-primary fw-bold display-4 mb-2">{movie.title}</h1>
            <h2 className="movie-original-title text-secondary fs-5 mb-4">{movie.originalTitle || movie.title}</h2>
            
            <div className="movie-meta d-flex flex-wrap gap-3 align-items-center mb-4">
              <span className="badge bg-danger px-3 py-2 text-uppercase">C18</span>
              <span className="text-warning fw-bold">★ 8.5 / 10</span>
              <span className="text-secondary">{movie.duration} phút</span>
              <span className="text-secondary">{movie.genres.join(', ')}</span>
            </div>

            <div className="movie-description text-muted mb-4">
              <h3 className="section-subtitle fw-bold fs-5 border-bottom pb-2 mb-2">Nội dung</h3>
              <p className="lh-lg">{movie.description || 'Đang cập nhật nội dung...'}</p>
            </div>

            <Row className="movie-crew mb-4 g-3">
              <Col sm={6} xs={12}>
                <h3 className="section-subtitle fw-bold fs-5 border-bottom pb-2 mb-2">Đạo diễn</h3>
                <p>{movie.director || 'Đang cập nhật'}</p>
              </Col>
              <Col sm={6} xs={12}>
                <h3 className="section-subtitle fw-bold fs-5 border-bottom pb-2 mb-2">Diễn viên</h3>
                <p>{movie.cast?.join(', ') || 'Đang cập nhật'}</p>
              </Col>
            </Row>

            <div className="action-buttons d-flex gap-3">
              <Button as={Link} to={`/booking/${movie._id}`} variant="primary" size="lg" className="px-5 py-3 fw-bold">
                MUA VÉ NGAY
              </Button>
              <Button 
                href={movie.trailerUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                variant="outline-light" 
                size="lg" 
                className="px-4 py-3"
              >
                XEM TRAILER
              </Button>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default MovieDetailsPage;
