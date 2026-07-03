import express from 'express';
import { getShowtimesByMovie, getAllShowtimes, getShowtimeById, createShowtime, updateShowtime, deleteShowtime } from '../controllers/showtimeController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Showtime:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         movie:
 *           type: string
 *         cinema:
 *           type: string
 *         room:
 *           type: string
 *         startTime:
 *           type: string
 *           format: date-time
 */

/**
 * @swagger
 * /api/showtimes:
 *   get:
 *     summary: Lấy danh sách tất cả suất chiếu
 *     tags: [Showtimes]
 *     responses:
 *       200:
 *         description: Trả về danh sách suất chiếu
 *   post:
 *     summary: Tạo suất chiếu mới (Admin)
 *     tags: [Showtimes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Showtime'
 *     responses:
 *       201:
 *         description: Đã tạo suất chiếu
 */
router.route('/')
  .get(getAllShowtimes)
  .post(protect, admin, createShowtime);

/**
 * @swagger
 * /api/showtimes/movie/{movieId}:
 *   get:
 *     summary: Lấy suất chiếu theo ID phim
 *     tags: [Showtimes]
 *     parameters:
 *       - in: path
 *         name: movieId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Danh sách suất chiếu của phim
 */
router.route('/movie/:movieId').get(getShowtimesByMovie);

/**
 * @swagger
 * /api/showtimes/{id}:
 *   get:
 *     summary: Lấy thông tin 1 suất chiếu
 *     tags: [Showtimes]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Thông tin suất chiếu
 *   put:
 *     summary: Cập nhật suất chiếu (Admin)
 *     tags: [Showtimes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Showtime'
 *     responses:
 *       200:
 *         description: Đã cập nhật
 *   delete:
 *     summary: Xóa suất chiếu (Admin)
 *     tags: [Showtimes]
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
 *         description: Đã xóa suất chiếu
 */
router.route('/:id')
  .get(getShowtimeById)
  .put(protect, admin, updateShowtime)
  .delete(protect, admin, deleteShowtime);

export default router;
