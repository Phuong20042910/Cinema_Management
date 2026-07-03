import express from 'express';
import { getCinemas, getCinemaById, createCinema, updateCinema, deleteCinema } from '../controllers/cinemaController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Cinema:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         name:
 *           type: string
 *         address:
 *           type: string
 *         city:
 *           type: string
 */

/**
 * @swagger
 * /api/cinemas:
 *   get:
 *     summary: Lấy danh sách cụm rạp
 *     tags: [Cinemas]
 *     responses:
 *       200:
 *         description: Trả về danh sách cụm rạp
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Cinema'
 *   post:
 *     summary: Thêm cụm rạp mới (Admin)
 *     tags: [Cinemas]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Cinema'
 *     responses:
 *       201:
 *         description: Đã thêm cụm rạp
 */
router.route('/')
  .get(getCinemas)
  .post(protect, admin, createCinema);

/**
 * @swagger
 * /api/cinemas/{id}:
 *   get:
 *     summary: Lấy thông tin 1 rạp
 *     tags: [Cinemas]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Chi tiết cụm rạp
 *   put:
 *     summary: Cập nhật thông tin rạp (Admin)
 *     tags: [Cinemas]
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
 *             $ref: '#/components/schemas/Cinema'
 *     responses:
 *       200:
 *         description: Đã cập nhật
 *   delete:
 *     summary: Xóa cụm rạp (Admin)
 *     tags: [Cinemas]
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
 *         description: Đã xóa cụm rạp
 */
router.route('/:id')
  .get(getCinemaById)
  .put(protect, admin, updateCinema)
  .delete(protect, admin, deleteCinema);

export default router;
