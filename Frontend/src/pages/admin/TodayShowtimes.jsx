import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import './SaaS.css';

function TodayShowtimes() {
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [search, setSearch]       = useState('');
  const [viewMode, setViewMode]   = useState('cinema'); // 'cinema' | 'movie'

  const fetchShowtimes = useCallback(async () => {
    try {
      const { data } = await api.get('/showtimes');
      // Filter: only today's showtimes
      const today = new Date();
      const todayStr = today.toDateString();
      const todayData = data.filter(st => {
        const d = new Date(st.startTime);
        return d.toDateString() === todayStr;
      });
      // Sort by start time
      todayData.sort((a, b) => new Date(a.startTime) - new Date(b.startTime));
      setShowtimes(todayData);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Lỗi lấy lịch chiếu', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchShowtimes();
    const interval = setInterval(fetchShowtimes, 60000); // refresh every 60s
    return () => clearInterval(interval);
  }, [fetchShowtimes]);

  // Filter by search
  const filtered = showtimes.filter(st => {
    const q = search.toLowerCase();
    return (
      st.movie?.title?.toLowerCase().includes(q) ||
      st.cinema?.name?.toLowerCase().includes(q) ||
      st.room?.toLowerCase().includes(q)
    );
  });

  // Group by cinema or movie
  const grouped = filtered.reduce((acc, st) => {
    const key = viewMode === 'cinema'
      ? st.cinema?._id || 'unknown'
      : st.movie?._id  || 'unknown';
    const label = viewMode === 'cinema'
      ? st.cinema?.name
      : st.movie?.title;
    if (!acc[key]) acc[key] = { label, items: [] };
    acc[key].items.push(st);
    return acc;
  }, {});

  const now = new Date();

  const getStatusStyle = (st) => {
    const start = new Date(st.startTime);
    const end   = new Date(st.endTime || start.getTime() + (st.movie?.duration || 120) * 60000);
    if (now > end)   return { label: 'Đã kết thúc', color: 'var(--color-text-muted)',   bg: 'var(--color-bg-primary)' };
    if (now >= start) return { label: '🎬 Đang chiếu', color: 'var(--color-success)',    bg: 'rgba(16,185,129,0.1)'   };
    const minsLeft = Math.round((start - now) / 60000);
    if (minsLeft <= 30) return { label: `⏰ ${minsLeft} phút nữa`, color: 'var(--color-accent)', bg: 'rgba(245,158,11,0.1)' };
    return { label: `🕐 ${start.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}`, color: 'var(--color-secondary)', bg: 'rgba(14,165,233,0.08)' };
  };

  if (loading) return (
    <div className="flex items-center justify-center" style={{ minHeight: '50vh' }}>
      <div style={{ textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
        <p className="text-muted">Đang tải lịch chiếu hôm nay...</p>
      </div>
    </div>
  );

  const todayLabel = new Date().toLocaleDateString('vi-VN', { weekday:'long', year:'numeric', month:'long', day:'numeric' });

  return (
    <div className="fade-in">
      {/* ── Header ── */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold">📅 Lịch Chiếu Hôm Nay</h1>
          <p className="text-secondary" style={{ marginTop: 4 }}>
            {todayLabel} &nbsp;·&nbsp; {showtimes.length} suất chiếu
            {lastUpdated && <span style={{ marginLeft: 8 }}>· Cập nhật {lastUpdated.toLocaleTimeString('vi-VN')}</span>}
          </p>
        </div>
        <button
          onClick={fetchShowtimes}
          style={{
            display:'flex', alignItems:'center', gap:6,
            background:'var(--color-primary)', color:'white',
            border:'none', borderRadius:'var(--radius-md)', padding:'10px 18px',
            fontWeight:700, fontSize:13, cursor:'pointer', transition:'all 0.2s ease',
          }}
        >↻ Làm mới</button>
      </div>

      {/* ── KPI Strip ── */}
      <div className="kpi-grid grid-3-col mb-6">
        <div className="kpi-card slide-up">
          <span className="kpi-icon">🎬</span>
          <p className="kpi-label">TỔNG SUẤT CHIẾU</p>
          <h2 className="kpi-value" style={{fontSize:'1.8rem'}}>{showtimes.length}</h2>
        </div>
        <div className="kpi-card slide-up delay-100">
          <span className="kpi-icon">▶️</span>
          <p className="kpi-label">ĐANG CHIẾU</p>
          <h2 className="kpi-value text-success" style={{fontSize:'1.8rem'}}>
            {showtimes.filter(st => {
              const s = new Date(st.startTime);
              const e = new Date(st.endTime || s.getTime() + 120*60000);
              return now >= s && now <= e;
            }).length}
          </h2>
        </div>
        <div className="kpi-card slide-up delay-200">
          <span className="kpi-icon">⏳</span>
          <p className="kpi-label">SẮP CHIẾU</p>
          <h2 className="kpi-value text-accent" style={{fontSize:'1.8rem'}}>
            {showtimes.filter(st => new Date(st.startTime) > now).length}
          </h2>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="panel mb-4 slide-up delay-200">
        <div className="flex gap-4 items-center flex-wrap">
          {/* Search */}
          <div style={{ position:'relative', flex:1, minWidth:200 }}>
            <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--color-text-muted)', pointerEvents:'none' }}>🔍</span>
            <input
              type="text" placeholder="Tìm phim, rạp, phòng..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                width:'100%', paddingLeft:38, paddingRight:14, paddingTop:10, paddingBottom:10,
                background:'var(--color-bg-primary)', border:'1px solid var(--color-border)',
                borderRadius:'var(--radius-md)', color:'var(--color-text-primary)',
                fontSize:14, fontFamily:'inherit', outline:'none',
              }}
              onFocus={e => { e.target.style.borderColor='var(--color-primary)'; e.target.style.boxShadow='0 0 0 3px var(--color-primary-glow)'; }}
              onBlur={e => { e.target.style.borderColor='var(--color-border)'; e.target.style.boxShadow='none'; }}
            />
          </div>
          {/* View mode */}
          <div style={{ display:'flex', gap:6 }}>
            {[['cinema','🏢 Theo Rạp'],['movie','🎬 Theo Phim']].map(([mode, label]) => (
              <button key={mode} onClick={() => setViewMode(mode)} style={{
                padding:'8px 16px', borderRadius:'var(--radius-full)', fontWeight:700, fontSize:13,
                cursor:'pointer', transition:'all 0.2s ease',
                background: viewMode === mode ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
                color: viewMode === mode ? 'white' : 'var(--color-text-secondary)',
                border: viewMode === mode ? 'none' : '1px solid var(--color-border)',
                boxShadow: viewMode === mode ? '0 4px 12px rgba(244,63,94,0.3)' : 'none',
              }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Showtime Groups ── */}
      {Object.keys(grouped).length === 0 ? (
        <div className="panel" style={{ textAlign:'center', padding:'3rem', color:'var(--color-text-muted)' }}>
          {search ? '🔍 Không tìm thấy suất chiếu phù hợp' : '📭 Không có lịch chiếu nào hôm nay'}
        </div>
      ) : (
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          {Object.values(grouped).map((group, gi) => (
            <div key={gi} className="panel slide-up" style={{ animationDelay: `${gi * 0.05}s`, padding:0, overflow:'hidden' }}>
              {/* Group Header */}
              <div style={{
                padding:'14px 20px', borderBottom:'1px solid var(--color-border)',
                background:'var(--color-bg-primary)',
                display:'flex', alignItems:'center', gap:10,
              }}>
                <span style={{ fontSize:18 }}>{viewMode === 'cinema' ? '🏢' : '🎬'}</span>
                <span style={{ fontWeight:800, fontSize:16, color:'var(--color-text-primary)' }}>{group.label}</span>
                <span style={{
                  marginLeft:'auto', background:'var(--color-bg-elevated)',
                  border:'1px solid var(--color-border)', borderRadius:'var(--radius-full)',
                  fontSize:11, fontWeight:700, padding:'3px 10px', color:'var(--color-text-muted)',
                }}>{group.items.length} suất</span>
              </div>

              {/* Showtimes Table */}
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>{viewMode === 'cinema' ? 'PHIM' : 'RẠP'}</th>
                    <th>PHÒNG</th>
                    <th>GIỜ BẮT ĐẦU</th>
                    <th>GIỜ KẾT THÚC</th>
                    <th>THỜI LƯỢNG</th>
                    <th>TRẠNG THÁI</th>
                  </tr>
                </thead>
                <tbody>
                  {group.items.map(st => {
                    const status = getStatusStyle(st);
                    const start  = new Date(st.startTime);
                    const dur    = st.movie?.duration || 120;
                    const end    = st.endTime ? new Date(st.endTime) : new Date(start.getTime() + dur * 60000);
                    return (
                      <tr key={st._id}>
                        <td style={{ fontWeight:700, fontSize:14 }}>
                          {viewMode === 'cinema' ? st.movie?.title : st.cinema?.name}
                        </td>
                        <td style={{ color:'var(--color-text-secondary)', fontSize:13 }}>
                          {st.room || '—'}
                        </td>
                        <td style={{ fontWeight:700, fontFamily:'monospace', fontSize:14 }}>
                          {start.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}
                        </td>
                        <td style={{ color:'var(--color-text-muted)', fontFamily:'monospace', fontSize:13 }}>
                          {end.toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'})}
                        </td>
                        <td style={{ color:'var(--color-text-muted)', fontSize:13 }}>
                          {dur} phút
                        </td>
                        <td>
                          <span style={{
                            background: status.bg, color: status.color,
                            border: `1px solid ${status.color}33`,
                            borderRadius:'var(--radius-full)', padding:'4px 12px',
                            fontSize:12, fontWeight:700, whiteSpace:'nowrap',
                          }}>{status.label}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default TodayShowtimes;
