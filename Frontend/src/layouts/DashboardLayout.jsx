import React, { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import './DashboardLayout.css';

function DashboardLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const [isDarkMode, setIsDarkMode] = React.useState(() =>
    document.documentElement.classList.contains('enable-dark-mode')
  );

  // Sync if theme toggled elsewhere
  React.useEffect(() => {
    const observer = new MutationObserver(() => {
      setIsDarkMode(document.documentElement.classList.contains('enable-dark-mode'));
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => observer.disconnect();
  }, []);

  // Protect Dashboard Routes
  React.useEffect(() => {
    if (user && user.role !== 'admin' && user.role !== 'staff') {
      toast.error('Không có quyền truy cập khu vực Quản trị');
      navigate('/');
    } else if (!user) {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user) return null;

  const handleLogout = () => {
    logout();
    toast.success('Đăng xuất thành công');
    navigate('/');
  };

  const toggleTheme = () => {
    if (isDarkMode) {
      document.documentElement.classList.remove('enable-dark-mode');
      localStorage.setItem('theme', 'light');
      setIsDarkMode(false);
      toast.success('Đã chuyển sang Chế độ Sáng ☀️');
    } else {
      document.documentElement.classList.add('enable-dark-mode');
      localStorage.setItem('theme', 'dark');
      setIsDarkMode(true);
      toast.success('Đã chuyển sang Chế độ Tối 🌙');
    }
  };

  const isActive = (path) => location.pathname.includes(path) ? 'active' : '';

  const navItems = [
    { to: '/dashboard/overview', icon: '📊', label: 'Tổng quan', section: 'MAIN MENU' },
    { to: '/dashboard/today-showtimes', icon: '📅', label: 'Lịch Hôm Nay' },
    { to: '/dashboard/pos',      icon: '🎫', label: 'Smart POS' },
    { to: '/dashboard/bookings',   icon: '🧾', label: 'Đơn Hàng' },
    { to: '/dashboard/shift-stats', icon: '📈', label: 'Thống Kê Ca Làm' },
  ];

  const adminItems = [
    { to: '/dashboard/movies',     icon: '🎬', label: 'Phim',           section: 'MANAGEMENT' },
    { to: '/dashboard/cinemas',    icon: '🏢', label: 'Hệ Thống Rạp' },
    { to: '/dashboard/showtimes',  icon: '⏰', label: 'Lịch Chiếu' },
    { to: '/dashboard/users',      icon: '👥', label: 'Khách hàng' },
    { to: '/dashboard/promotions', icon: '🎁', label: 'Khuyến Mãi' },
  ];

  return (
    <div className="dashboard-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="logo" style={{ fontSize: '1.4rem', fontWeight: 900 }}>
            CINEMA<span className="text-primary">X</span>
          </Link>
          <span className="badge hot" style={{ fontSize: '10px', padding: '3px 8px', marginTop: '4px', alignSelf: 'flex-start' }}>
            WORKSPACE
          </span>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item, i) => (
            <React.Fragment key={item.to}>
              {item.section && (
                <p className="nav-group-title" style={{ marginTop: i > 0 ? '20px' : '0' }}>
                  {item.section}
                </p>
              )}
              <Link to={item.to} className={`sidebar-link ${isActive(item.to.split('/').pop())}`}>
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </React.Fragment>
          ))}

          {user.role === 'admin' && adminItems.map((item, i) => (
            <React.Fragment key={item.to}>
              {item.section && (
                <p className="nav-group-title" style={{ marginTop: '20px' }}>
                  {item.section}
                </p>
              )}
              <Link to={item.to} className={`sidebar-link ${isActive(item.to.split('/').pop())}`}>
                <span className="icon">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            </React.Fragment>
          ))}
        </nav>

        <div className="sidebar-footer">
          {/* User mini card */}
          <div className="user-card-mini">
            <div className="avatar-sm">{user.name.charAt(0)}</div>
            <div className="user-meta">
              <div className="user-name-sm">{user.name}</div>
              <div className="user-role-sm">{user.role}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="btn-outline w-full text-sm"
            style={{
              padding: '9px 16px',
              borderRadius: 'var(--radius-md)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              width: '100%',
              textAlign: 'center',
              background: 'transparent',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-secondary)',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-error)';
              e.currentTarget.style.color = 'var(--color-error)';
              e.currentTarget.style.background = 'rgba(239,68,68,0.06)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = 'var(--color-border)';
              e.currentTarget.style.color = 'var(--color-text-secondary)';
              e.currentTarget.style.background = 'transparent';
            }}
          >
            🚪 ĐĂNG XUẤT
          </button>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <main className="dashboard-main">
        <header className="dashboard-topbar">
          <h2 className="topbar-title">
            Hệ thống Điều khiển
          </h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <button
              onClick={toggleTheme}
              className="btn-icon"
              title={isDarkMode ? 'Chuyển sang Chế độ Sáng' : 'Chuyển sang Chế độ Tối'}
            >
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button className="btn-icon" title="Thông báo">🔔</button>
            <button className="btn-icon" title="Cài đặt">⚙️</button>
          </div>
        </header>

        <div className="dashboard-content-area fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
}

export default DashboardLayout;
