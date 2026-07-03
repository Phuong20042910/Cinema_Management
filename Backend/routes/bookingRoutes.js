import express from 'express';
import { createBooking, getMyBookings, getAllBookings, getBookedSeatsForShowtime, checkInTicket, getBookingStats, sepayWebhook, getBookingStatus } from '../controllers/bookingController.js';
import { protect, staff, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Tạo booking mới (Mua vé)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               showtimeId:
 *                 type: string
 *               seats:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     seatId:
 *                       type: string
 *                     price:
 *                       type: number
 *               totalAmount:
 *                 type: number
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Tạo vé thành công
 *       401:
 *         description: Không có quyền truy cập
 */
router.route('/')
  .post(protect, createBooking)
  .get(protect, staff, getAllBookings);

/**
 * @swagger
 * /api/bookings/showtime/{showtimeId}/seats:
 *   get:
 *     summary: Lấy danh sách ghế đã được đặt của 1 suất chiếu
 *     tags: [Bookings]
 *     parameters:
 *       - in: path
 *         name: showtimeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trả về danh sách ghế đã bán
 */
router.route('/showtime/:showtimeId/seats').get(getBookedSeatsForShowtime);

/**
 * @swagger
 * /api/bookings/my-tickets:
 *   get:
 *     summary: Lấy danh sách vé của người dùng hiện tại
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về danh sách vé
 *       401:
 *         description: Không có quyền truy cập
 */
router.route('/my-tickets').get(protect, getMyBookings);

/**
 * @swagger
 * /api/bookings/stats:
 *   get:
 *     summary: Lấy thống kê đơn hàng (Admin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Trả về số liệu thống kê
 */
router.route('/stats').get(protect, admin, getBookingStats);

/**
 * @swagger
 * /api/bookings/webhook/sepay:
 *   post:
 *     summary: Webhook nhận thanh toán từ Sepay (Public)
 *     tags: [Bookings]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Xử lý thành công
 */
router.route('/webhook/sepay').post(sepayWebhook);

/**
 * @swagger
 * /api/bookings/{id}/status:
 *   get:
 *     summary: Kiểm tra trạng thái thanh toán của vé
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trạng thái paymentStatus
 */
router.route('/:id/status').get(protect, getBookingStatus);

/**
 * @swagger
 * /api/bookings/{id}/checkin:
 *   put:
 *     summary: Soát vé tại quầy (Smart POS)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Soát vé thành công
 *       400:
 *         description: Lỗi hoặc vé đã sử dụng
 */
router.route('/:id/checkin').put(protect, staff, checkInTicket);

export default router;
