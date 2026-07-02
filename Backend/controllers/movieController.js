import Movie from '../models/Movie.js';

// @desc    Lấy danh sách tất cả các phim
// @route   GET /api/movies
// @access  Public
export const getMovies = async (req, res) => {
  try {
    const movies = await Movie.find({});
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách phim' });
  }
};

// @desc    Lấy thông tin 1 phim theo ID
// @route   GET /api/movies/:id
// @access  Public
export const getMovieById = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (movie) {
      res.json(movie);
    } else {
      res.status(404).json({ message: 'Không tìm thấy phim' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Thêm phim mới
// @route   POST /api/movies
// @access  Private/Admin
export const createMovie = async (req, res) => {
  try {
    const movie = new Movie(req.body);
    const createdMovie = await movie.save();
    res.status(201).json(createdMovie);
  } catch (error) {
    res.status(400).json({ message: 'Dữ liệu không hợp lệ', error });
  }
};

// @desc    Xóa phim
// @route   DELETE /api/movies/:id
// @access  Private/Admin
export const deleteMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (movie) {
      await movie.deleteOne();
      res.json({ message: 'Đã xóa phim thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy phim' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};

// @desc    Cập nhật phim
// @route   PUT /api/movies/:id
// @access  Private/Admin
export const updateMovie = async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (movie) {
      movie.title = req.body.title || movie.title;
      movie.description = req.body.description || movie.description;
      movie.duration = req.body.duration || movie.duration;
      movie.genres = req.body.genres || movie.genres;
      movie.director = req.body.director || movie.director;
      movie.cast = req.body.cast || movie.cast;
      movie.releaseDate = req.body.releaseDate || movie.releaseDate;
      movie.posterUrl = req.body.posterUrl || movie.posterUrl;
      movie.trailerUrl = req.body.trailerUrl || movie.trailerUrl;
      movie.status = req.body.status || movie.status;

      const updatedMovie = await movie.save();
      res.json(updatedMovie);
    } else {
      res.status(404).json({ message: 'Không tìm thấy phim' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Dữ liệu cập nhật không hợp lệ', error });
  }
};
