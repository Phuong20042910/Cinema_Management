import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './SaaS.css';
import { toast } from 'react-hot-toast';

function CinemasManager() {
  const [cinemas, setCinemas] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    location: '',
    screens: 1
  });

  const fetchCinemas = async () => {
    try {
      const response = await api.get('/cinemas');
      setCinemas(response.data);
    } catch (error) {
      toast.error('Lỗi lấy danh sách rạp');
    }
  };

  useEffect(() => {
    fetchCinemas();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Xóa rạp này sẽ ảnh hưởng đến các suất chiếu. Bạn chắc chứ?")) {
      try {
        await api.delete(`/cinemas/${id}`);
        toast.success('Đã xóa rạp');
        fetchCinemas();
      } catch (error) {
        toast.error('Xóa thất bại');
      }
    }
  };

  const handleOpenModal = (cinema = null) => {
    if (cinema) {
      setEditingId(cinema._id);
      setFormData({
        name: cinema.name,
        location: cinema.location,
        screens: cinema.screens || 1
      });
    } else {
      setEditingId(null);
      setFormData({ name: '', location: '', screens: 1 });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/cinemas/${editingId}`, formData);
        toast.success('Cập nhật rạp thành công');
      } else {
        await api.post('/cinemas', formData);
        toast.success('Đã thêm cụm rạp mới');
      }
      setShowModal(false);
      fetchCinemas();
    } catch (error) {
      toast.error('Lưu thất bại');
    }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Hệ thống Rạp</h1>
          <p className="text-secondary">Quản lý chi nhánh & phòng chiếu</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>+ THÊM RẠP MỚI</button>
      </div>

      <div className="grid-2-col gap-6">
        {cinemas.map(cinema => (
          <div key={cinema._id} className="panel bg-elevated slide-up">
            <h3 className="font-bold text-xl mb-1">{cinema.name}</h3>
            <p className="text-sm text-secondary mb-4 flex items-center gap-2">
              <span>📍 {cinema.location}</span>
            </p>
            <div className="flex justify-between items-center border-t border-b py-3 mb-4">
              <span className="text-sm">Số phòng chiếu:</span>
              <span className="font-bold">{cinema.screens || 'N/A'} phòng</span>
            </div>
            <div className="flex gap-2">
              <button className="btn-outline flex-1" onClick={() => handleOpenModal(cinema)}>CHỈNH SỬA</button>
              <button className="btn-outline flex-1 text-primary border-primary" onClick={() => handleDelete(cinema._id)}>XÓA</button>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content panel bg-elevated slide-up w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Sửa Thông Tin Rạp' : 'Thêm Cụm Rạp Mới'}</h2>
            <form className="flex flex-col gap-4" onSubmit={handleSave}>
              <div className="booking-field">
                <label>Tên Cụm Rạp</label>
                <input type="text" className="input-field" placeholder="VD: CinemaX Quận 1" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="booking-field">
                <label>Địa chỉ</label>
                <input type="text" className="input-field" placeholder="VD: 123 Lê Lợi, Q1" 
                  value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} required />
              </div>
              <div className="booking-field">
                <label>Số phòng chiếu</label>
                <input type="number" min="1" className="input-field" 
                  value={formData.screens} onChange={e => setFormData({...formData, screens: e.target.value})} required />
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

export default CinemasManager;
