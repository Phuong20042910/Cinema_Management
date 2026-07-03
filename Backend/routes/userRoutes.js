import express from 'express';
import { getUsers, updateUserRole, deleteUser } from '../controllers/userController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Lấy danh sách tài khoản (Admin)
 *     tags: [Users]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Danh sách users
 */
router.route('/').get(protect, admin, getUsers);

/**
 * @swagger
 * /api/users/{id}:
 *   delete:
 *     summary: Xóa tài khoản (Admin)
 *     tags: [Users]
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
 *         description: Đã xóa user
 */
router.route('/:id').delete(protect, admin, deleteUser);

/**
 * @swagger
 * /api/users/{id}/role:
 *   put:
 *     summary: Cập nhật quyền tài khoản (Admin)
 *     tags: [Users]
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
 *             type: object
 *             properties:
 *               role:
 *                 type: string
 *                 enum: [user, admin, staff]
 *     responses:
 *       200:
 *         description: Đã cập nhật quyền
 */
router.route('/:id/role').put(protect, admin, updateUserRole);

export default router;
