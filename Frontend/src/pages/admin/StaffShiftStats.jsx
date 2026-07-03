import React, { useState, useEffect, useCallback, useRef } from 'react';
import api from '../../services/api';
import './SaaS.css';

const REFRESH_SEC = 60;

function StaffShiftStats() {
  const [bookings,    setBookings]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [refreshing,  setRefreshing]  = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [countdown,   setCountdown]   = useState(REFRESH_SEC);
  const intervalRef   = useRef(null);
  const countdownRef  = useRef(null);

  const fetchBookings = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const { data } = await api.get('/bookings');
      setBookings(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Lỗi lấy dữ liệu ca làm', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setCountdown(REFRESH_SEC);
    }
  }, []);

  const startAuto = useCallback(() => {
    clearInterval(intervalRef.current);
    clearInterval(countdownRef.current);
    countdownRef.current = setInterval(() => setCountdown(p => p <= 1 ? REFRESH_SEC : p - 1), 1000);
    intervalRef.current  = setInterval(() => fetchBookings(false), REFRESH_SEC * 1000);
  }, [fetchBookings]);

  useEffect(() => {
    fetchBookings();
    startAuto();
    return () => { clearInterval(intervalRef.current); clearInterval(countdownRef.current); };
  }, [fetchBookings, startAuto]);

  // ── Derived stats from bookings ─────────────────────────────────────
  const todayStr = new Date().toDateString();

  const todayBookings = bookings.filter(b => new Date(b.createdAt).toDateString() === todayStr);
  const todayCompleted = todayBookings.filter(b => b.paymentStatus === 'COMPLETED');
  const todayPending   = todayBookings.filter(b => b.paymentStatus === 'PENDING');
  const todayRevenue   = todayCompleted.reduce((s, b) => s + b.totalAmount, 0);
  const todayTickets   = todayCompleted.reduce((s, b) => s + b.seats.length, 0);
  const todayCheckedIn = todayBookings.filter(b => b.ticketStatus === 'USED').length;

  // Revenue by hour (for mini chart)
  const hourlyRevenue = Array.from({ length: 24 }, (_, h) => {
    const revenue = todayCompleted
      .filter(b => new Date(b.createdAt).getHours() === h)
      .reduce((s, b) => s + b.totalAmount, 0);
    return { hour: h, revenue };
  }).filter((_, h) => h >= 7 && h <= 23); // Show 7AM–11PM

  const maxRevHour = Math.max(...hourlyRevenue.map(h => h.revenue), 1);

  // Top movies today
  const movieCount = todayCompleted.reduce((acc, b) => {
    const title = b.showtime?.movie?.title || 'Không rõ';
    acc[title] = (acc[title] || 0) + b.seats.length;
    return acc;
  }, {});
  const topMovies = Object.entries(movieCount).sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (loading) return (
    <div className="flex items-center justify-center" style={{ minHeight: '50vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
        <p className="text-muted">Đang tải dữ liệu ca làm...</p>
      </div>
    </div>
  );

  const todayLabel = new Date().toLocaleDateString('vi-VN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  return (
    <div className="fade-in">
      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">📊 Thống Kê Ca Làm</h1>
          <p className="text-secondary" style={{ marginTop:4 }}>{todayLabel}</p>
        </div>

        {/* Live controls */}
        <div style={{
          display:'flex', alignItems:'center', gap:12,
          background:'var(--color-bg-secondary)', border:'1px solid var(--color-border)',
          borderRadius:'var(--radius-xl)', padding:'10px 18px',
        }}>
          <span style={{ display:'flex', alignItems:'center', gap:6 }}>
            <span style={{
              width:9, height:9, borderRadius:'50%',
              background: refreshing ? 'var(--color-accent)' : 'var(--color-success)',
              display:'inline-block', animation:'pulseGlow 1.8s ease-in-out infinite',
            }}></span>
            <span style={{ fontSize:12, fontWeight:700, color:'var(--color-text-muted)' }}>
              {refreshing ? 'ĐANG CẬP NHẬT...' : 'LIVE'}
            </span>
          </span>
          <span style={{ fontSize:12, color:'var(--color-text-muted)' }}>🔄 {countdown}s</span>
          <button
            onClick={() => { fetchBookings(true); startAuto(); }}
            disabled={refreshing}
            style={{
              display:'flex', alignItems:'center', gap:5,
              background: refreshing ? 'transparent' : 'var(--color-primary)',
              color: refreshing ? 'var(--color-text-muted)' : 'white',
              border: refreshing ? '1px solid var(--color-border)' : 'none',
              borderRadius:'var(--radius-md)', padding:'6px 14px',
              fontSize:12, fontWeight:700, cursor: refreshing ? 'not-allowed' : 'pointer',
              opacity: refreshing ? 0.5 : 1, transition:'all 0.2s ease',
            }}
          >
            <span style={{ animation: refreshing ? 'spin 0.9s linear infinite' : 'none' }}>↻</span>
            {refreshing ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="kpi-grid grid-3-col mb-6">
        <div className="kpi-card slide-up">
          <span className="kpi-icon">💰</span>
          <p className="kpi-label">DOANH THU HÔM NAY</p>
          <h2 className="kpi-value text-success" style={{fontSize:'1.7rem'}}>
            {todayRevenue.toLocaleString('vi-VN')} ₫
          </h2>
          <p className="kpi-trend text-muted">{todayCompleted.length} đơn thành công</p>
        </div>
        <div className="kpi-card slide-up delay-100">
          <span className="kpi-icon">🎫</span>
          <p className="kpi-label">VÉ BÁN HÔM NAY</p>
          <h2 className="kpi-value" style={{fontSize:'1.7rem'}}>{todayTickets}</h2>
          <p className="kpi-trend text-muted">{todayPending.length} đơn chờ thanh toán</p>
        </div>
        <div className="kpi-card slide-up delay-200">
          <span className="kpi-icon">✅</span>
          <p className="kpi-label">VÉ ĐÃ SOÁT HÔM NAY</p>
          <h2 className="kpi-value text-accent" style={{fontSize:'1.7rem'}}>{todayCheckedIn}</h2>
          <p className="kpi-trend text-muted">
            {todayTickets > 0 ? `${Math.round(todayCheckedIn / todayTickets * 100)}% đã qua cửa` : 'Chưa có'}
          </p>
        </div>
      </div>

      {/* ── Charts & Tables ── */}
      <div className="grid-2-col gap-6">

        {/* Hourly Revenue Chart */}
        <div className="panel slide-up delay-300">
          <h3 className="panel-title mb-4">📈 Doanh Thu Theo Giờ Hôm Nay</h3>
          <div className="fake-chart flex items-end gap-1" style={{ height: 160 }}>
            {hourlyRevenue.map((h, i) => {
              const pct = (h.revenue / maxRevHour) * 100;
              return (
                <div
                  key={h.hour}
                  className="chart-bar"
                  style={{
                    height: `${Math.max(pct, h.revenue > 0 ? 4 : 0)}%`,
                    animationDelay: `${i * 0.04}s`,
                    background: h.revenue > 0
                      ? 'linear-gradient(to top, rgba(244,63,94,0.5), rgba(244,63,94,0.9))'
                      : 'var(--color-border)',
                    opacity: h.revenue > 0 ? 0.9 : 0.3,
                  }}
                >
                  {h.revenue > 0 && (
                    <div className="bar-tooltip">{h.revenue.toLocaleString('vi-VN')} ₫</div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="chart-labels" style={{ gap: 0 }}>
            {hourlyRevenue.filter((_, i) => i % 3 === 0).map(h => (
              <span key={h.hour}>{h.hour}h</span>
            ))}
          </div>
        </div>

        {/* Top Movies Today */}
        <div className="panel slide-up delay-300">
          <h3 className="panel-title mb-4">🎬 Phim Bán Nhiều Vé Nhất Hôm Nay</h3>
          {topMovies.length === 0 ? (
            <div style={{ textAlign:'center', padding:'2rem', color:'var(--color-text-muted)' }}>
              Chưa có dữ liệu hôm nay
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {topMovies.map(([title, count], i) => {
                const pct = Math.round((count / topMovies[0][1]) * 100);
                return (
                  <div key={title}>
                    <div className="flex justify-between items-center mb-1">
                      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <span style={{
                          width:22, height:22, borderRadius:'50%',
                          background: i === 0 ? 'linear-gradient(135deg,#f59e0b,#ef4444)'
                                    : i === 1 ? 'linear-gradient(135deg,#6b7280,#9ca3af)'
                                    : 'var(--color-bg-elevated)',
                          display:'flex', alignItems:'center', justifyContent:'center',
                          fontSize:10, fontWeight:900, color:'white', flexShrink:0,
                        }}>{i + 1}</span>
                        <span style={{ fontSize:13, fontWeight:700, color:'var(--color-text-primary)' }}>
                          {title}
                        </span>
                      </div>
                      <span style={{ fontSize:13, fontWeight:800, color:'var(--color-primary)' }}>
                        {count} vé
                      </span>
                    </div>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width:`${pct}%` }}></div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Recent Bookings Today ── */}
      <div className="panel slide-up delay-400" style={{ marginTop:20, padding:0, overflow:'hidden' }}>
        <div style={{ padding:'16px 20px', borderBottom:'1px solid var(--color-border)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <h3 className="panel-title">🧾 Giao Dịch Hôm Nay</h3>
          <span style={{
            background:'rgba(16,185,129,0.1)', color:'var(--color-success)',
            border:'1px solid rgba(16,185,129,0.25)', borderRadius:'var(--radius-full)',
            fontSize:11, fontWeight:700, padding:'3px 10px',
          }}>{todayBookings.length} giao dịch</span>
        </div>

        {todayBookings.length === 0 ? (
          <div style={{ padding:'3rem', textAlign:'center', color:'var(--color-text-muted)' }}>
            📭 Chưa có giao dịch nào hôm nay
          </div>
        ) : (
          <div style={{ overflowX:'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>MÃ ĐƠN</th>
                  <th>KHÁCH HÀNG</th>
                  <th>PHIM</th>
                  <th>GHẾ</th>
                  <th>TỔNG TIỀN</th>
                  <th>THANH TOÁN</th>
                  <th>VÉ</th>
                  <th>GIỜ ĐẶT</th>
                </tr>
              </thead>
              <tbody>
                {[...todayBookings].reverse().map(b => {
                  const psColor = b.paymentStatus === 'COMPLETED' ? 'var(--color-success)' : b.paymentStatus === 'PENDING' ? 'var(--color-accent)' : 'var(--color-error)';
                  const psBg    = b.paymentStatus === 'COMPLETED' ? 'rgba(16,185,129,0.1)' : b.paymentStatus === 'PENDING' ? 'rgba(245,158,11,0.1)' : 'rgba(239,68,68,0.1)';
                  const psLabel = b.paymentStatus === 'COMPLETED' ? 'Đã TT' : b.paymentStatus === 'PENDING' ? 'Chờ TT' : 'Thất bại';
                  return (
                    <tr key={b._id}>
                      <td>
                        <span style={{ fontFamily:'monospace', fontSize:12, fontWeight:700, background:'var(--color-bg-primary)', border:'1px solid var(--color-border)', borderRadius:4, padding:'2px 6px', color:'var(--color-text-muted)' }}>
                          #{b._id.substring(0,8).toUpperCase()}
                        </span>
                      </td>
                      <td style={{ fontWeight:600, fontSize:13 }}>{b.user?.name || 'Khách vãng lai'}</td>
                      <td style={{ fontSize:13, maxWidth:140, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {b.showtime?.movie?.title || '—'}
                      </td>
                      <td style={{ fontSize:12 }}>
                        {b.seats.map(s => s.seatId).join(', ')}
                      </td>
                      <td style={{ fontWeight:800, color:'var(--color-success)', whiteSpace:'nowrap' }}>
                        {b.totalAmount.toLocaleString('vi-VN')} ₫
                      </td>
                      <td>
                        <span style={{ background:psBg, color:psColor, border:`1px solid ${psColor}44`, borderRadius:'var(--radius-full)', padding:'3px 8px', fontSize:11, fontWeight:700 }}>
                          {psLabel}
                        </span>
                      </td>
                      <td style={{ fontSize:12, fontWeight:700, color: b.ticketStatus === 'USED' ? 'var(--color-text-muted)' : 'var(--color-secondary)' }}>
                        {b.ticketStatus === 'USED' ? '✅ Đã soát' : '🎫 Chưa dùng'}
                      </td>
                      <td style={{ fontSize:12, color:'var(--color-text-muted)', whiteSpace:'nowrap' }}>
                        {new Date(b.createdAt).toLocaleTimeString('vi-VN', {hour:'2-digit', minute:'2-digit'})}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

export default StaffShiftStats;
