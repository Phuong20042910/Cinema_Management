import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getMovies, getCinemas } from '../services/api';
import { toast } from 'react-hot-toast';
import { Container, Row, Col, Card, Button, Form, Carousel } from 'react-bootstrap';
import './HomePage.css';

function HomePage() {
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Quick Booking states
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedCinemaId, setSelectedCinemaId] = useState('');
  const [selectedDate, setSelectedDate] = useState('');

  const handleQuickBooking = () => {
    if (!selectedMovieId) {
      toast.error('Vui lòng chọn phim bạn muốn xem!');
      return;
    }
    
    let url = `/booking/${selectedMovieId}`;
    const params = [];
    if (selectedCinemaId) params.push(`cinemaId=${selectedCinemaId}`);
    if (selectedDate) params.push(`date=${selectedDate}`);
    if (params.length > 0) {
      url += `?${params.join('&')}`;
    }
    navigate(url);
  };

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        const [moviesData, cinemasData] = await Promise.all([
          getMovies(),
          getCinemas()
        ]);
        setMovies(moviesData);
        setCinemas(cinemasData);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ", error);
        setLoading(false);
      }
    };
    fetchHomeData();
  }, []);

  // ── Scroll-reveal IntersectionObserver ──
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -60px 0px' }
    );
    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
      .forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  // ── Spotlight mouse tracker for movie cards ──
  useEffect(() => {
    const handler = (e) => {
      const card = e.currentTarget;
      const rect = card.getBoundingClientRect();
      card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
      card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
    };
    const cards = document.querySelectorAll('.movie-card');
    cards.forEach((c) => c.addEventListener('mousemove', handler));
    return () => cards.forEach((c) => c.removeEventListener('mousemove', handler));
  }, [loading]);

  // ── Ripple effect on Bootstrap primary buttons ──
  useEffect(() => {
    const handler = (e) => {
      const btn = e.currentTarget;
      const circle = document.createElement('span');
      const diameter = Math.max(btn.clientWidth, btn.clientHeight);
      const rect = btn.getBoundingClientRect();
      circle.className = 'ripple';
      circle.style.cssText = `
        width: ${diameter}px; height: ${diameter}px;
        left: ${e.clientX - rect.left - diameter / 2}px;
        top:  ${e.clientY - rect.top  - diameter / 2}px;
      `;
      btn.querySelector('.ripple')?.remove();
      btn.appendChild(circle);
    };
    const btns = document.querySelectorAll('.btn-primary, .btn.btn-primary, .btn.btn-danger');
    btns.forEach((b) => b.addEventListener('click', handler));
    return () => btns.forEach((b) => b.removeEventListener('click', handler));
  }, [loading]);

  if (loading) {
    return (
      <div className="loading-screen fade-in">
        <div className="spinner"></div>
        <h2 className="loading-text">Đang tải vũ trụ điện ảnh...</h2>
      </div>
    );
  }

  const topMovies = movies.slice(0, 5);
  const nowShowing = movies.filter(m => m.status === 'NOW_SHOWING' || m.status === 'NOW' || m.status === 'Đang chiếu');
  const comingSoon = movies.filter(m => m.status === 'COMING_SOON' || m.status === 'COMING' || m.status === 'Sắp chiếu');

  return (
    <div className="home-page fade-in">
      {/* Hero Carousel Section */}
      <Carousel controls={true} indicators={true} fade className="hero-slider-section">
        {topMovies.map((movie) => (
          <Carousel.Item key={movie._id} className="hero-slide-item h-100">
            {/* Ambient Blurred Background */}
            <div 
              className="hero-slide-bg" 
              style={{ backgroundImage: `url(${movie.posterUrl || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?ixlib=rb-4.0.3&auto=format&fit=crop&w=1925&q=80'})` }}
            ></div>
            <div className="hero-overlay"></div>
            
            <Container className="hero-slide-container h-100 d-flex align-items-center justify-content-between">
              <Row className="w-100 align-items-center">
                <Col lg={7} md={12} className="hero-content text-start">
                  <span className="badge bg-danger mb-3 px-3 py-2 text-uppercase">MỚI NHẤT</span>
                  <h1 className="hero-title">{movie.title}</h1>
                  <p className="hero-desc">
                    {movie.description || 'Khám phá tác phẩm điện ảnh đỉnh cao. Đặt vé ngay để trải nghiệm định dạng IMAX siêu thực!'}
                  </p>
                  <div className="hero-actions d-flex gap-3">
                    <Button as={Link} to={`/movie/${movie._id}`} variant="primary" size="lg" className="px-4 py-2.5">
                      Đặt Vé Ngay
                    </Button>
                    <Button 
                      href={movie.trailerUrl} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      variant="outline-light" 
                      size="lg" 
                      className="px-4 py-2.5"
                    >
                      Xem Trailer
                    </Button>
                  </div>
                </Col>
                <Col lg={5} className="d-none d-lg-flex justify-content-center">
                  <div className="hero-poster-card-wrapper">
                    <img 
                      src={movie.posterUrl || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                      alt={movie.title} 
                      className="hero-poster-card" 
                    />
                  </div>
                </Col>
              </Row>
            </Container>
          </Carousel.Item>
        ))}
      </Carousel>

      {/* Quick Booking Form using Bootstrap Card & Grid */}
      <Container className="quick-booking-wrapper">
        <Card className="quick-booking-bar bg-elevated border-0 shadow-lg p-4">
          <Card.Body className="p-0">
            <Form onSubmit={(e) => { e.preventDefault(); handleQuickBooking(); }}>
              <Row className="g-3 align-items-end">
                <Col md={3} sm={12}>
                  <Form.Group controlId="movie-select">
                    <Form.Label className="text-uppercase fw-bold text-muted small mb-2">Chọn Phim</Form.Label>
                    <Form.Select 
                      value={selectedMovieId} 
                      onChange={(e) => setSelectedMovieId(e.target.value)}
                      className="input-field border-0 bg-secondary-subtle"
                    >
                      <option value="">-- Danh sách phim --</option>
                      {nowShowing.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} sm={12}>
                  <Form.Group controlId="cinema-select">
                    <Form.Label className="text-uppercase fw-bold text-muted small mb-2">Chọn Rạp</Form.Label>
                    <Form.Select 
                      value={selectedCinemaId} 
                      onChange={(e) => setSelectedCinemaId(e.target.value)}
                      className="input-field border-0 bg-secondary-subtle"
                    >
                      <option value="">-- Tất cả rạp --</option>
                      {cinemas.map(c => (
                        <option key={c._id} value={c._id}>{c.name}</option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3} sm={12}>
                  <Form.Group controlId="date-select">
                    <Form.Label className="text-uppercase fw-bold text-muted small mb-2">Ngày Xem</Form.Label>
                    <Form.Control 
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="input-field border-0 bg-secondary-subtle"
                    />
                  </Form.Group>
                </Col>
                <Col md={3} sm={12}>
                  <Button type="submit" variant="primary" className="btn-search-ticket w-100 fw-bold">
                    MUA VÉ NHANH
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      </Container>

      {/* Now Showing Section */}
      <Container id="now-showing" className="movie-section mt-5">
        <div className="d-flex justify-content-between align-items-center mb-4 reveal">
          <h2 className="section-title mb-0 d-flex align-items-center gap-2">
            <span className="title-decorator"></span> Phim Đang Chiếu
          </h2>
          <Button variant="link" className="btn-view-all text-decoration-none p-0 underline-draw">
            Xem tất cả &rarr;
          </Button>
        </div>

        <Row className="g-4">
          {nowShowing.map((movie, i) => (
            <Col key={movie._id} xs={12} sm={6} md={4} lg={3}
              className={`reveal delay-${Math.min(i % 4 * 100 + 100, 400)}`}
            >
              <Card 
                className="movie-card h-100 border-0 overflow-hidden"
                onClick={() => navigate(`/movie/${movie._id}`)}
                style={{ cursor: 'pointer' }}
              >
                <div className="movie-poster-wrapper position-relative">
                  <Card.Img 
                    variant="top" 
                    src={movie.posterUrl || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                    alt={movie.title}
                    className="movie-poster img-fluid"
                  />
                  <div className="movie-overlay d-flex flex-column justify-content-end p-3">
                    <div className="movie-tags d-flex justify-content-between align-items-center mb-3">
                      <span className="badge bg-danger">C18</span>
                      <span className="rating text-warning fw-bold d-flex align-items-center gap-1">★ 8.5</span>
                    </div>
                    <Button variant="primary" className="w-100 fw-bold">MUA VÉ</Button>
                  </div>
                </div>
                <Card.Body className="movie-info p-3">
                  <Card.Title className="movie-title text-truncate mb-1">{movie.title}</Card.Title>
                  <Card.Text className="movie-genre text-muted small">
                    {movie.genres?.join(', ')} • {movie.duration} phút
                  </Card.Text>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </Container>

      {/* Coming Soon Section */}
      {comingSoon.length > 0 && (
        <Container id="coming-soon" className="movie-section mt-5 pt-4">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="section-title mb-0 d-flex align-items-center gap-2">
              <span className="title-decorator" style={{ backgroundColor: 'var(--color-accent)' }}></span> Sắp Ra Mắt
            </h2>
            <Button variant="link" className="btn-view-all text-decoration-none p-0">
              Xem tất cả &rarr;
            </Button>
          </div>
          
          <Row className="g-4">
            {comingSoon.map((movie) => (
              <Col key={movie._id} xs={12} sm={6} md={4} lg={3}>
                <Card 
                  className="movie-card h-100 border-0 overflow-hidden shadow-sm"
                  onClick={() => navigate(`/movie/${movie._id}`)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="movie-poster-wrapper position-relative">
                    <Card.Img 
                      variant="top" 
                      src={movie.posterUrl || 'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'} 
                      alt={movie.title}
                      className="movie-poster img-fluid"
                      style={{ filter: 'grayscale(0.3)' }}
                    />
                  </div>
                  <Card.Body className="movie-info p-3">
                    <Card.Title className="movie-title text-truncate mb-1">{movie.title}</Card.Title>
                    <Card.Text className="movie-genre text-warning fw-bold small">
                      Dự kiến: Tháng sau
                    </Card.Text>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      )}

      {/* Newsletter Section */}
      <section id="promotions" className="newsletter-section mt-5 py-5">
        <Container>
          <Card className="newsletter-box border-0 shadow-lg p-5 bg-elevated">
            <Card.Body className="p-0">
              <Row className="align-items-center g-4">
                <Col lg={8} md={12} className="newsletter-content text-start">
                  <h2 className="fw-bold mb-2">ĐĂNG KÝ NHẬN TIN KHUYẾN MÃI</h2>
                  <p className="text-secondary mb-0">
                    Nhận ngay voucher giảm giá 50% cho lần đặt vé đầu tiên và cập nhật những bom tấn mới nhất!
                  </p>
                </Col>
                <Col lg={4} md={12}>
                  <Form onSubmit={(e) => e.preventDefault()} className="d-flex gap-2 w-100">
                    <Form.Control 
                      type="email" 
                      placeholder="Nhập email của bạn..." 
                      className="input-field border-0 bg-secondary-subtle py-2.5" 
                    />
                    <Button type="submit" variant="primary" className="px-4 py-2.5">
                      ĐĂNG KÝ
                    </Button>
                  </Form>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Container>
      </section>
    </div>
  );
}

export default HomePage;
