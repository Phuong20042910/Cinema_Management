import express from 'express';
import { getMovies, getMovieById, createMovie, deleteMovie, updateMovie } from '../controllers/movieController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Movie:
 *       type: object
 *       required:
 *         - title
 *         - duration
 *         - releaseDate
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         duration:
 *           type: number
 *         releaseDate:
 *           type: string
 *           format: date
 *         genres:
 *           type: array
 *           items:
 *             type: string
 *         status:
 *           type: string
 */

/**
 * @swagger
 * /api/movies:
 *   get:
 *     summary: Lấy danh sách tất cả các phim
 *     tags: [Movies]
 *     responses:
 *       200:
 *         description: Trả về mảng các phim
 *   post:
 *     summary: Thêm phim mới (Admin)
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Movie'
 *     responses:
 *       201:
 *         description: Đã thêm phim
 */
router.route('/')
  .get(getMovies)
  .post(protect, admin, createMovie);

/**
 * @swagger
 * /api/movies/{id}:
 *   get:
 *     summary: Lấy thông tin phim
 *     tags: [Movies]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Chi tiết phim
 *   delete:
 *     summary: Xóa phim (Admin)
 *     tags: [Movies]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *     responses:
 *       200:
 *         description: Đã xóa phim
 */
router.route('/:id')
  .get(getMovieById)
  .delete(protect, admin, deleteMovie);

export default router;
