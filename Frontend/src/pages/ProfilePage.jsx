import React, { useState, useEffect, useContext, useRef } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getMyBookings } from '../services/api';
import './Dashboard.css';

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const listRef = useRef(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      try {
        const data = await getMyBookings();
        setBookings(data);
      } catch (error) {
        console.error('Lỗi khi tải lịch sử', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  // Scroll-reveal for booking cards
  useEffect(() => {
    if (loading) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.reveal, .reveal-scale').forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [loading]);

  if (!user) {
    return (
      <div className="container" style={{ paddingTop: '100px' }}>
        Vui lòng đăng nhập để xem hồ sơ.
      </div>
    );
  }

  return (
    <div className="dashboard-page fade-in container">
      <h1 className="page-title slide-up">
        <span className="title-decorator"></span>
        Hồ Sơ Của Bạn
      </h1>

      {/* ── Profile Hero Card ── */}
      <div className="profile-card reveal-scale">
        <div className="avatar">{user.name.charAt(0).toUpperCase()}</div>
        <div className="profile-info">
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-email">{user.email}</p>
          <span className="profile-badge">
            {user.role === 'admin' ? '👑' : user.role === 'staff' ? '⚙️' : '🎬'}
            &nbsp;{user.role.toUpperCase()}
          </span>
        </div>
      </div>

      {/* ── Booking History ── */}
      <h2 className="section-title reveal" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: '1.5rem' }}>
        <span className="title-decorator"></span>
        Lịch Sử Mua Vé
        {!loading && (
          <span style={{
            background: 'var(--color-primary)',
            color: 'white',
            fontSize: '12px',
            fontWeight: 700,
            borderRadius: '999px',
            padding: '2px 10px',
            marginLeft: 4,
          }}>{bookings.length}</span>
        )}
      </h2>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : bookings.length === 0 ? (
        <div className="reveal" style={{
          textAlign: 'center',
          padding: '3rem',
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          color: 'var(--color-text-muted)',
        }}>
          🎫 Bạn chưa có giao dịch nào. Hãy đặt vé ngay!
        </div>
      ) : (
        <div className="booking-list" ref={listRef}>
          {bookings.map((booking, i) => (
            <div
              key={booking._id}
              className={`booking-card reveal delay-${Math.min(i * 100, 500)}`}
            >
              <div className="booking-details">
                <h3 className="booking-movie">{booking.showtime?.movie?.title || 'Phim đã bị xoá'}</h3>
                <p className="booking-cinema">
                  📍 {booking.showtime?.cinema?.name} — {booking.showtime?.room}
                </p>
                <p className="booking-time">
                  🕐 {booking.showtime?.startTime
                    ? new Date(booking.showtime.startTime).toLocaleString('vi-VN')
                    : '—'}
                </p>
                <p className="booking-seats">
                  💺 Ghế: {booking.seats.map((s) => s.seatId).join(', ')}
                </p>
              </div>
              <div className="booking-summary text-right">
                <span className="badge success" style={{ display: 'block', marginBottom: 8 }}>
                  {booking.paymentStatus}
                </span>
                <p className="booking-total">{booking.totalAmount.toLocaleString()} ₫</p>
                <p className="booking-id">#{booking._id.substring(0, 8).toUpperCase()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
