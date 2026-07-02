import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './SaaS.css';

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ticketsSold: 0,
    occupancyRate: 0,
    recentStats: [],
    recentBookings: []
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/bookings/stats');
        
        // Vẫn giữ lại giả định số ghế max mỗi ngày là 1000 cho tỷ lệ lấp đầy
        const occRate = Math.min((data.ticketsSold / 1000) * 100, 100).toFixed(1);

        setStats({
          totalRevenue: data.totalRevenue,
          ticketsSold: data.ticketsSold,
          occupancyRate: occRate,
          recentStats: data.recentStats || [],
          recentBookings: data.recentBookings || []
        });
      } catch (error) {
        console.error("Lỗi lấy dữ liệu dashboard", error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div className="saas-dashboard fade-in">
      
      <div className="dashboard-header mb-8">
        <h1 className="text-3xl font-bold">Tổng quan kinh doanh</h1>
        <p className="text-secondary">Dữ liệu thời gian thực (Real-time)</p>
      </div>

      {/* KPI Cards */}
      <div className="kpi-grid grid-3-col mb-8">
        <div className="kpi-card bg-elevated slide-up">
          <p className="kpi-label">TỔNG DOANH THU</p>
          <h2 className="kpi-value text-success">{stats.totalRevenue.toLocaleString()} ₫</h2>
        </div>
        <div className="kpi-card bg-elevated slide-up delay-100">
          <p className="kpi-label">SỐ VÉ ĐÃ BÁN</p>
          <h2 className="kpi-value">{stats.ticketsSold}</h2>
        </div>
        <div className="kpi-card bg-elevated slide-up delay-200">
          <p className="kpi-label">TỶ LỆ LẤP ĐẦY (ƯỚC TÍNH)</p>
          <h2 className="kpi-value text-accent">{stats.occupancyRate}%</h2>
          <div className="progress-bar-bg mt-2">
            <div className="progress-bar-fill bg-accent" style={{width: `${stats.occupancyRate}%`}}></div>
          </div>
        </div>
      </div>

      {/* Charts & Tables Area */}
      <div className="grid-2-col gap-6">
        
        {/* Dynamic Chart Area */}
        <div className="panel bg-elevated slide-up delay-300">
          <h3 className="panel-title mb-4">Biểu đồ Doanh Thu (7 ngày qua)</h3>
          <div className="fake-chart flex items-end gap-2">
            {stats.recentStats.map((item, i) => {
              const maxRev = Math.max(...stats.recentStats.map(s => s.revenue), 1);
              const height = (item.revenue / maxRev) * 100;
              return (
                <div 
                  key={i} 
                  className="chart-bar group relative" 
                  style={{height: `${height}%`}}
                >
                  <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black px-2 py-1 text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.revenue.toLocaleString()} ₫
                  </div>
                </div>
              )
            })}
            {stats.recentStats.length === 0 && (
              <div className="w-full text-center text-muted flex items-center justify-center h-full">Đang tải biểu đồ...</div>
            )}
          </div>
          <div className="chart-labels flex justify-between mt-2 text-xs text-muted">
            {stats.recentStats.map((item, i) => {
              const date = new Date(item.date);
              return <span key={i}>{date.getDate()}/{date.getMonth()+1}</span>
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="panel bg-elevated slide-up delay-400">
          <h3 className="panel-title mb-4">Giao dịch gần đây</h3>
          <div className="transaction-list">
            {stats.recentBookings.map(b => (
              <div key={b._id} className="transaction-item flex justify-between items-center py-3 border-b">
                <div>
                  <p className="font-bold">{b.user?.name || 'Khách vãng lai'}</p>
                  <p className="text-xs text-secondary">{b.showtime?.movie?.title}</p>
                </div>
                <div className="text-right">
                  <p className="text-success font-bold">+{b.totalAmount.toLocaleString()} ₫</p>
                  <p className="text-xs text-muted">{new Date(b.createdAt).toLocaleString('vi-VN')}</p>
                </div>
              </div>
            ))}
            {stats.recentBookings.length === 0 && <p className="text-muted text-sm">Chưa có giao dịch nào.</p>}
          </div>
        </div>

      </div>
    </div>
  );
}

export default AdminDashboard;

