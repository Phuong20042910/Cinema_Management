import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import './SaaS.css';
import { toast } from 'react-hot-toast';

function MoviesManager() {
  const [movies, setMovies] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    duration: '',
    posterUrl: '',
    status: 'Đang chiếu'
  });

  const fetchMovies = async () => {
    try {
      const response = await api.get('/movies');
      setMovies(response.data);
    } catch (error) {
      toast.error('Lỗi lấy danh sách phim');
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc muốn xóa phim này?")) {
      try {
        await api.delete(`/movies/${id}`);
        toast.success('Xóa phim thành công');
        fetchMovies();
      } catch (error) {
        toast.error('Xóa thất bại');
      }
    }
  };

  const handleOpenModal = (movie = null) => {
    if (movie) {
      setEditingId(movie._id);
      setFormData({
        title: movie.title,
        description: movie.description || '',
        duration: movie.duration,
        posterUrl: movie.posterUrl,
        status: movie.status || 'Đang chiếu'
      });
    } else {
      setEditingId(null);
      setFormData({ title: '', description: '', duration: '', posterUrl: '', status: 'Đang chiếu' });
    }
    setShowModal(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/movies/${editingId}`, formData);
        toast.success('Cập nhật phim thành công');
      } else {
        await api.post('/movies', formData);
        toast.success('Thêm phim mới thành công');
      }
      setShowModal(false);
      fetchMovies();
    } catch (error) {
      toast.error('Lưu phim thất bại');
    }
  };

  return (
    <div className="movies-manager fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Phim</h1>
          <p className="text-secondary">Quản lý kho nội dung của rạp</p>
        </div>
        <button className="btn-primary" onClick={() => handleOpenModal()}>+ THÊM PHIM MỚI</button>
      </div>

      <div className="movie-grid">
        {movies.map(movie => (
          <div key={movie._id} className="panel bg-elevated slide-up">
            <div className="flex gap-4">
              <img src={movie.posterUrl} alt={movie.title} className="w-24 h-36 object-cover rounded" />
              <div className="flex-1">
                <h3 className="font-bold text-lg">{movie.title}</h3>
                <p className="text-xs text-muted mb-2">{movie.genres?.join(', ')}</p>
                <span className={`badge ${movie.status === 'Đang chiếu' ? 'success' : 'warning'}`}>
                  {movie.status || 'NOW_SHOWING'}
                </span>
                <div className="mt-4 flex gap-2">
                  <button className="btn-outline text-xs py-1 px-3" onClick={() => handleOpenModal(movie)}>SỬA</button>
                  <button className="btn-outline text-xs py-1 px-3 text-primary border-primary" onClick={() => handleDelete(movie._id)}>XÓA</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content panel bg-elevated slide-up w-full max-w-lg">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Sửa Phim' : 'Thêm Phim Mới'}</h2>
            <form className="flex flex-col gap-4" onSubmit={handleSave}>
              <div className="booking-field">
                <label>Tên Phim</label>
                <input type="text" className="input-field" placeholder="Nhập tên phim..." 
                  value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              </div>
              <div className="grid-2-col gap-4">
                <div className="booking-field">
                  <label>Thời lượng (phút)</label>
                  <input type="number" className="input-field" 
                    value={formData.duration} onChange={e => setFormData({...formData, duration: e.target.value})} required />
                </div>
                <div className="booking-field">
                  <label>Trạng thái</label>
                  <select className="input-field" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="Đang chiếu">Đang chiếu</option>
                    <option value="Sắp chiếu">Sắp chiếu</option>
                    <option value="Ngưng chiếu">Ngưng chiếu</option>
                  </select>
                </div>
              </div>
              <div className="booking-field">
                <label>URL Poster</label>
                <input type="text" className="input-field" placeholder="https://..." 
                  value={formData.posterUrl} onChange={e => setFormData({...formData, posterUrl: e.target.value})} required />
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

export default MoviesManager;
