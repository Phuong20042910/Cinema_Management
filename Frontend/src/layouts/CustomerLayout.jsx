import React, { useContext, useState, useEffect } from 'react';
import { Link, Outlet, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Navbar, Nav, Container, Button, NavDropdown } from 'react-bootstrap';

function CustomerLayout() {
  const { user, logout } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);

    // Initialize theme
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
      document.documentElement.classList.add('enable-dark-mode');
      setIsDarkMode(true);
    } else {
      document.documentElement.classList.remove('enable-dark-mode');
      setIsDarkMode(false);
    }

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('enable-dark-mode');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
      toast.success('Đã chuyển sang Chế độ Sáng');
    } else {
      document.documentElement.classList.add('enable-dark-mode');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
      toast.success('Đã chuyển sang Chế độ Tối');
    }
  };

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công');
    navigate('/');
  };

  return (
    <div className="app-container">
      {/* Bootstrap Navbar */}
      <Navbar 
        expand="lg" 
        fixed="top" 
        className={`header ${scrolled ? 'scrolled' : ''}`}
        variant={isDarkMode ? 'dark' : 'light'}
      >
        <Container>
          <Navbar.Brand as={Link} to="/" className="logo">
            CINEMA<span className="text-primary">X</span>
          </Navbar.Brand>
          
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-between">
            <Nav className="mx-auto">
              <Nav.Link as={Link} to="/" className="nav-link">Trang Chủ</Nav.Link>
              <Nav.Link as={Link} to="/showtimes" className="nav-link">Lịch Chiếu</Nav.Link>
              <Nav.Link as={Link} to="/cinemas" className="nav-link">Hệ Thống Rạp</Nav.Link>
              <Nav.Link as={Link} to="/promotions" className="nav-link">Khuyến Mãi</Nav.Link>
            </Nav>
            
            <Nav className="align-items-center gap-3">
              {/* Theme Toggle */}
              <Button 
                variant="outline-secondary"
                onClick={toggleTheme} 
                className="theme-toggle-btn rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: '40px', height: '40px', padding: '0', fontSize: '1.2rem' }}
                title={isDarkMode ? "Chuyển sang Chế độ Sáng" : "Chuyển sang Chế độ Tối"}
              >
                {isDarkMode ? '☀️' : '🌙'}
              </Button>

              {user ? (
                <NavDropdown 
                  title={
                    <span 
                      className="avatar-btn d-inline-flex align-items-center justify-content-center text-uppercase"
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, var(--color-primary), #fb7185)',
                        color: 'white',
                        fontWeight: '700'
                      }}
                    >
                      {user.name.charAt(0)}
                    </span>
                  }
                  id="user-nav-dropdown"
                  align="end"
                  className="user-dropdown-bootstrap"
                >
                  <div className="px-3 py-2 border-bottom mb-1">
                    <div className="fw-bold text-dark">{user.name}</div>
                    <div className="text-muted small text-truncate" style={{ maxWidth: '180px' }}>{user.email}</div>
                  </div>
                  
                  <NavDropdown.Item as={Link} to="/profile">
                    👤 Hồ sơ cá nhân
                  </NavDropdown.Item>
                  
                  {(user.role === 'admin' || user.role === 'staff') && (
                    <NavDropdown.Item as={Link} to="/dashboard">
                      ⚙️ Vào Dashboard
                    </NavDropdown.Item>
                  )}
                  
                  <NavDropdown.Divider />
                  
                  <NavDropdown.Item onClick={handleLogout} className="text-danger">
                    🚪 Đăng xuất
                  </NavDropdown.Item>
                </NavDropdown>
              ) : (
                <>
                  <Button as={Link} to="/login" variant="outline-primary" className="me-2 px-4">
                    Đăng Nhập
                  </Button>
                  <Button as={Link} to="/register" variant="primary" className="px-4">
                    Đăng Ký
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer using Bootstrap Container */}
      <footer className="footer py-4 border-top text-center text-muted">
        <Container>
          <p className="mb-0">&copy; 2026 CINEMAX. All rights reserved. Trải nghiệm điện ảnh đỉnh cao.</p>
        </Container>
      </footer>
    </div>
  );
}

export default CustomerLayout;
