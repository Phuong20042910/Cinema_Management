import Movie from '../models/Movie.js';
import Showtime from '../models/Showtime.js';
import Cinema from '../models/Cinema.js';

// @desc    Lấy danh sách tất cả các phim (Đồng bộ hoàn toàn từ TMDB)
// @route   GET /api/movies
// @access  Public
export const getMovies = async (req, res) => {
  try {
    // Xóa 2 phim seed cứng cũ để làm sạch danh sách
    await Movie.deleteMany({ title: { $in: ['Bí Ẩn Hành Tinh Chết', 'Đại Lộ Báo Thù'] } });

    // Chỉ dọn dẹp các phim cũ từ nguồn rapchieuphim.com trước đây để làm sạch database
    await Movie.deleteMany({ posterUrl: { $regex: 'rapchieuphim.com' } });

    const tmdbKey = process.env.TMDB_API_KEY;
    const tmdbBaseUrl = process.env.TMDB_BASE_URL || 'https://api.tmdb.org/3';

    if (!tmdbKey) {
      return res.status(400).json({ message: 'Thiếu cấu hình TMDB_API_KEY ở Backend/.env' });
    }

    try {
      console.log(`[Sync] Đang đồng bộ phim thực tế từ TMDB (${tmdbBaseUrl})...`);
      const nowPlayingUrl = `${tmdbBaseUrl}/movie/now_playing?api_key=${tmdbKey}&language=vi-VN&region=VN&page=1`;
      const upcomingUrl = `${tmdbBaseUrl}/movie/upcoming?api_key=${tmdbKey}&language=vi-VN&region=VN&page=1`;

      const genreMap = {
        28: 'Hành Động', 12: 'Phiêu Lưu', 16: 'Hoạt Hình', 35: 'Hài', 80: 'Tội Phạm',
        99: 'Tài Liệu', 18: 'Tâm Lý', 10751: 'Gia Đình', 14: 'Kỳ Ảo', 36: 'Lịch Sử',
        27: 'Kinh Dị', 10402: 'Âm Nhạc', 9648: 'Bí Ẩn', 10749: 'Lãng Mạn',
        878: 'Viễn Tưởng', 53: 'Gây Cấn', 10752: 'Chiến Tranh', 37: 'Miền Tây'
      };

      const [nowPlayingRes, upcomingRes] = await Promise.all([
        fetch(nowPlayingUrl).then(res => {
          if (!res.ok) throw new Error(`TMDB HTTP error! status: ${res.status}`);
          return res.json();
        }),
        fetch(upcomingUrl).then(res => {
          if (!res.ok) throw new Error(`TMDB HTTP error! status: ${res.status}`);
          return res.json();
        })
      ]);

      const existingMovies = await Movie.find({});
      const existingTitles = new Set(existingMovies.map(m => m.title.toLowerCase()));

      const newMovies = [];

      if (nowPlayingRes.results) {
        nowPlayingRes.results.forEach(m => {
          const titleLower = m.title.toLowerCase();
          if (!existingTitles.has(titleLower)) {
            // Generate a random duration between 95 and 150 mins
            const randomDuration = Math.floor(Math.random() * (150 - 95 + 1)) + 95;
            newMovies.push({
              title: m.title,
              originalTitle: m.original_title || m.title,
              duration: randomDuration,
              releaseDate: m.release_date ? new Date(m.release_date) : new Date(),
              genres: m.genre_ids ? m.genre_ids.map(id => genreMap[id]).filter(Boolean) : ['Hành Động'],
              description: m.overview || 'Chưa có tóm tắt cốt truyện.',
              posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '/assets/poster_placeholder.png',
              trailerUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(m.title + ' trailer')}`,
              director: 'Đang cập nhật',
              cast: ['Đang cập nhật'],
              status: 'NOW_SHOWING'
            });
          }
        });
      }

      if (upcomingRes.results) {
        upcomingRes.results.forEach(m => {
          const titleLower = m.title.toLowerCase();
          if (!existingTitles.has(titleLower)) {
            const randomDuration = Math.floor(Math.random() * (150 - 95 + 1)) + 95;
            newMovies.push({
              title: m.title,
              originalTitle: m.original_title || m.title,
              duration: randomDuration,
              releaseDate: m.release_date ? new Date(m.release_date) : new Date(),
              genres: m.genre_ids ? m.genre_ids.map(id => genreMap[id]).filter(Boolean) : ['Sắp Ra Mắt'],
              description: m.overview || 'Chưa có tóm tắt cốt truyện.',
              posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : '/assets/poster_placeholder.png',
              trailerUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(m.title + ' trailer')}`,
              director: 'Đang cập nhật',
              cast: ['Đang cập nhật'],
              status: 'COMING_SOON'
            });
          }
        });
      }

      if (newMovies.length > 0) {
        await Movie.insertMany(newMovies);
        console.log(`[Sync] Đã đồng bộ thêm ${newMovies.length} bộ phim thực tế từ TMDB vào MongoDB.`);
      }
    } catch (tmdbError) {
      console.error('[Sync Error] Lỗi khi đồng bộ phim từ TMDB:', tmdbError.message);
    }

    // Tự động tạo suất chiếu mẫu cho các phim thực tế từ TMDB để phục vụ việc kiểm tra đặt vé (nếu chưa có)
    const cinemas = await Cinema.find({});
    if (cinemas.length > 0) {
      const activeMovies = await Movie.find({});
      for (const m of activeMovies.slice(0, 8)) {
        const showtimeCount = await Showtime.countDocuments({ movie: m._id });
        if (showtimeCount === 0) {
          const mockShowtimes = [];
          // Tạo 3 suất chiếu trong 3 ngày tới
          for (let i = 0; i < 3; i++) {
            const date = new Date();
            date.setDate(date.getDate() + i);
            date.setHours(10 + i * 3, 30, 0, 0); // 10:30, 13:30, 16:30
            mockShowtimes.push({
              movie: m._id,
              cinema: cinemas[i % cinemas.length]._id,
              room: `Phòng ${i + 1}`,
              startTime: date,
              price: 75000 + (i * 10000)
            });
          }
          await Showtime.insertMany(mockShowtimes);
          console.log(`[Auto-Showtimes] Đã tự động tạo 3 suất chiếu cho phim "${m.title}".`);
        }
      }
    }

    // Dọn dẹp các suất chiếu mồ côi (không tương ứng với phim nào trong DB nữa)
    const movieIds = (await Movie.find({})).map(m => m._id);
    const deleteResult = await Showtime.deleteMany({ movie: { $nin: movieIds } });
    if (deleteResult.deletedCount > 0) {
      console.log(`[Clean] Đã xóa ${deleteResult.deletedCount} suất chiếu mồ côi khỏi MongoDB.`);
    }

    const movies = await Movie.find({});
    res.json(movies);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách phim', error: error.message });
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
