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

// Endpoint cho thống kê Admin
router.route('/stats').get(protect, admin, getBookingStats);

// Endpoint cho Webhook Sepay (Public)
router.route('/webhook/sepay').post(sepayWebhook);

// Endpoint polling trạng thái vé
router.route('/:id/status').get(protect, getBookingStatus);

// Endpoint cho Smart POS checkin
router.route('/:id/checkin').put(protect, staff, checkInTicket);

export default router;
