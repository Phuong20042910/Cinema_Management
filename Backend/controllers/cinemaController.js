import Cinema from '../models/Cinema.js';

// @desc    Lấy danh sách các rạp
// @route   GET /api/cinemas
// @access  Public
export const getCinemas = async (req, res) => {
  try {
    try {
      // 1. Fetch live data từ API rạp chiếu phim thực tế ở Việt Nam
      const response = await fetch('https://rapchieuphim.com/api/v1/cinemas');
      if (response.ok) {
        const externalCinemas = await response.json();
        
        // 2. Lấy danh sách rạp hiện có trong Database để tránh trùng lặp
        const existingCinemas = await Cinema.find({});
        const existingNames = new Set(existingCinemas.map(c => c.name.toLowerCase()));

        // 3. Lọc và chuẩn hóa những cụm rạp chưa có trong database
        const newCinemas = [];
        for (const ec of externalCinemas) {
          const nameLower = ec.name.toLowerCase();
          if (!existingNames.has(nameLower)) {
            newCinemas.push({
              name: ec.name,
              address: ec.address || 'Đang cập nhật địa chỉ',
              city: ec.city || 'Hồ Chí Minh',
              lat: parseFloat(ec.geo_lat) || null,
              lng: parseFloat(ec.geo_long) || null,
              rooms: [
                { name: 'Phòng 1', capacity: 100 },
                { name: 'Phòng 2', capacity: 80 }
              ]
            });
          }
        }

        // 4. Lưu nhanh vào database nếu có rạp mới
        if (newCinemas.length > 0) {
          await Cinema.insertMany(newCinemas);
          console.log(`[Sync] Đã đồng bộ thêm ${newCinemas.length} cụm rạp thực tế vào MongoDB.`);
        }
      }
    } catch (fetchError) {
      console.error('[Sync Error] Không thể kết nối tới API rạp chiếu ngoài:', fetchError.message);
    }

    // 5. Trả về toàn bộ danh sách rạp từ database của bạn
    const cinemas = await Cinema.find({});
    res.json(cinemas);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách rạp', error: error.message });
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
      cinema.address = req.body.address || cinema.address;
      cinema.city = req.body.city || cinema.city;
      cinema.lat = req.body.lat !== undefined ? req.body.lat : cinema.lat;
      cinema.lng = req.body.lng !== undefined ? req.body.lng : cinema.lng;
      cinema.rooms = req.body.rooms || cinema.rooms;

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
