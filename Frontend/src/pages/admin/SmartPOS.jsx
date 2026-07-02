import React, { useState } from 'react';
import api from '../../services/api';
import './SaaS.css';

function SmartPOS() {
  const [ticketCode, setTicketCode] = useState('');
  const [status, setStatus] = useState(null); // null, 'success', 'error'
  const [bookingData, setBookingData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleScan = async (e) => {
    e.preventDefault();
    if (!ticketCode) return;
    
    try {
      const response = await api.put(`/bookings/${ticketCode}/checkin`);
      setBookingData(response.data.booking);
      setStatus('success');
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Lỗi kiểm tra vé hoặc mã vé không tồn tại');
      setStatus('error');
    }
  };

  return (
    <div className="smart-pos-container fade-in">
      <div className="scan-box">
        <h1 className="text-4xl font-bold mb-2">Smart POS</h1>
        <p className="text-secondary mb-8">Quét mã QR hoặc nhập mã vé thủ công</p>
        
        <form onSubmit={handleScan}>
          <input 
            type="text" 
            className="pos-input" 
            placeholder="NHẬP MÃ VÉ..." 
            value={ticketCode}
            onChange={(e) => {
              setTicketCode(e.target.value);
              setStatus(null);
              setBookingData(null);
            }}
            autoFocus
          />
        </form>

        {status === 'success' && bookingData && (
          <div className="pos-status success slide-up">
            <h2 className="text-success text-2xl font-bold mb-2">HỢP LỆ (SOÁT VÉ THÀNH CÔNG)</h2>
            <p>Mã: <span className="font-bold">{bookingData._id}</span></p>
            <p>Phim: <span className="font-bold text-accent">{bookingData.showtime?.movie?.title}</span></p>
            <p>Rạp: {bookingData.showtime?.cinema?.name}</p>
            <p>Ghế: <span className="text-success font-bold text-xl">{bookingData.seats.map(s => s.seatId).join(', ')}</span></p>
            <button 
              className="btn-primary mt-4"
              onClick={() => { setTicketCode(''); setStatus(null); setBookingData(null); }}
            >KIỂM TRA TIẾP</button>
          </div>
        )}

        {status === 'error' && (
          <div className="pos-status error slide-up">
            <h2 className="text-primary text-2xl font-bold mb-2">KHÔNG HỢP LỆ</h2>
            <p>{errorMessage}</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default SmartPOS;

