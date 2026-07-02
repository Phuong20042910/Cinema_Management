import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMovies } from '../services/api';
import './HomePage.css';

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const data = await getMovies();
        setMovies(data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải danh sách phim", error);
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Auto Slider
  useEffect(() => {
    if (movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % Math.min(movies.length, 5)); // Slide top 5 movies
    }, 5000);
    return () => clearInterval(interval);
  }, [movies]);

  if (loading) {
    return (
      <div className="loading-screen fade-in">
        <div className="spinner"></div>
        <h2 className="loading-text">Đang tải vũ trụ điện ảnh...</h2>
      </div>
    );
  }

  const topMovies = movies.slice(0, 5);
  const nowShowing = movies.filter(m => m.status !== 'Sắp chiếu');
  const comingSoon = movies.filter(m => m.status === 'Sắp chiếu');

  return (
    <div className="home-page fade-in">
      {/* Hero Slider Section */}
      <section className="hero-slider-section">
        {topMovies.map((movie, index) => (
          <div 
            key={movie._id} 
            className={`hero-slide ${index === currentSlide ? 'active' : ''}`}
            style={{ backgroundImage: `url(${movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1925&q=80'})` }}
          >
            <div className="hero-overlay"></div>
            <div className="hero-content container slide-up">
              <span className="badge hot mb-4">MỚI NHẤT</span>
              <h1 className="hero-title">
                {movie.title}
              </h1>
              <p className="hero-desc">
                {movie.description || 'Khám phá tác phẩm điện ảnh đỉnh cao. Đặt vé ngay để trải nghiệm định dạng IMAX siêu thực!'}
              </p>
              <div className="hero-actions flex gap-4">
                <Link to={`/movie/${movie._id}`} className="btn-primary">Đặt Vé Ngay</Link>
                <button className="btn-outline">Xem Trailer</button>
              </div>
            </div>
          </div>
        ))}

        {/* Slide Indicators */}
        <div className="slide-indicators">
          {topMovies.map((_, index) => (
            <button 
              key={index} 
              className={`indicator-dot ${index === currentSlide ? 'active' : ''}`}
              onClick={() => setCurrentSlide(index)}
            ></button>
          ))}
        </div>
      </section>

      {/* Quick Booking Bar */}
      <div className="quick-booking-wrapper container">
        <div className="quick-booking-bar bg-elevated slide-up">
          <div className="booking-field">
            <label>Chọn Phim</label>
            <select className="input-field">
              <option value="">-- Danh sách phim --</option>
              {nowShowing.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
            </select>
          </div>
          <div className="booking-field">
            <label>Chọn Rạp</label>
            <select className="input-field">
              <option value="">-- Tất cả rạp --</option>
              <option value="1">CINEMAX Landmark</option>
              <option value="2">CINEMAX Gò Vấp</option>
            </select>
          </div>
          <div className="booking-field">
            <label>Ngày Xem</label>
            <input type="date" className="input-field" />
          </div>
          <button className="btn-primary btn-search-ticket">MUA VÉ NHANH</button>
        </div>
      </div>

      {/* Now Showing Section */}
      <section id="now-showing" className="movie-section container">
        <div className="section-header flex justify-between items-center mb-8">
          <h2 className="section-title">
            <span className="title-decorator"></span> Phim Đang Chiếu
          </h2>
          <button className="btn-view-all">Xem tất cả &rarr;</button>
        </div>

        <div className="movie-grid">
          {nowShowing.map((movie, index) => (
            <div 
              key={movie._id} 
              className="movie-card slide-up"
              style={{ animationDelay: `${(index % 4) * 0.1}s` }}
              onClick={() => navigate(`/movie/${movie._id}`)}
            >
              <div className="movie-poster-wrapper">
                <img src={movie.posterUrl || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={movie.title} className="movie-poster" />
                <div className="movie-overlay">
                  <div className="movie-tags flex justify-between items-center mb-4">
                    <span className="badge age-restricted">C18</span>
                    <span className="rating text-warning font-bold flex items-center gap-1">★ 8.5</span>
                  </div>
                  <button className="btn-primary w-full">MUA VÉ</button>
                </div>
              </div>
              <div className="movie-info">
                <h3 className="movie-title">{movie.title}</h3>
                <p className="movie-genre text-muted">{movie.genres?.join(', ')} • {movie.duration} phút</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Coming Soon Section */}
      {comingSoon.length > 0 && (
        <section id="coming-soon" className="movie-section container mt-6">
          <div className="section-header flex justify-between items-center mb-8">
            <h2 className="section-title">
              <span className="title-decorator" style={{backgroundColor: 'var(--color-accent)'}}></span> Sắp Ra Mắt
            </h2>
            <button className="btn-view-all">Xem tất cả &rarr;</button>
          </div>
          
          <div className="movie-grid">
            {comingSoon.map((movie, index) => (
              <div key={movie._id} className="movie-card slide-up" onClick={() => navigate(`/movie/${movie._id}`)}>
                <div className="movie-poster-wrapper">
                  <img src={movie.posterUrl || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} alt={movie.title} className="movie-poster" style={{filter: 'grayscale(0.3)'}} />
                </div>
                <div className="movie-info">
                  <h3 className="movie-title">{movie.title}</h3>
                  <p className="movie-genre text-accent font-bold">Dự kiến: Tháng sau</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Newsletter Section */}
      <section id="promotions" className="newsletter-section mt-8">
        <div className="container">
          <div className="newsletter-box bg-elevated">
            <div className="newsletter-content">
              <h2>ĐĂNG KÝ NHẬN TIN KHUYẾN MÃI</h2>
              <p className="text-secondary">Nhận ngay voucher giảm giá 50% cho lần đặt vé đầu tiên và cập nhật những bom tấn mới nhất!</p>
            </div>
            <div className="newsletter-form flex gap-2">
              <input type="email" placeholder="Nhập email của bạn..." className="input-field" />
              <button className="btn-primary">ĐĂNG KÝ</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default HomePage;
