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
    address: '',
    city: 'Hồ Chí Minh',
    lat: '',
    lng: '',
    rooms: [{ name: 'Phòng 1', capacity: 100 }]
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
        address: cinema.address || '',
        city: cinema.city || 'Hồ Chí Minh',
        lat: cinema.lat || '',
        lng: cinema.lng || '',
        rooms: cinema.rooms && cinema.rooms.length > 0 
          ? cinema.rooms.map(r => ({ name: r.name, capacity: r.capacity })) 
          : [{ name: 'Phòng 1', capacity: 100 }]
      });
    } else {
      setEditingId(null);
      setFormData({ 
        name: '', 
        address: '', 
        city: 'Hồ Chí Minh', 
        lat: '',
        lng: '',
        rooms: [{ name: 'Phòng 1', capacity: 100 }] 
      });
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

  const handleRoomChange = (index, field, value) => {
    const updatedRooms = [...formData.rooms];
    updatedRooms[index][field] = field === 'capacity' ? parseInt(value) || 0 : value;
    setFormData({ ...formData, rooms: updatedRooms });
  };

  const addRoom = () => {
    setFormData({
      ...formData,
      rooms: [...formData.rooms, { name: `Phòng ${formData.rooms.length + 1}`, capacity: 100 }]
    });
  };

  const removeRoom = (index) => {
    if (formData.rooms.length === 1) {
      toast.error('Cần ít nhất một phòng chiếu');
      return;
    }
    const updatedRooms = formData.rooms.filter((_, i) => i !== index);
    setFormData({ ...formData, rooms: updatedRooms });
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
              <span>📍 {cinema.address}, {cinema.city}</span>
            </p>
            <div className="flex justify-between items-center border-t border-b py-3 mb-4">
              <span className="text-sm">Phòng chiếu:</span>
              <span className="font-bold">{cinema.rooms?.length || 0} phòng</span>
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
          <div className="modal-content panel bg-elevated slide-up w-full max-w-lg" style={{ maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Sửa Thông Tin Rạp' : 'Thêm Cụm Rạp Mới'}</h2>
            <form className="flex flex-col gap-4" onSubmit={handleSave}>
              <div className="booking-field">
                <label>Tên Cụm Rạp</label>
                <input type="text" className="input-field" placeholder="VD: CinemaX Landmark 81" 
                  value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div className="grid-2-col gap-4">
                <div className="booking-field">
                  <label>Thành phố</label>
                  <select 
                    className="input-field"
                    value={formData.city} 
                    onChange={e => setFormData({...formData, city: e.target.value})} 
                    required
                  >
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Hải Phòng">Hải Phòng</option>
                    <option value="Cần Thơ">Cần Thơ</option>
                  </select>
                </div>
                <div className="booking-field">
                  <label>Địa chỉ</label>
                  <input type="text" className="input-field" placeholder="VD: Tầng B1, Vincom Center" 
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} required />
                </div>
              </div>
              <div className="grid-2-col gap-4">
                <div className="booking-field">
                  <label>Vĩ độ (Latitude)</label>
                  <input type="number" step="any" className="input-field" placeholder="VD: 10.7981" 
                    value={formData.lat} onChange={e => setFormData({...formData, lat: e.target.value})} />
                </div>
                <div className="booking-field">
                  <label>Kinh độ (Longitude)</label>
                  <input type="number" step="any" className="input-field" placeholder="VD: 106.7219" 
                    value={formData.lng} onChange={e => setFormData({...formData, lng: e.target.value})} />
                </div>
              </div>

              {/* Rooms Management Section */}
              <div className="border-t border-white/10 pt-4 mt-2">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="font-bold text-lg">Danh sách phòng chiếu</h4>
                  <button type="button" className="btn-outline py-1 px-3 text-xs" onClick={addRoom}>+ Thêm phòng</button>
                </div>
                <div className="flex flex-col gap-3">
                  {formData.rooms.map((room, index) => (
                    <div key={index} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        className="input-field flex-2" 
                        placeholder="Tên phòng (Phòng 1)" 
                        value={room.name} 
                        onChange={e => handleRoomChange(index, 'name', e.target.value)} 
                        required 
                      />
                      <input 
                        type="number" 
                        className="input-field flex-1" 
                        placeholder="Sức chứa" 
                        value={room.capacity} 
                        onChange={e => handleRoomChange(index, 'capacity', e.target.value)} 
                        required 
                        min="1"
                      />
                      <button 
                        type="button" 
                        className="btn-outline border-primary text-primary px-3 py-2 text-xs"
                        onClick={() => removeRoom(index)}
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end gap-2 mt-6 pt-4 border-t border-white/10">
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
