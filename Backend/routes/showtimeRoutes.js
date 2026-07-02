import express from 'express';
import { getShowtimesByMovie, getAllShowtimes, getShowtimeById, createShowtime, updateShowtime, deleteShowtime } from '../controllers/showtimeController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Routes
router.route('/')
  .get(getAllShowtimes)
  .post(protect, admin, createShowtime);

router.route('/movie/:movieId').get(getShowtimesByMovie); // Use /movie/:movieId to avoid conflict

router.route('/:id')
  .get(getShowtimeById)
  .put(protect, admin, updateShowtime)
  .delete(protect, admin, deleteShowtime);

export default router;
