import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

import { toast } from 'react-hot-toast';

function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/auth/register', { name, email, password });
      toast.success('Đăng ký thành công! Đang chuyển đến trang Đăng nhập...');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi đăng ký');
      setError(err.response?.data?.message || 'Lỗi đăng ký');
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-container slide-up">
        <h2 className="auth-title">ĐĂNG KÝ</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form flex-col gap-4">
          <div className="form-group">
            <label className="form-label">Họ tên</label>
            <input 
              type="text" 
              className="input-field"
              value={name} onChange={(e) => setName(e.target.value)} required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              type="email" 
              className="input-field"
              value={email} onChange={(e) => setEmail(e.target.value)} required 
            />
          </div>
          <div className="form-group">
            <label className="form-label">Mật khẩu</label>
            <input 
              type="password" 
              className="input-field"
              value={password} onChange={(e) => setPassword(e.target.value)} required 
            />
          </div>
          <button type="submit" className="btn-primary auth-submit">Đăng Ký</button>
        </form>
        <p className="auth-footer">
          Đã có tài khoản? <Link to="/login" className="auth-link">Đăng nhập</Link>
        </p>
      </div>
    </div>
  );
}

export default RegisterPage;
