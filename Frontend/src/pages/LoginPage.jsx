import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';
import './Auth.css';

import { toast } from 'react-hot-toast';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post('/auth/login', { email, password });
      login(response.data);
      
      const role = response.data.role;
      toast.success(`Đăng nhập thành công! Xin chào ${role.toUpperCase()}`);

      if (role === 'admin' || role === 'staff') {
        navigate('/dashboard');
      } else {
        navigate('/');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Lỗi đăng nhập');
      setError(err.response?.data?.message || 'Lỗi đăng nhập');
    }
  };

  return (
    <div className="auth-page fade-in">
      <div className="auth-container slide-up">
        <h2 className="auth-title">ĐĂNG NHẬP</h2>
        {error && <div className="auth-error">{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form flex-col gap-4">
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
          <button type="submit" className="btn-primary auth-submit">Đăng Nhập</button>
        </form>
        <p className="auth-footer">
          Chưa có tài khoản? <Link to="/register" className="auth-link">Đăng ký ngay</Link>
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
