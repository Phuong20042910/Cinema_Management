import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { AuthContext } from '../../context/AuthContext';
import api from '../../services/api';
import './SaaS.css';

const REFRESH_INTERVAL_SEC = 30; // auto-refresh every 30 seconds

function AdminDashboard() {
  const { user } = useContext(AuthContext);
  const [stats, setStats] = useState({
    totalRevenue: 0,
    ticketsSold: 0,
    occupancyRate: 0,
    recentStats: [],
    recentBookings: []
  });
  const [loading, setLoading]       = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [countdown, setCountdown]   = useState(REFRESH_INTERVAL_SEC);
  const intervalRef  = useRef(null);
  const countdownRef = useRef(null);

  // ── Core fetch function ──────────────────────────────────────────────
  const fetchStats = useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const { data } = await api.get('/bookings/stats');
      const occRate = Math.min((data.ticketsSold / 1000) * 100, 100).toFixed(1);
      setStats({
        totalRevenue:   data.totalRevenue,
        ticketsSold:    data.ticketsSold,
        occupancyRate:  occRate,
        recentStats:    data.recentStats    || [],
        recentBookings: data.recentBookings || []
      });
      setLastUpdated(new Date());
    } catch (error) {
      console.error('Lỗi lấy dữ liệu dashboard', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setCountdown(REFRESH_INTERVAL_SEC); // reset countdown after each fetch
    }
  }, []);

  // ── Auto-refresh interval ─────────────────────────────────────────────
  const startAutoRefresh = useCallback(() => {
    // Clear any existing timers first
    clearInterval(intervalRef.current);
    clearInterval(countdownRef.current);

    // Countdown tick (every second)
    countdownRef.current = setInterval(() => {
      setCountdown(prev => (prev <= 1 ? REFRESH_INTERVAL_SEC : prev - 1));
    }, 1000);

    // Data fetch (every REFRESH_INTERVAL_SEC seconds)
    intervalRef.current = setInterval(() => {
      fetchStats(false);
    }, REFRESH_INTERVAL_SEC * 1000);
  }, [fetchStats]);

  // ── Mount: first load + start auto-refresh ────────────────────────────
  useEffect(() => {
    fetchStats(false);
    startAutoRefresh();
    return () => {
      clearInterval(intervalRef.current);
      clearInterval(countdownRef.current);
    };
  }, [fetchStats, startAutoRefresh]);

  // ── Manual refresh handler ────────────────────────────────────────────
  const handleManualRefresh = () => {
    fetchStats(true);
    startAutoRefresh(); // restart countdown
  };

  // ── Helpers ───────────────────────────────────────────────────────────
  const formatTime = (date) =>
    date ? date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }) : '—';

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p className="text-muted">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="saas-dashboard fade-in">

      {/* ── Dashboard Header ── */}
      <div className="dashboard-header mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Tổng quan kinh doanh</h1>
          <p className="text-secondary" style={{ marginTop: 4 }}>Dữ liệu thời gian thực — tự động làm mới</p>
        </div>

        {/* Live Refresh Controls */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          background: 'var(--color-bg-secondary)',
          border: '1px solid var(--color-border)',
          borderRadius: 'var(--radius-xl)',
          padding: '10px 18px',
          transition: 'background-color 0.3s ease',
        }}>
          {/* Live indicator dot */}
          <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              width: 9, height: 9, borderRadius: '50%',
              background: refreshing ? 'var(--color-accent)' : 'var(--color-success)',
              display: 'inline-block',
              animation: 'pulseGlow 1.8s ease-in-out infinite',
              boxShadow: refreshing
                ? '0 0 0 0 rgba(245,158,11,0.7)'
                : '0 0 0 0 rgba(16,185,129,0.7)',
            }}></span>
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--color-text-muted)', letterSpacing: '0.5px' }}>
              {refreshing ? 'ĐANG CẬP NHẬT...' : 'LIVE'}
            </span>
          </span>

          {/* Countdown ring */}
          <span style={{ fontSize: 12, color: 'var(--color-text-muted)', minWidth: 56 }}>
            🔄 {countdown}s
          </span>

          {/* Last updated time */}
          {lastUpdated && (
            <span style={{ fontSize: 11, color: 'var(--color-text-muted)', borderLeft: '1px solid var(--color-border)', paddingLeft: 12 }}>
              Cập nhật lúc {formatTime(lastUpdated)}
            </span>
          )}

          {/* Manual refresh button */}
          <button
            onClick={handleManualRefresh}
            disabled={refreshing}
            title="Làm mới ngay"
            style={{
              background: refreshing ? 'transparent' : 'var(--color-primary)',
              color: 'white',
              border: refreshing ? '1px solid var(--color-border)' : 'none',
              borderRadius: 'var(--radius-md)',
              padding: '6px 14px',
              fontSize: 12,
              fontWeight: 700,
              cursor: refreshing ? 'not-allowed' : 'pointer',
              opacity: refreshing ? 0.5 : 1,
              transition: 'all 0.2s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            <span style={{ display: 'inline-block', animation: refreshing ? 'spin 0.9s linear infinite' : 'none' }}>
              ↻
            </span>
            {refreshing ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="kpi-grid grid-3-col mb-8">
        <div className="kpi-card slide-up">
          <span className="kpi-icon">💰</span>
          <p className="kpi-label">TỔNG DOANH THU</p>
          <h2 className="kpi-value text-success">
            {stats.totalRevenue.toLocaleString('vi-VN')} ₫
          </h2>
          <p className="kpi-trend text-success">↑ Tất cả thời gian</p>
        </div>

        <div className="kpi-card slide-up delay-100">
          <span className="kpi-icon">🎫</span>
          <p className="kpi-label">SỐ VÉ ĐÃ BÁN</p>
          <h2 className="kpi-value">{stats.ticketsSold.toLocaleString('vi-VN')}</h2>
          <p className="kpi-trend text-secondary">Đã thanh toán thành công</p>
        </div>

        <div className="kpi-card slide-up delay-200">
          <span className="kpi-icon">📈</span>
          <p className="kpi-label">TỶ LỆ LẤP ĐẦY (ƯỚC TÍNH)</p>
          <h2 className="kpi-value text-accent">{stats.occupancyRate}%</h2>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${stats.occupancyRate}%` }}></div>
          </div>
        </div>
      </div>

      {/* ── Charts & Transactions ── */}
      <div className="grid-2-col gap-6">

        {/* Revenue Chart */}
        <div className="panel slide-up delay-300">
          <div className="flex justify-between items-center mb-4">
            <h3 className="panel-title">📊 Doanh Thu 7 Ngày Qua</h3>
          </div>
          <div className="fake-chart flex items-end gap-2">
            {stats.recentStats.map((item, i) => {
              const maxRev = Math.max(...stats.recentStats.map(s => s.revenue), 1);
              const height = Math.max((item.revenue / maxRev) * 100, item.revenue > 0 ? 4 : 0);
              return (
                <div
                  key={i}
                  className="chart-bar"
                  style={{ height: `${height}%`, animationDelay: `${i * 0.08}s` }}
                >
                  <div className="bar-tooltip">{item.revenue.toLocaleString('vi-VN')} ₫</div>
                </div>
              );
            })}
            {stats.recentStats.length === 0 && (
              <div className="w-full text-center text-muted flex items-center justify-center" style={{ height: '100%' }}>
                Chưa có dữ liệu
              </div>
            )}
          </div>
          <div className="chart-labels">
            {stats.recentStats.map((item, i) => {
              const d = new Date(item.date);
              return <span key={i}>{d.getDate()}/{d.getMonth() + 1}</span>;
            })}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="panel slide-up delay-400">
          <div className="flex justify-between items-center mb-4">
            <h3 className="panel-title">🧾 Giao Dịch Gần Đây</h3>
            <span style={{
              background: 'rgba(16,185,129,0.1)',
              color: 'var(--color-success)',
              border: '1px solid rgba(16,185,129,0.25)',
              borderRadius: 'var(--radius-full)',
              fontSize: 11,
              fontWeight: 700,
              padding: '3px 10px',
              letterSpacing: '0.5px',
            }}>
              {stats.recentBookings.length} đơn mới nhất
            </span>
          </div>

          <div className="transaction-list">
            {stats.recentBookings.map((b, i) => (
              <div
                key={b._id}
                className="transaction-item"
                style={{ animationDelay: `${i * 0.07}s` }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: '50%',
                    background: 'linear-gradient(135deg, var(--color-primary), #fb7185)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 900, color: 'white', fontSize: 14, flexShrink: 0,
                  }}>
                    {(b.user?.name || 'K').charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p style={{ fontWeight: 700, fontSize: 14, color: 'var(--color-text-primary)' }}>
                      {b.user?.name || 'Khách vãng lai'}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                      🎬 {b.showtime?.movie?.title || '—'}
                    </p>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ fontWeight: 800, color: 'var(--color-success)', fontSize: 15 }}>
                    +{b.totalAmount.toLocaleString('vi-VN')} ₫
                  </p>
                  <p style={{ fontSize: 11, color: 'var(--color-text-muted)', marginTop: 2 }}>
                    {new Date(b.createdAt).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            ))}

            {stats.recentBookings.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--color-text-muted)' }}>
                🎫 Chưa có giao dịch nào
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
