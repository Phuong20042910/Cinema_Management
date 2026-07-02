import React, { useState, useEffect } from 'react';
import api from '../services/api';
import './CustomerPages.css';

function PromotionsPage() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const response = await api.get('/promotions');
        setPromotions(response.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách khuyến mãi", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPromotions();
  }, []);

  if (loading) {
    return (
      <div className="loading-screen fade-in">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="container page-container fade-in">
      <h1 className="page-title text-gradient">Ưu Đãi Đặc Quyền</h1>
      <p className="page-subtitle">Tận hưởng các khuyến mãi hấp dẫn chỉ dành riêng cho bạn</p>

      {promotions.length === 0 ? (
        <div className="text-center py-10 text-muted">Hiện tại chưa có chương trình khuyến mãi nào.</div>
      ) : (
        <div className="grid-cards cols-3">
          {promotions.map((promo, i) => (
            <div key={promo._id} className="promo-card slide-up" style={{ animationDelay: `${i * 0.15}s`}}>
              <img src={promo.image} alt={promo.title} className="promo-img" />
              <div className="card-content">
                <h2 className="card-title">{promo.title}</h2>
                <p className="card-desc line-clamp-2">{promo.description}</p>
                <div className="flex-between promo-code-box">
                  <span className="text-sm">Mã: <strong className="promo-code-text">{promo.code}</strong></span>
                  <button 
                    className="btn-icon"
                    onClick={() => {
                      navigator.clipboard.writeText(promo.code);
                      alert("Đã sao chép mã giảm giá!");
                    }}
                    title="Sao chép"
                  >
                    📋
                  </button>
                </div>
                <p className="text-xs text-muted text-right">
                  HSD: {new Date(promo.validUntil).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default PromotionsPage;
