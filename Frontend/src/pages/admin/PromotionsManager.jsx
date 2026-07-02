import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './SaaS.css';
import { toast } from 'react-hot-toast';

function PromotionsManager() {
  const [promotions, setPromotions] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code: '',
    discountPercent: 10,
    validUntil: '',
    image: ''
  });

  const fetchPromotions = async () => {
    try {
      const response = await api.get('/promotions');
      setPromotions(response.data);
    } catch (error) {
      toast.error('Lỗi lấy danh sách khuyến mãi');
    }
  };

  useEffect(() => {
    fetchPromotions();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Xóa thẻ khuyến mãi này? Khách hàng sẽ không thể dùng mã này nữa!")) {
      try {
        await api.delete(`/promotions/${id}`);
        toast.success('Xóa khuyến mãi thành công');
        fetchPromotions();
      } catch (error) {
        toast.error('Xóa thất bại');
      }
    }
  };

  const handleOpenModal = (promo = null) => {
    if (promo) {
      setEditingId(promo._id);
      const dateObj = new Date(promo.validUntil);
      const localDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().split('T')[0];
      setFormData({
        title: promo.title,
        description: promo.description,
        code: promo.code,
        discountPercent: promo.discountPercent,
        validUntil: localDate,
        image: promo.image
      });
    } else {
      setEditingId(null);
      setFormData({ 
        title: '', 
        description: '', 
        code: '', 
        discountPercent: 10, 
        validUntil: '', 
        image: '' 
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/promotions/${editingId}`, formData);
        toast.success('Cập nhật khuyến mãi thành công');
      } else {
        await api.post('/promotions', formData);
        toast.success('Đã tạo thẻ khuyến mãi mới');
      }
      setShowModal(false);
      fetchPromotions();
    } catch (error) {
      toast.error('Lưu khuyến mãi thất bại');
    }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Khuyến Mãi & Voucher</h1>
          <p className="text-secondary">Tạo các thẻ giảm giá để thu hút khách hàng</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>+ TẠO VOUCHER MỚI</button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {promotions.map(promo => (
          <div key={promo._id} className="panel bg-elevated slide-up overflow-hidden p-0 border border-white/5">
            <div className="flex flex-col md:flex-row h-full">
              <img src={promo.image} alt={promo.title} className="w-full md:w-32 h-32 object-cover" />
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start mb-1">
                    <h3 className="font-bold text-lg text-primary">{promo.title}</h3>
                    <span className="badge hot">-{promo.discountPercent}%</span>
                  </div>
                  <p className="text-xs text-muted mb-2 line-clamp-2">{promo.description}</p>
                </div>
                <div className="flex justify-between items-center mt-2 border-t border-white/10 pt-2">
                  <div className="text-sm">
                    Mã: <strong className="text-white font-mono">{promo.code}</strong>
                  </div>
                  <div className="flex gap-2">
                    <button className="btn-outline text-xs py-1 px-2" onClick={() => handleOpenModal(promo)}>SỬA</button>
                    <button className="btn-outline text-xs py-1 px-2 text-primary border-primary" onClick={() => handleDelete(promo._id)}>XÓA</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content panel bg-elevated slide-up w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Sửa Khuyến Mãi' : 'Tạo Mã Khuyến Mãi'}</h2>
            <form className="flex flex-col gap-4" onSubmit={handleSave}>
              <div className="booking-field">
                <label>Tiêu đề</label>
                <input type="text" className="input-field" placeholder="VD: Giảm 50% Cuối tuần" 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="booking-field">
                <label>Mô tả chi tiết</label>
                <textarea className="input-field min-h-[80px]" placeholder="Điều kiện áp dụng..." 
                  value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required></textarea>
              </div>
              
              <div className="grid-2-col gap-4">
                <div className="booking-field">
                  <label>Mã Giảm Giá (Code)</label>
                  <input type="text" className="input-field font-mono text-primary uppercase" placeholder="SALE50" 
                    value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} required />
                </div>
                <div className="booking-field">
                  <label>Mức giảm (%)</label>
                  <input type="number" min="0" max="100" className="input-field" 
                    value={formData.discountPercent} onChange={e => setFormData({...formData, discountPercent: e.target.value})} required />
                </div>
              </div>
              
              <div className="booking-field">
                <label>Hạn sử dụng</label>
                <input type="date" className="input-field" 
                  value={formData.validUntil} onChange={e => setFormData({...formData, validUntil: e.target.value})} required />
              </div>
              <div className="booking-field">
                <label>Hình ảnh (URL)</label>
                <input type="text" className="input-field" placeholder="https://..." 
                  value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} required />
              </div>
              <div className="flex justify-end gap-2 mt-4">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>Hủy</button>
                <button type="submit" className="btn-primary">LƯU LẠI</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default PromotionsManager;
