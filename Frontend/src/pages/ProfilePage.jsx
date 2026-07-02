import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { getMyBookings } from '../services/api';
import './Dashboard.css';

function ProfilePage() {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;
      try {
        const data = await getMyBookings();
        setBookings(data);
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải lịch sử", error);
        setLoading(false);
      }
    };
    fetchBookings();
  }, [user]);

  if (!user) {
    return <div className="container" style={{paddingTop: '100px'}}>Vui lòng đăng nhập để xem hồ sơ.</div>;
  }

  return (
    <div className="dashboard-page fade-in container">
      <h1 className="page-title">Hồ Sơ Của Bạn</h1>
      
      <div className="profile-card slide-up">
        <div className="avatar">
          {user.name.charAt(0).toUpperCase()}
        </div>
        <div className="profile-info">
          <h2 className="profile-name">{user.name}</h2>
          <p className="profile-email text-secondary">{user.email}</p>
        </div>
      </div>

      <h2 className="section-title slide-up delay-100">
        <span className="title-decorator"></span> Lịch Sử Mua Vé
      </h2>

      {loading ? (
        <div className="loading-spinner"></div>
      ) : bookings.length === 0 ? (
        <p className="text-secondary slide-up delay-200">Bạn chưa có giao dịch nào.</p>
      ) : (
        <div className="booking-list slide-up delay-200">
          {bookings.map(booking => (
            <div key={booking._id} className="booking-card">
              <div className="booking-details">
                <h3 className="booking-movie text-primary">{booking.showtime?.movie?.title || 'Phim đã bị xoá'}</h3>
                <p className="booking-cinema text-secondary">{booking.showtime?.cinema?.name} - {booking.showtime?.room}</p>
                <p className="booking-time text-secondary">
                  {booking.showtime?.startTime ? new Date(booking.showtime.startTime).toLocaleString('vi-VN') : ''}
                </p>
                <p className="booking-seats font-bold mt-2">Ghế: {booking.seats.map(s => s.seatId).join(', ')}</p>
              </div>
              <div className="booking-summary text-right">
                <span className="badge success mb-2">{booking.paymentStatus}</span>
                <p className="booking-total">{booking.totalAmount.toLocaleString()} VNĐ</p>
                <p className="booking-id text-muted">Mã vé: {booking._id.substring(0, 8).toUpperCase()}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProfilePage;
