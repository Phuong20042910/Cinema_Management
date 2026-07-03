import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import './SaaS.css';

const STATUS_LABEL = {
  COMPLETED: { label: 'Đã thanh toán', color: 'var(--color-success)',  bg: 'rgba(16,185,129,0.1)',  border: 'rgba(16,185,129,0.3)'  },
  PENDING:   { label: 'Chờ thanh toán', color: 'var(--color-accent)',   bg: 'rgba(245,158,11,0.1)',  border: 'rgba(245,158,11,0.3)'  },
  FAILED:    { label: 'Thất bại',        color: 'var(--color-error)',    bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)'   },
};

const TICKET_LABEL = {
  UNUSED: { label: 'Chưa dùng', color: 'var(--color-secondary)' },
  USED:   { label: 'Đã soát',    color: 'var(--color-text-muted)' },
};

function BookingsManager() {
  const [bookings,    setBookings]    = useState([]);
  const [filtered,   setFiltered]    = useState([]);
  const [loading,    setLoading]     = useState(true);
  const [refreshing, setRefreshing]  = useState(false);
  const [lastUpdated,setLastUpdated] = useState(null);
  const [search,     setSearch]      = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // ── Fetch all bookings ──────────────────────────────────────────────
  const fetchBookings = useCallback(async (manual = false) => {
    if (manual) setRefreshing(true);
    try {
      const { data } = await api.get('/bookings');
      setBookings(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Lỗi lấy danh sách đơn hàng', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchBookings(); }, [fetchBookings]);

  // ── Filter logic ────────────────────────────────────────────────────
  useEffect(() => {
    let result = [...bookings];
    if (statusFilter !== 'ALL') {
      result = result.filter(b => b.paymentStatus === statusFilter);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(b =>
        b._id.toLowerCase().includes(q) ||
        b.user?.name?.toLowerCase().includes(q) ||
        b.user?.email?.toLowerCase().includes(q) ||
        b.showtime?.movie?.title?.toLowerCase().includes(q) ||
        b.showtime?.cinema?.name?.toLowerCase().includes(q)
      );
    }
    setFiltered(result);
  }, [bookings, search, statusFilter]);

  // ── Stats ───────────────────────────────────────────────────────────
  const totalRevenue  = bookings.filter(b => b.paymentStatus === 'COMPLETED').reduce((s, b) => s + b.totalAmount, 0);
  const completedCount = bookings.filter(b => b.paymentStatus === 'COMPLETED').length;
  const pendingCount   = bookings.filter(b => b.paymentStatus === 'PENDING').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '50vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
          <p className="text-muted">Đang tải đơn hàng...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fade-in">
      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-8">
        <div>
          <h1 className="text-3xl font-bold">Quản lý Đơn Hàng</h1>
          <p className="text-secondary" style={{ marginTop: 4 }}>
            Tất cả giao dịch mua vé • {lastUpdated && `Cập nhật lúc ${lastUpdated.toLocaleTimeString('vi-VN')}`}
          </p>
        </div>
        <button
          onClick={() => fetchBookings(true)}
          disabled={refreshing}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: refreshing ? 'transparent' : 'var(--color-primary)',
            color: refreshing ? 'var(--color-text-muted)' : 'white',
            border: refreshing ? '1px solid var(--color-border)' : 'none',
            borderRadius: 'var(--radius-md)', padding: '10px 20px',
            fontWeight: 700, fontSize: 14, cursor: refreshing ? 'not-allowed' : 'pointer',
            opacity: refreshing ? 0.6 : 1, transition: 'all 0.2s ease',
          }}
        >
          <span style={{ display: 'inline-block', animation: refreshing ? 'spin 0.9s linear infinite' : 'none', fontSize: 16 }}>↻</span>
          {refreshing ? 'Đang tải...' : 'Làm mới'}
        </button>
      </div>

      {/* ── KPI Summary Strip ── */}
      <div className="kpi-grid grid-3-col mb-6">
        <div className="kpi-card slide-up">
          <span className="kpi-icon">💳</span>
          <p className="kpi-label">TỔNG DOANH THU</p>
          <h2 className="kpi-value text-success" style={{ fontSize: '1.8rem' }}>
            {totalRevenue.toLocaleString('vi-VN')} ₫
          </h2>
        </div>
        <div className="kpi-card slide-up delay-100">
          <span className="kpi-icon">✅</span>
          <p className="kpi-label">ĐÃ THANH TOÁN</p>
          <h2 className="kpi-value" style={{ fontSize: '1.8rem' }}>{completedCount}</h2>
        </div>
        <div className="kpi-card slide-up delay-200">
          <span className="kpi-icon">⏳</span>
          <p className="kpi-label">CHỜ THANH TOÁN</p>
          <h2 className="kpi-value text-accent" style={{ fontSize: '1.8rem' }}>{pendingCount}</h2>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="panel mb-4 slide-up delay-200">
        <div className="flex gap-4 items-center flex-wrap">
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 220 }}>
            <span style={{
              position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
              color: 'var(--color-text-muted)', fontSize: 16, pointerEvents: 'none',
            }}>🔍</span>
            <input
              type="text"
              placeholder="Tìm theo mã đơn, khách hàng, phim..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', paddingLeft: 38, paddingRight: 14, paddingTop: 10, paddingBottom: 10,
                background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-md)', color: 'var(--color-text-primary)',
                fontSize: 14, fontFamily: 'inherit', outline: 'none',
                transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
              }}
              onFocus={e => { e.target.style.borderColor = 'var(--color-primary)'; e.target.style.boxShadow = '0 0 0 3px var(--color-primary-glow)'; }}
              onBlur={e => { e.target.style.borderColor = 'var(--color-border)'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Status Filter Tabs */}
          <div style={{ display: 'flex', gap: 8 }}>
            {['ALL','COMPLETED','PENDING','FAILED'].map(s => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                style={{
                  padding: '8px 16px', borderRadius: 'var(--radius-full)',
                  border: statusFilter === s ? 'none' : '1px solid var(--color-border)',
                  background: statusFilter === s
                    ? s === 'ALL' ? 'var(--color-primary)' : STATUS_LABEL[s]?.bg
                    : 'var(--color-bg-secondary)',
                  color: statusFilter === s
                    ? s === 'ALL' ? 'white' : STATUS_LABEL[s]?.color
                    : 'var(--color-text-secondary)',
                  fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: statusFilter === s && s === 'ALL' ? '0 4px 12px rgba(244,63,94,0.3)' : 'none',
                }}
              >
                { s === 'ALL' ? `Tất cả (${bookings.length})` : `${STATUS_LABEL[s].label} (${bookings.filter(b=>b.paymentStatus===s).length})` }
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Bookings Table ── */}
      <div className="panel slide-up delay-300" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table className="admin-table" style={{ minWidth: 900 }}>
            <thead>
              <tr>
                <th>MÃ ĐƠN</th>
                <th>KHÁCH HÀNG</th>
                <th>PHIM</th>
                <th>RẠP</th>
                <th>GHẾ</th>
                <th>TỔNG TIỀN</th>
                <th>THANH TOÁN</th>
                <th>VÉ</th>
                <th>NGÀY TẠO</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: '3rem', color: 'var(--color-text-muted)' }}>
                    {search || statusFilter !== 'ALL' ? '🔍 Không tìm thấy đơn hàng phù hợp' : '📭 Chưa có đơn hàng nào'}
                  </td>
                </tr>
              ) : filtered.map((b, i) => {
                const ps = STATUS_LABEL[b.paymentStatus] || STATUS_LABEL.FAILED;
                const ts = TICKET_LABEL[b.ticketStatus] || TICKET_LABEL.UNUSED;
                return (
                  <tr key={b._id} style={{ animationDelay: `${i * 0.03}s` }}>
                    {/* Mã đơn */}
                    <td>
                      <span style={{
                        fontFamily: 'monospace', fontSize: 12, fontWeight: 700,
                        background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)',
                        borderRadius: 6, padding: '3px 7px', color: 'var(--color-text-muted)',
                      }}>
                        #{b._id.substring(0, 8).toUpperCase()}
                      </span>
                    </td>

                    {/* Khách hàng */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 30, height: 30, borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg,var(--color-primary),#fb7185)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontWeight: 900, color: 'white', fontSize: 12,
                        }}>
                          {(b.user?.name || 'K').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 13 }}>{b.user?.name || 'Khách vãng lai'}</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-muted)' }}>{b.user?.email || '—'}</div>
                        </div>
                      </div>
                    </td>

                    {/* Phim */}
                    <td style={{ fontWeight: 600, fontSize: 13, maxWidth: 160 }}>
                      <div style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {b.showtime?.movie?.title || <span className="text-muted">—</span>}
                      </div>
                    </td>

                    {/* Rạp */}
                    <td style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>
                      {b.showtime?.cinema?.name || '—'}
                    </td>

                    {/* Ghế */}
                    <td>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:4 }}>
                        {b.seats.slice(0,4).map(s => (
                          <span key={s.seatId} style={{
                            background:'var(--color-bg-primary)', border:'1px solid var(--color-border)',
                            borderRadius:4, padding:'2px 6px', fontSize:11, fontWeight:700,
                          }}>{s.seatId}</span>
                        ))}
                        {b.seats.length > 4 && (
                          <span style={{ fontSize:11, color:'var(--color-text-muted)' }}>+{b.seats.length-4}</span>
                        )}
                      </div>
                    </td>

                    {/* Tổng tiền */}
                    <td style={{ fontWeight: 800, color: 'var(--color-success)', fontSize: 14, whiteSpace:'nowrap' }}>
                      {b.totalAmount.toLocaleString('vi-VN')} ₫
                    </td>

                    {/* Trạng thái thanh toán */}
                    <td>
                      <span style={{
                        background: ps.bg, color: ps.color, border: `1px solid ${ps.border}`,
                        borderRadius: 'var(--radius-full)', padding: '4px 10px',
                        fontSize: 11, fontWeight: 700, whiteSpace:'nowrap',
                      }}>
                        {ps.label}
                      </span>
                    </td>

                    {/* Trạng thái vé */}
                    <td>
                      <span style={{
                        color: ts.color, fontWeight: 700, fontSize: 12,
                      }}>
                        {b.ticketStatus === 'USED' ? '✅ Đã soát' : '🎫 Chưa dùng'}
                      </span>
                    </td>

                    {/* Ngày tạo */}
                    <td style={{ fontSize: 12, color: 'var(--color-text-muted)', whiteSpace:'nowrap' }}>
                      {new Date(b.createdAt).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Footer count */}
        {filtered.length > 0 && (
          <div style={{
            padding: '12px 24px', borderTop: '1px solid var(--color-border)',
            fontSize: 13, color: 'var(--color-text-muted)', display:'flex', justifyContent:'space-between',
          }}>
            <span>Hiển thị <strong style={{color:'var(--color-text-primary)'}}>{filtered.length}</strong> / {bookings.length} đơn hàng</span>
            <span>Doanh thu lọc: <strong style={{color:'var(--color-success)'}}>
              {filtered.filter(b=>b.paymentStatus==='COMPLETED').reduce((s,b)=>s+b.totalAmount,0).toLocaleString('vi-VN')} ₫
            </strong></span>
          </div>
        )}
      </div>
    </div>
  );
}

export default BookingsManager;
