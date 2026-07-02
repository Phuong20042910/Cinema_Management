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
 */
router.route('/')
  .get(getCinemas)
  .post(protect, admin, createCinema);

router.route('/:id')
  .get(getCinemaById)
  .put(protect, admin, updateCinema)
  .delete(protect, admin, deleteCinema);

export default router;
