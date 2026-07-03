import express from 'express';
import { getPromotions, createPromotion, updatePromotion, deletePromotion } from '../controllers/promotionController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     Promotion:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *         title:
 *           type: string
 *         discountPercentage:
 *           type: number
 *         startDate:
 *           type: string
 *           format: date
 *         endDate:
 *           type: string
 *           format: date
 */

/**
 * @swagger
 * /api/promotions:
 *   get:
 *     summary: Lấy danh sách khuyến mãi
 *     tags: [Promotions]
 *     responses:
 *       200:
 *         description: Trả về danh sách khuyến mãi
 *   post:
 *     summary: Thêm khuyến mãi mới (Admin)
 *     tags: [Promotions]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Promotion'
 *     responses:
 *       201:
 *         description: Đã thêm khuyến mãi
 */
router.route('/')
  .get(getPromotions)
  .post(protect, admin, createPromotion);

/**
 * @swagger
 * /api/promotions/{id}:
 *   put:
 *     summary: Cập nhật khuyến mãi (Admin)
 *     tags: [Promotions]
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
 *             $ref: '#/components/schemas/Promotion'
 *     responses:
 *       200:
 *         description: Đã cập nhật
 *   delete:
 *     summary: Xóa khuyến mãi (Admin)
 *     tags: [Promotions]
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
 *         description: Đã xóa khuyến mãi
 */
router.route('/:id')
  .put(protect, admin, updatePromotion)
  .delete(protect, admin, deletePromotion);

export default router;
