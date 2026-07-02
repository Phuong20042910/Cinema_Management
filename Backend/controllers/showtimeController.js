import Showtime from '../models/Showtime.js';

// @desc    Lấy suất chiếu theo Movie ID
// @route   GET /api/showtimes/:movieId
// @access  Public
export const getShowtimesByMovie = async (req, res) => {
  try {
    const showtimes = await Showtime.find({ movie: req.params.movieId }).populate('cinema');
    res.json(showtimes);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy suất chiếu' });
  }
};
// @desc    Lấy toàn bộ suất chiếu
// @route   GET /api/showtimes
// @access  Public
export const getAllShowtimes = async (req, res) => {
  try {
    const showtimes = await Showtime.find({})
      .populate('movie', 'title posterUrl')
      .populate('cinema', 'name location');
    res.json(showtimes);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy suất chiếu' });
  }
};

// @desc    Lấy suất chiếu theo ID
// @route   GET /api/showtimes/single/:id
// @access  Public
export const getShowtimeById = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id)
      .populate('movie', 'title')
      .populate('cinema', 'name location');
    if (showtime) {
      res.json(showtime);
    } else {
      res.status(404).json({ message: 'Không tìm thấy suất chiếu' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Tạo suất chiếu mới
// @route   POST /api/showtimes
// @access  Private/Admin
export const createShowtime = async (req, res) => {
  try {
    const showtime = new Showtime(req.body);
    const createdShowtime = await showtime.save();
    res.status(201).json(createdShowtime);
  } catch (error) {
    res.status(400).json({ message: 'Dữ liệu không hợp lệ', error });
  }
};

// @desc    Cập nhật suất chiếu
// @route   PUT /api/showtimes/:id
// @access  Private/Admin
export const updateShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    if (showtime) {
      showtime.movie = req.body.movie || showtime.movie;
      showtime.cinema = req.body.cinema || showtime.cinema;
      showtime.startTime = req.body.startTime || showtime.startTime;
      showtime.price = req.body.price || showtime.price;

      const updatedShowtime = await showtime.save();
      res.json(updatedShowtime);
    } else {
      res.status(404).json({ message: 'Không tìm thấy suất chiếu' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Dữ liệu cập nhật không hợp lệ', error });
  }
};

// @desc    Xóa suất chiếu
// @route   DELETE /api/showtimes/:id
// @access  Private/Admin
export const deleteShowtime = async (req, res) => {
  try {
    const showtime = await Showtime.findById(req.params.id);
    if (showtime) {
      await showtime.deleteOne();
      res.json({ message: 'Đã xóa suất chiếu thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy suất chiếu' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
