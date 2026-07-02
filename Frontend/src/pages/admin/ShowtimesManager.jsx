import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './SaaS.css';
import { toast } from 'react-hot-toast';

function ShowtimesManager() {
  const [showtimes, setShowtimes] = useState([]);
  const [movies, setMovies] = useState([]);
  const [cinemas, setCinemas] = useState([]);
  
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    movie: '',
    cinema: '',
    startTime: '',
    price: 80000
  });

  const fetchData = async () => {
    try {
      const [stData, mvData, cnData] = await Promise.all([
        api.get('/showtimes'),
        api.get('/movies'),
        api.get('/cinemas')
      ]);
      setShowtimes(stData.data);
      setMovies(mvData.data);
      setCinemas(cnData.data);
    } catch (error) {
      toast.error('Lỗi tải dữ liệu');
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Hủy suất chiếu này? (Sẽ ảnh hưởng vé đã bán nếu có)")) {
      try {
        await api.delete(`/showtimes/${id}`);
        toast.success('Đã hủy suất chiếu');
        fetchData();
      } catch (error) {
        toast.error('Xóa thất bại');
      }
    }
  };

  const handleOpenModal = (showtime = null) => {
    if (showtime) {
      setEditingId(showtime._id);
      // Format datetime-local string
      const dateObj = new Date(showtime.startTime);
      const localIso = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000)).toISOString().slice(0,16);
      
      setFormData({
        movie: showtime.movie._id,
        cinema: showtime.cinema._id,
        startTime: localIso,
        price: showtime.price
      });
    } else {
      setEditingId(null);
      setFormData({ 
        movie: movies[0]?._id || '', 
        cinema: cinemas[0]?._id || '', 
        startTime: '', 
        price: 80000 
      });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/showtimes/${editingId}`, formData);
        toast.success('Cập nhật thành công');
      } else {
        await api.post('/showtimes', formData);
        toast.success('Đã tạo suất chiếu mới');
      }
      setShowModal(false);
      fetchData();
    } catch (error) {
      toast.error('Lưu thất bại');
    }
  };

  return (
    <div className="fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Lịch Chiếu & Suất</h1>
          <p className="text-secondary">Sắp xếp khung giờ chiếu cho các rạp</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>+ TẠO SUẤT CHIẾU</button>
      </div>

      <div className="panel bg-elevated">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b text-secondary">
              <th className="py-3 px-4">Phim</th>
              <th className="py-3 px-4">Cụm Rạp</th>
              <th className="py-3 px-4">Thời Gian</th>
              <th className="py-3 px-4">Giá Vé</th>
              <th className="py-3 px-4 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {showtimes.map(st => (
              <tr key={st._id} className="border-b hover:bg-white/5 transition-colors">
                <td className="py-3 px-4 font-bold">{st.movie?.title || 'Phim đã xóa'}</td>
                <td className="py-3 px-4">{st.cinema?.name || 'Rạp đã xóa'}</td>
                <td className="py-3 px-4 text-accent">{new Date(st.startTime).toLocaleString('vi-VN')}</td>
                <td className="py-3 px-4 text-success">{(st.price || 80000).toLocaleString()} đ</td>
                <td className="py-3 px-4 text-right flex justify-end gap-2">
                  <button className="btn-outline text-xs py-1 px-2" onClick={() => handleOpenModal(st)}>SỬA</button>
                  <button className="btn-outline text-xs py-1 px-2 text-primary border-primary" onClick={() => handleDelete(st._id)}>HỦY</button>
                </td>
              </tr>
            ))}
            {showtimes.length === 0 && (
              <tr><td colSpan="5" className="text-center py-6 text-muted">Chưa có suất chiếu nào.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content panel bg-elevated slide-up w-full max-w-md">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Sửa Suất Chiếu' : 'Tạo Suất Chiếu Mới'}</h2>
            <form className="flex flex-col gap-4" onSubmit={handleSave}>
              <div className="booking-field">
                <label>Phim</label>
                <select className="input-field" value={formData.movie} onChange={e => setFormData({...formData, movie: e.target.value})} required>
                  <option value="" disabled>-- Chọn Phim --</option>
                  {movies.map(m => <option key={m._id} value={m._id}>{m.title}</option>)}
                </select>
              </div>
              <div className="booking-field">
                <label>Cụm Rạp</label>
                <select className="input-field" value={formData.cinema} onChange={e => setFormData({...formData, cinema: e.target.value})} required>
                  <option value="" disabled>-- Chọn Rạp --</option>
                  {cinemas.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="grid-2-col gap-4">
                <div className="booking-field">
                  <label>Thời gian chiếu</label>
                  <input type="datetime-local" className="input-field" 
                    value={formData.startTime} onChange={e => setFormData({...formData, startTime: e.target.value})} required />
                </div>
                <div className="booking-field">
                  <label>Giá vé (VNĐ)</label>
                  <input type="number" min="0" step="1000" className="input-field" 
                    value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required />
                </div>
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

export default ShowtimesManager;
