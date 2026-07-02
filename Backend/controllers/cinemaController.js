import Cinema from '../models/Cinema.js';

// @desc    Lấy danh sách các rạp
// @route   GET /api/cinemas
// @access  Public
export const getCinemas = async (req, res) => {
  try {
    const cinemas = await Cinema.find({});
    res.json(cinemas);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách rạp' });
  }
};
// @desc    Lấy thông tin 1 rạp theo ID
// @route   GET /api/cinemas/:id
// @access  Public
export const getCinemaById = async (req, res) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (cinema) {
      res.json(cinema);
    } else {
      res.status(404).json({ message: 'Không tìm thấy rạp' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Thêm rạp mới
// @route   POST /api/cinemas
// @access  Private/Admin
export const createCinema = async (req, res) => {
  try {
    const cinema = new Cinema(req.body);
    const createdCinema = await cinema.save();
    res.status(201).json(createdCinema);
  } catch (error) {
    res.status(400).json({ message: 'Dữ liệu rạp không hợp lệ', error });
  }
};

// @desc    Cập nhật thông tin rạp
// @route   PUT /api/cinemas/:id
// @access  Private/Admin
export const updateCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (cinema) {
      cinema.name = req.body.name || cinema.name;
      cinema.location = req.body.location || cinema.location;
      cinema.screens = req.body.screens || cinema.screens;

      const updatedCinema = await cinema.save();
      res.json(updatedCinema);
    } else {
      res.status(404).json({ message: 'Không tìm thấy rạp' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Dữ liệu cập nhật không hợp lệ', error });
  }
};

// @desc    Xóa rạp
// @route   DELETE /api/cinemas/:id
// @access  Private/Admin
export const deleteCinema = async (req, res) => {
  try {
    const cinema = await Cinema.findById(req.params.id);
    if (cinema) {
      await cinema.deleteOne();
      res.json({ message: 'Đã xóa rạp thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy rạp' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
