import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getMovieById } from '../services/api';
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
      <div className="container error-screen text-center mt-6">
        <h2>Không tìm thấy phim</h2>
        <Link to="/" className="btn-primary mt-4">Quay về trang chủ</Link>
      </div>
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

      <div className="container details-content">
        <div className="details-grid">
          
          <div className="details-poster-col slide-up">
            <div className="movie-poster-wrapper rounded-lg shadow-glow">
              <img src={movie.posterUrl} alt={movie.title} className="movie-poster" />
            </div>
          </div>

          <div className="details-info-col slide-up delay-100">
            <h1 className="movie-title-large text-primary">{movie.title}</h1>
            <h2 className="movie-original-title text-secondary">{movie.originalTitle || movie.title}</h2>
            
            <div className="movie-meta flex gap-4 items-center mb-6 mt-4">
              <span className="badge hot">C18</span>
              <span className="text-warning font-bold">★ 8.5 / 10</span>
              <span className="text-secondary">{movie.duration} phút</span>
              <span className="text-secondary">{movie.genres.join(', ')}</span>
            </div>

            <div className="movie-description text-muted mb-8">
              <h3 className="section-subtitle">Nội dung</h3>
              <p>{movie.description || 'Đang cập nhật nội dung...'}</p>
            </div>

            <div className="movie-crew grid-2-col mb-8">
              <div>
                <h3 className="section-subtitle">Đạo diễn</h3>
                <p>{movie.director || 'Đang cập nhật'}</p>
              </div>
              <div>
                <h3 className="section-subtitle">Diễn viên</h3>
                <p>{movie.cast?.join(', ') || 'Đang cập nhật'}</p>
              </div>
            </div>

            <div className="action-buttons flex gap-4">
              <Link to={`/booking/${movie._id}`} className="btn-primary btn-lg">MUA VÉ NGAY</Link>
              <button className="btn-outline btn-lg">XEM TRAILER</button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default MovieDetailsPage;
