import React, { useContext } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import './DashboardLayout.css';

import { toast } from 'react-hot-toast';

function DashboardLayout() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

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

  const isActive = (path) => location.pathname.includes(path) ? 'active' : '';

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="logo">
            CINEMA<span className="text-primary">X</span>
          </Link>
          <span className="badge hot mt-2">WORKSPACE</span>
        </div>

        <nav className="sidebar-nav">
          <p className="nav-group-title">MAIN MENU</p>
          
          <Link to="/dashboard/overview" className={`sidebar-link ${isActive('overview')}`}>
            <span className="icon">📊</span> Tổng quan
          </Link>
          
          <Link to="/dashboard/pos" className={`sidebar-link ${isActive('pos')}`}>
            <span className="icon">🎫</span> Smart POS
          </Link>

          {user.role === 'admin' && (
            <>
              <p className="nav-group-title mt-6">MANAGEMENT</p>
              
              <Link to="/dashboard/movies" className={`sidebar-link ${isActive('movies')}`}>
                <span className="icon">🎬</span> Phim
              </Link>
              
              <Link to="/dashboard/cinemas" className={`sidebar-link ${isActive('cinemas')}`}>
                <span className="icon">🏢</span> Hệ Thống Rạp
              </Link>

              <Link to="/dashboard/showtimes" className={`sidebar-link ${isActive('showtimes')}`}>
                <span className="icon">⏰</span> Lịch Chiếu
              </Link>
              
              <Link to="/dashboard/users" className={`sidebar-link ${isActive('users')}`}>
                <span className="icon">👥</span> Khách hàng
              </Link>

              <Link to="/dashboard/promotions" className={`sidebar-link ${isActive('promotions')}`}>
                <span className="icon">🎁</span> Khuyến Mãi
              </Link>
            </>
          )}
        </nav>

        <div className="sidebar-footer">
          <div className="user-profile flex items-center gap-2 mb-4">
            <div className="avatar-sm">{user.name.charAt(0)}</div>
            <div>
              <p className="user-name font-bold text-sm">{user.name}</p>
              <p className="user-role text-xs text-muted">{user.role.toUpperCase()}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="btn-outline w-full text-sm">ĐĂNG XUẤT</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="dashboard-main">
        <header className="dashboard-topbar flex justify-between items-center">
          <h2 className="topbar-title">Hệ thống Điều khiển</h2>
          <div className="flex gap-4 items-center">
            <button className="btn-icon">🔔</button>
            <button className="btn-icon">⚙️</button>
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
