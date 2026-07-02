import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { createBooking, getShowtimeById, getBookedSeats } from '../services/api';
import api from '../services/api';
import './SeatSelection.css';

function SeatSelectionPage() {
  const { showtimeId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  
  const [showtime, setShowtime] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [occupiedSeats, setOccupiedSeats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Thêm state xử lý thanh toán
  const [paymentBooking, setPaymentBooking] = useState(null);
  const [isPolling, setIsPolling] = useState(false);
  const [selectedBank, setSelectedBank] = useState('MBBank');

  useEffect(() => {
    const fetchShowtimeAndSeats = async () => {
      try {
        const showtimeData = await getShowtimeById(showtimeId);
        setShowtime(showtimeData);
        
        const booked = await getBookedSeats(showtimeId);
        setOccupiedSeats(booked);
        
        setLoading(false);
      } catch (error) {
        console.error("Lỗi khi tải thông tin suất chiếu và ghế", error);
        setLoading(false);
      }
    };
    fetchShowtimeAndSeats();
  }, [showtimeId]);

  // Hook Polling trạng thái thanh toán
  useEffect(() => {
    let intervalId;
    if (isPolling && paymentBooking) {
      intervalId = setInterval(async () => {
        try {
          const res = await api.get(`/bookings/${paymentBooking._id}/status`);
          if (res.data.status === 'COMPLETED') {
            setIsPolling(false);
            clearInterval(intervalId);
            alert('Thanh toán thành công! Chúc bạn xem phim vui vẻ.');
            navigate('/profile');
          }
        } catch (error) {
          console.error("Lỗi khi kiểm tra trạng thái vé", error);
        }
      }, 3000);
    }
    return () => clearInterval(intervalId);
  }, [isPolling, paymentBooking, navigate]);

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'J', 'K'];
  const seatsPerRow = 14;

  const toggleSeat = (seatId, price) => {
    setSelectedSeats(prev => {
      const isSelected = prev.find(s => s.id === seatId);
      if (isSelected) {
        return prev.filter(s => s.id !== seatId);
      } else {
        return [...prev, { id: seatId, price }];
      }
    });
  };

  const calculateTotal = () => {
    return selectedSeats.reduce((sum, seat) => sum + seat.price, 0);
  };

  const handleCheckout = async () => {
    if (!user) {
      alert('Vui lòng đăng nhập để đặt vé!');
      navigate('/login');
      return;
    }
    try {
      const created = await createBooking({
        showtimeId: showtime._id,
        seats: selectedSeats.map(s => ({ seatId: s.id, price: s.price })),
        totalAmount: calculateTotal(),
        paymentMethod: 'VietQR'
      });
      // Đặt vé xong -> Hiện QR Code
      setPaymentBooking(created);
      setIsPolling(true);
    } catch (error) {
      alert('Có lỗi xảy ra: ' + (error.response?.data?.message || error.message));
    }
  };

  const renderPaymentModal = () => {
    if (!paymentBooking) return null;
    
    const amount = paymentBooking.totalAmount;
    const memo = `Thanh toan ve DH ${paymentBooking._id}`;
    
    // MBBank QR
    const mbAccNumber = import.meta.env.VITE_MB_ACCOUNT || '19030000000000';
    const mbQrUrl = `https://qr.sepay.vn/img?acc=${mbAccNumber}&bank=MBBank&amount=${amount}&des=${memo.replace(/ /g, '%20')}`;

    return (
      <div className="fixed inset-0 bg-slate-900 bg-opacity-40 flex items-center justify-center z-[100] p-4 backdrop-blur-sm">
        <div className="payment-modal-bg p-8 rounded-2xl max-w-sm w-full text-center slide-up">
          <h2 className="text-2xl font-bold mb-2 payment-modal-title">Thanh Toán VietQR</h2>
          <p className="payment-modal-text mb-6 text-sm">Quét mã QR dưới đây. Hệ thống tự động xác nhận sau 3-5 giây.</p>
          
          <div className="bg-white p-4 rounded-xl inline-block mb-6 shadow-lg shadow-rose-500/10 border border-slate-100">
            <img src={mbQrUrl} alt="VietQR" className="w-64 h-64 object-contain" />
          </div>
          
          <div className="text-left bg-slate-50 p-4 rounded-xl mb-6 text-sm border border-slate-100 shadow-sm">
            <p className="mb-2"><span className="text-slate-500 font-medium">Ngân hàng:</span> <span className="font-bold text-slate-800 float-right">MBBank</span></p>
            <p className="mb-2"><span className="text-slate-500 font-medium">Số TK:</span> <span className="font-bold text-slate-800 float-right">{mbAccNumber}</span></p>
            <p className="mb-2"><span className="text-slate-500 font-medium">Số tiền:</span> <span className="font-bold text-rose-500 text-lg float-right">{amount.toLocaleString()} ₫</span></p>
            <p className="mb-1 flex items-center justify-between flex-wrap gap-2 mt-3 pt-3 border-t border-slate-200">
              <span className="text-slate-500 font-medium">Nội dung:</span> 
              <span className="font-bold text-slate-800 px-3 py-1.5 bg-slate-200/50 rounded-lg text-xs tracking-wide">{memo}</span>
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 text-rose-500 mb-6 font-medium bg-rose-50 py-2 px-4 rounded-lg inline-flex w-full">
            <div className="w-5 h-5 border-2 border-rose-500 border-t-transparent rounded-full animate-spin"></div>
            <span>Đang chờ thanh toán...</span>
          </div>

          <button 
            onClick={() => {
              setIsPolling(false);
              setPaymentBooking(null);
            }} 
            className="w-full py-3.5 bg-white border-2 border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
          >
            Hủy Giao Dịch
          </button>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className="loading-screen fade-in"><div className="spinner"></div></div>;
  }

  return (
    <div className="seat-selection-page fade-in">
      {renderPaymentModal()}
      
      <div className="container">
        <div className="booking-header slide-up">
          <h1 className="page-title">{showtime.cinema.name}</h1>
          <p className="page-subtitle text-secondary">
            {showtime.movie.title} • {new Date(showtime.startTime).toLocaleString('vi-VN')} • {showtime.room}
          </p>
        </div>

        {/* Screen 3D Effect */}
        <div className="screen-container slide-down delay-100">
          <div className="cinema-screen"></div>
          <div className="screen-glow-effect"></div>
          <p className="screen-text text-muted">Màn Hình</p>
        </div>

        {/* Seat Legend */}
        <div className="seat-legend flex justify-center gap-6 slide-up delay-200">
          <div className="legend-item"><div className="seat-icon available"></div> Trống</div>
          <div className="legend-item"><div className="seat-icon selected"></div> Đang chọn</div>
          <div className="legend-item"><div className="seat-icon occupied"></div> Đã bán</div>
          <div className="legend-item"><div className="seat-icon vip"></div> VIP</div>
          <div className="legend-item"><div className="seat-icon couple"></div> Couple</div>
        </div>

        {/* Seat Grid */}
        <div className="seat-grid-container slide-up delay-300">
          <div className="seat-grid">
            {rows.map((row, rowIndex) => (
              <div key={row} className="seat-row flex items-center justify-center gap-2">
                <div className="row-label">{row}</div>
                
                <div className="flex gap-2">
                  {Array.from({ length: seatsPerRow }).map((_, seatIndex) => {
                    const seatNumber = seatIndex + 1;
                    const seatId = `${row}${seatNumber}`;
                    const isAisleRight = seatNumber === 4 || seatNumber === 10;
                    
                    let seatType = 'standard';
                    let price = 90000;
                    if (rowIndex >= 4 && rowIndex <= 7 && seatNumber >= 3 && seatNumber <= 12) {
                      seatType = 'vip';
                      price = 120000;
                    }
                    if (row === 'K') {
                      seatType = 'couple';
                      price = 250000;
                    }

                    const isOccupied = occupiedSeats.includes(seatId);
                    const isSelected = selectedSeats.some(s => s.id === seatId);

                    if (seatType === 'couple' && seatNumber % 2 === 0) return null; 

                    return (
                      <React.Fragment key={seatId}>
                        <button
                          disabled={isOccupied}
                          onClick={() => toggleSeat(seatId, price)}
                          className={`seat-btn ${seatType} ${isOccupied ? 'occupied' : ''} ${isSelected ? 'selected' : ''}`}
                          title={`Ghế ${seatId} - ${price.toLocaleString()}đ`}
                        >
                          {seatType === 'couple' ? `${row}${seatNumber}-${seatNumber+1}` : seatNumber}
                        </button>
                        {isAisleRight && <div className="aisle"></div>}
                      </React.Fragment>
                    );
                  })}
                </div>
                
                <div className="row-label">{row}</div>
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Sticky Checkout Bar */}
      <div className="checkout-bar">
        <div className="container flex justify-between items-center">
          <div className="checkout-info">
            <p className="text-secondary mb-1">Ghế đã chọn:</p>
            <p className="selected-seats-text text-primary">
              {selectedSeats.length > 0 
                ? selectedSeats.map(s => s.id).join(', ') 
                : 'Chưa chọn ghế'}
            </p>
          </div>
          
          <div className="checkout-actions flex items-center gap-8">
            <div className="text-right">
              <p className="text-secondary mb-1">Tổng cộng:</p>
              <p className="total-price">{calculateTotal().toLocaleString()} VNĐ</p>
            </div>
            <button 
              onClick={handleCheckout}
              className="btn-primary btn-checkout"
              disabled={selectedSeats.length === 0}
            >
              Thanh Toán
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SeatSelectionPage;
