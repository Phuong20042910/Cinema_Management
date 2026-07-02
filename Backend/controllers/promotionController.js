import Promotion from '../models/Promotion.js';

// @desc    Lấy danh sách khuyến mãi (còn hạn)
// @route   GET /api/promotions
// @access  Public
export const getPromotions = async (req, res) => {
  try {
    const promotions = await Promotion.find({}).sort({ validUntil: 1 });
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách khuyến mãi' });
  }
};

// @desc    Tạo mã khuyến mãi mới
// @route   POST /api/promotions
// @access  Private/Admin
export const createPromotion = async (req, res) => {
  try {
    const promotion = new Promotion(req.body);
    const createdPromotion = await promotion.save();
    res.status(201).json(createdPromotion);
  } catch (error) {
    res.status(400).json({ message: 'Dữ liệu khuyến mãi không hợp lệ', error });
  }
};

// @desc    Cập nhật khuyến mãi
// @route   PUT /api/promotions/:id
// @access  Private/Admin
export const updatePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (promotion) {
      promotion.title = req.body.title || promotion.title;
      promotion.description = req.body.description || promotion.description;
      promotion.code = req.body.code || promotion.code;
      promotion.discountPercent = req.body.discountPercent || promotion.discountPercent;
      promotion.validUntil = req.body.validUntil || promotion.validUntil;
      promotion.image = req.body.image || promotion.image;

      const updatedPromotion = await promotion.save();
      res.json(updatedPromotion);
    } else {
      res.status(404).json({ message: 'Không tìm thấy khuyến mãi' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Dữ liệu cập nhật không hợp lệ', error });
  }
};

// @desc    Xóa khuyến mãi
// @route   DELETE /api/promotions/:id
// @access  Private/Admin
export const deletePromotion = async (req, res) => {
  try {
    const promotion = await Promotion.findById(req.params.id);
    if (promotion) {
      await promotion.deleteOne();
      res.json({ message: 'Đã xóa khuyến mãi thành công' });
    } else {
      res.status(404).json({ message: 'Không tìm thấy khuyến mãi' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server' });
  }
};
