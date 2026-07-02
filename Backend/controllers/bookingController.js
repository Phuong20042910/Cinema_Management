import Booking from '../models/Booking.js';

// @desc    Tạo mới booking (Mua vé)
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  const { showtimeId, seats, totalAmount, paymentMethod } = req.body;

  if (seats && seats.length === 0) {
    res.status(400).json({ message: 'Chưa chọn ghế nào' });
    return;
  }

  try {
    const booking = new Booking({
      user: req.user._id,
      showtime: showtimeId,
      seats,
      totalAmount,
      paymentMethod,
      paymentStatus: 'PENDING' // Chờ thanh toán qua Sepay
    });

    const createdBooking = await booking.save();
    res.status(201).json(createdBooking);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tạo booking' });
  }
};

// @desc    Lấy danh sách vé đã mua của user
// @route   GET /api/bookings/my-tickets
// @access  Private
export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user._id }).populate({
      path: 'showtime',
      populate: [
        { path: 'movie', model: 'Movie' },
        { path: 'cinema', model: 'Cinema' }
      ]
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy lịch sử mua vé' });
  }
};

// @desc    Lấy tất cả vé bán (Staff & Admin)
// @route   GET /api/bookings
// @access  Private/Staff
export const getAllBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({}).populate('user', 'name email').populate({
      path: 'showtime',
      populate: [
        { path: 'movie', model: 'Movie' },
        { path: 'cinema', model: 'Cinema' }
      ]
    }).sort({ createdAt: -1 });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách vé', error: error.message });
  }
};

// @desc    Lấy danh sách ghế đã được đặt của 1 suất chiếu
// @route   GET /api/bookings/showtime/:showtimeId/seats
// @access  Public
export const getBookedSeatsForShowtime = async (req, res) => {
  try {
    const showtimeId = req.params.showtimeId;
    // Chỉ lấy những booking hợp lệ (đã thanh toán hoặc đang xử lý an toàn)
    const bookings = await Booking.find({ 
      showtime: showtimeId,
      paymentStatus: { $in: ['COMPLETED', 'PENDING'] }
    });
    
    let bookedSeats = [];
    bookings.forEach(booking => {
      booking.seats.forEach(seat => {
        bookedSeats.push(seat.seatId);
      });
    });
    
    res.json(bookedSeats);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy ghế đã đặt', error: error.message });
  }
};

// @desc    Kiểm tra vé và cập nhật trạng thái đã sử dụng (Check-in SmartPOS)
// @route   PUT /api/bookings/:id/checkin
// @access  Private/Staff
export const checkInTicket = async (req, res) => {
  try {
    const ticketCode = req.params.id;
    
    // Kiểm tra định dạng ID hợp lệ của MongoDB
    if (!ticketCode.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({ message: 'Mã vé không hợp lệ' });
    }

    const booking = await Booking.findById(ticketCode).populate({
      path: 'showtime',
      populate: [
        { path: 'movie', model: 'Movie' },
        { path: 'cinema', model: 'Cinema' }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy vé' });
    }

    if (booking.paymentStatus !== 'COMPLETED') {
      return res.status(400).json({ message: 'Vé chưa được thanh toán' });
    }

    if (booking.ticketStatus === 'USED') {
      return res.status(400).json({ message: 'Vé đã được sử dụng trước đó' });
    }

    booking.ticketStatus = 'USED';
    await booking.save();

    res.json({
      message: 'Soát vé thành công',
      booking
    });

  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi kiểm tra vé', error: error.message });
  }
};

// @desc    Lấy thống kê kinh doanh cho Dashboard
// @route   GET /api/bookings/stats
// @access  Private/Admin
export const getBookingStats = async (req, res) => {
  try {
    // Tổng doanh thu & Số vé đã bán
    const totalStats = await Booking.aggregate([
      { $match: { paymentStatus: 'COMPLETED' } },
      { 
        $group: { 
          _id: null, 
          totalRevenue: { $sum: '$totalAmount' },
          ticketsSold: { $sum: { $size: '$seats' } }
        } 
      }
    ]);

    // Thống kê doanh thu 7 ngày gần nhất
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const recentStats = await Booking.aggregate([
      { 
        $match: { 
          paymentStatus: 'COMPLETED',
          createdAt: { $gte: sevenDaysAgo }
        } 
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
          revenue: { $sum: '$totalAmount' }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    // Format recentStats để luôn trả về 7 ngày (kể cả những ngày 0đ)
    const last7Days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toISOString().split('T')[0];
      
      const found = recentStats.find(item => item._id === dateString);
      last7Days.push({
        date: dateString,
        revenue: found ? found.revenue : 0
      });
    }

    // Top 5 booking gần nhất
    const recentBookings = await Booking.find({ paymentStatus: 'COMPLETED' })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name')
      .populate({
        path: 'showtime',
        populate: { path: 'movie', select: 'title' }
      });

    res.json({
      totalRevenue: totalStats.length > 0 ? totalStats[0].totalRevenue : 0,
      ticketsSold: totalStats.length > 0 ? totalStats[0].ticketsSold : 0,
      recentStats: last7Days,
      recentBookings
    });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi tính thống kê', error: error.message });
  }
};

// @desc    Nhận Webhook từ Sepay
// @route   POST /api/bookings/webhook/sepay
// @access  Public
export const sepayWebhook = async (req, res) => {
  try {
    const { amountIn, transactionContent, amount_in, transaction_content } = req.body;
    
    const actualAmount = amountIn || amount_in;
    const actualContent = transactionContent || transaction_content || '';
    
    // Giả định nội dung chuyển khoản chứa Booking ID (24 ký tự hex)
    // Ví dụ: "Thanh toan ve DH 66838a1b2c3d4e5f6a7b8c9d"
    const bookingIdMatch = actualContent.match(/[a-fA-F0-9]{24}/);
    
    if (bookingIdMatch) {
      const bookingId = bookingIdMatch[0];
      const booking = await Booking.findById(bookingId);
      
      if (booking && booking.paymentStatus === 'PENDING' && parseInt(actualAmount) >= booking.totalAmount) {
        booking.paymentStatus = 'COMPLETED';
        await booking.save();
        return res.json({ success: true, message: 'Đã cập nhật trạng thái thanh toán' });
      }
    }
    
    res.json({ success: true, message: 'Ghi nhận webhook nhưng không có dữ liệu thay đổi hợp lệ' });
  } catch (error) {
    console.error('Sepay Webhook Error:', error);
    res.status(500).json({ success: false, message: 'Lỗi xử lý webhook' });
  }
};

// @desc    Lấy trạng thái thanh toán của Booking
// @route   GET /api/bookings/:id/status
// @access  Private
export const getBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) {
      return res.status(404).json({ message: 'Không tìm thấy vé' });
    }
    // Only return status for security (polling endpoint)
    res.json({ status: booking.paymentStatus });
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy trạng thái', error: error.message });
  }
};
