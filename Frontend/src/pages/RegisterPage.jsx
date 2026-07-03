import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import { Container, Row, Col, Card, Button, Form, Alert } from 'react-bootstrap';
import { toast } from 'react-hot-toast';
import './Auth.css';

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
    <div className="auth-page fade-in d-flex align-items-center py-5" style={{ minHeight: '80vh', marginTop: '80px' }}>
      <Container>
        <Row className="justify-content-center">
          <Col md={6} lg={4}>
            <Card className="auth-container border-0 shadow-lg p-4 bg-elevated">
              <Card.Body className="p-0">
                <h2 className="auth-title text-center mb-4 fw-bold text-gradient">ĐĂNG KÝ</h2>
                
                {error && <Alert variant="danger" className="py-2 text-center">{error}</Alert>}
                
                <Form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
                  <Form.Group controlId="register-name">
                    <Form.Label className="form-label text-muted small fw-bold">Họ tên</Form.Label>
                    <Form.Control 
                      type="text" 
                      placeholder="Nhập họ và tên..." 
                      className="input-field border-0 bg-secondary-subtle"
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                    />
                  </Form.Group>

                  <Form.Group controlId="register-email">
                    <Form.Label className="form-label text-muted small fw-bold">Email</Form.Label>
                    <Form.Control 
                      type="email" 
                      placeholder="Nhập email..." 
                      className="input-field border-0 bg-secondary-subtle"
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                    />
                  </Form.Group>

                  <Form.Group controlId="register-password">
                    <Form.Label className="form-label text-muted small fw-bold">Mật khẩu</Form.Label>
                    <Form.Control 
                      type="password" 
                      placeholder="Nhập mật khẩu..." 
                      className="input-field border-0 bg-secondary-subtle"
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                    />
                  </Form.Group>

                  <Button type="submit" variant="primary" className="auth-submit w-100 py-2.5 mt-3 fw-bold">
                    Đăng Ký
                  </Button>
                </Form>

                <p className="auth-footer text-center mt-4 mb-0 text-muted small">
                  Đã có tài khoản? <Link to="/login" className="auth-link fw-bold text-primary text-decoration-none">Đăng nhập</Link>
                </p>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
}

export default RegisterPage;
