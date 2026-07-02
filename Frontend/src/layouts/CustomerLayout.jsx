import React, { useContext, useState, useEffect } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';

function CustomerLayout() {
  const { user, logout } = useContext(AuthContext);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="app-container">
      {/* Header */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container flex justify-between items-center" style={{ height: '100%' }}>
          
          <Link to="/" className="logo">
            CINEMA<span className="text-primary">X</span>
          </Link>
          
          <nav className="nav-desktop hidden-md">
            <Link to="/" className="nav-link">Trang Chủ</Link>
            <Link to="/showtimes" className="nav-link">Lịch Chiếu</Link>
            <Link to="/cinemas" className="nav-link">Hệ Thống Rạp</Link>
            <Link to="/promotions" className="nav-link">Khuyến Mãi</Link>
          </nav>
          
          <div className="auth-actions flex gap-4 items-center">
            {user ? (
              <>
                <Link to="/profile" className="user-greeting">Hi, <span className="text-primary">{user.name}</span></Link>
                {(user.role === 'admin' || user.role === 'staff') && (
                  <Link to="/dashboard" className="btn-primary text-xs">Vào Dashboard</Link>
                )}
                <button onClick={() => {
                  logout();
                  toast.success('Đăng xuất thành công');
                }} className="btn-outline">Đăng Xuất</button>
              </>
            ) : (
              <>
                <Link to="/login" className="btn-outline hidden-md">Đăng Nhập</Link>
                <Link to="/register" className="btn-primary">Đăng Ký</Link>
              </>
            )}
          </div>

        </div>
      </header>

      {/* Main Content Area */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="footer text-center text-muted">
        <div className="container">
          <p>&copy; 2026 CINEMAX. All rights reserved. Trải nghiệm điện ảnh đỉnh cao.</p>
        </div>
      </footer>
    </div>
  );
}

export default CustomerLayout;
