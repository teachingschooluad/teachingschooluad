import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

const API_STORAGE = (import.meta.env.VITE_API_URL || 'https://ejurnal.smk1kawunganten.sch.id/api/v1').replace('/ppl/api/v1', '/eppl-api/storage/app/public').replace('/api/v1', '/storage');
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
const DAYS_LABEL = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];

export default function StudentJournals() {
  const navigate = useNavigate();
  const [journals, setJournals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [detail, setDetail] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);

  // Calendar data
  const [calendarData, setCalendarData] = useState(null);
  const [calendarLoading, setCalendarLoading] = useState(false);

  const fetchJournals = async () => {
    setLoading(true);
    try {
      const params = { month, year };
      if (selectedDate) params.date = `${year}-${String(month).padStart(2,'0')}-${String(selectedDate).padStart(2,'0')}`;
      const res = await api.get('/journals', { params });
      if (res.data.success) setJournals(res.data.data.data || []);
    } catch {} finally { setLoading(false); }
  };

  const fetchCalendar = async () => {
    setCalendarLoading(true);
    try {
      const res = await api.get('/journals/monthly', { params: { month, year } });
      if (res.data.success) setCalendarData(res.data.data);
    } catch (err) {
      console.error('Calendar error:', err);
    } finally { setCalendarLoading(false); }
  };

  useEffect(() => { 
    fetchCalendar(); 
    setSelectedDate(null);
  }, [month, year]);

  useEffect(() => { fetchJournals(); }, [month, year, selectedDate]);

  // Build calendar grid
  const buildCalendarGrid = () => {
    if (!calendarData) return [];
    const firstDay = new Date(year, month - 1, 1);
    // Monday = 0, Sunday = 6
    let startDay = firstDay.getDay() - 1;
    if (startDay < 0) startDay = 6;
    
    const grid = [];
    let week = Array(startDay).fill(null);
    
    for (let d = 1; d <= calendarData.days_in_month; d++) {
      week.push(d);
      if (week.length === 7) {
        grid.push(week);
        week = [];
      }
    }
    if (week.length > 0) {
      while (week.length < 7) week.push(null);
      grid.push(week);
    }
    return grid;
  };

  const getStatusColor = (day) => {
    if (!calendarData || !calendarData.days[day]) return 'transparent';
    const status = calendarData.days[day];
    switch (status) {
      case 'reviewed': return '#22c55e';
      case 'pending': return '#f59e0b';
      case 'missing': return '#ef4444';
      case 'weekend': return '#e2e8f0';
      default: return 'transparent';
    }
  };

  const getStatusLabel = (day) => {
    if (!calendarData || !calendarData.days[day]) return '';
    const status = calendarData.days[day];
    switch (status) {
      case 'reviewed': return '✓';
      case 'pending': return '!';
      case 'missing': return '✕';
      default: return '';
    }
  };

  const calendarGrid = buildCalendarGrid();

  // Count statuses for summary
  const statusCounts = { reviewed: 0, pending: 0, missing: 0 };
  if (calendarData?.days) {
    Object.values(calendarData.days).forEach(s => {
      if (statusCounts[s] !== undefined) statusCounts[s]++;
    });
  }

  return (
    <div className="student-page fade-in">
      <h2 className="student-page-title">Jurnal Harian PKL</h2>

      {/* Filters */}
      <div className="student-filters">
        <select className="student-select" value={month} onChange={e => { setMonth(+e.target.value); }}>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select className="student-select" value={year} onChange={e => { setYear(+e.target.value); }}>
          {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {/* Calendar Widget */}
      <div className="student-card" style={{ marginBottom: '16px', padding: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div style={{ fontWeight: 700, fontSize: '15px', color: '#0b1c30' }}>
            📅 Kalender {MONTHS[month - 1]} {year}
          </div>
          {selectedDate && (
            <button 
              onClick={() => setSelectedDate(null)}
              style={{ background: 'none', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '4px 10px', fontSize: '12px', color: '#4648d4', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              Tampilkan Semua
            </button>
          )}
        </div>

        {calendarLoading ? (
          <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8' }}>Memuat kalender...</div>
        ) : (
          <>
            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
              {DAYS_LABEL.map(d => (
                <div key={d} style={{ textAlign: 'center', fontSize: '11px', fontWeight: 600, color: '#94a3b8', padding: '4px' }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            {calendarGrid.map((week, wi) => (
              <div key={wi} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                {week.map((day, di) => {
                  if (!day) return <div key={di} style={{ padding: '8px' }} />;
                  
                  const statusColor = getStatusColor(day);
                  const statusLabel = getStatusLabel(day);
                  const isWeekend = calendarData?.days[day] === 'weekend';
                  const isFuture = calendarData?.days[day] === 'future';
                  const isSelected = selectedDate === day;
                  const isClickable = !isFuture;

                  return (
                    <div 
                      key={di}
                      onClick={() => isClickable && setSelectedDate(isSelected ? null : day)}
                      style={{
                        textAlign: 'center',
                        padding: '6px 2px',
                        borderRadius: '8px',
                        cursor: isClickable ? 'pointer' : 'default',
                        background: isSelected ? '#4648d4' : (isWeekend ? '#f1f5f9' : 'transparent'),
                        border: isSelected ? '2px solid #4648d4' : '2px solid transparent',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                      }}
                    >
                      <div style={{ 
                        fontSize: '13px', 
                        fontWeight: isSelected ? 700 : 500, 
                        color: isSelected ? '#fff' : (isWeekend ? '#cbd5e1' : (isFuture ? '#cbd5e1' : '#0b1c30')) 
                      }}>
                        {day}
                      </div>
                      {statusLabel && !isSelected && (
                        <div style={{
                          width: '8px', height: '8px',
                          borderRadius: '50%',
                          background: statusColor,
                          margin: '2px auto 0',
                        }} />
                      )}
                      {isSelected && statusLabel && (
                        <div style={{ fontSize: '9px', color: '#fff', fontWeight: 700 }}>
                          {statusLabel}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e2e8f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#22c55e' }} />
                Diperiksa ({statusCounts.reviewed})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f59e0b' }} />
                Pending ({statusCounts.pending})
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#64748b' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} />
                Kosong ({statusCounts.missing})
              </div>
            </div>
          </>
        )}
      </div>

      {/* Journal List */}
      {loading ? (
        <div className="student-loading"><div className="spinner" /></div>
      ) : journals.length === 0 ? (
        <div className="student-empty">
          {selectedDate 
            ? `Belum ada jurnal tanggal ${selectedDate} ${MONTHS[month - 1]}.`
            : `Belum ada jurnal bulan ${MONTHS[month - 1]}.`
          }
        </div>
      ) : (
        <div className="student-list">
          {journals.map(j => (
            <div key={j.id} className="student-card journal-card" onClick={() => setDetail(j)}>
              <div className="journal-card-header">
                <span className="journal-date">{j.date}</span>
                <span className={`journal-status ${j.reviewed_guru ? 'reviewed' : 'pending'}`}>
                  {j.reviewed_guru ? '✅ Diperiksa' : '⏳ Pending'}
                </span>
              </div>
              <h3 className="journal-title">{j.kegiatan}</h3>
              <p className="journal-desc">{j.deskripsi?.substring(0, 100)}{j.deskripsi?.length > 100 ? '...' : ''}</p>
              {j.photos?.length > 0 && (
                <div className="journal-photo-badge">📷 Ada Lampiran Foto</div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* FAB */}
      <button className="student-fab" onClick={() => navigate('/student/journals/create')}>
        ✏️ Isi Jurnal
      </button>

      {/* Detail Modal */}
      {detail && (
        <div className="student-modal-overlay" onClick={() => setDetail(null)}>
          <div className="student-modal" onClick={e => e.stopPropagation()}>
            <div className="student-modal-header">
              <h3>{detail.date}</h3>
              <button onClick={() => setDetail(null)} className="modal-close">✕</button>
            </div>
            <div className="student-modal-body">
              <h4>{detail.kegiatan}</h4>
              <p style={{ marginTop: 12, whiteSpace: 'pre-wrap' }}>{detail.deskripsi}</p>
              {detail.photos?.length > 0 && (
                <div className="journal-photos-grid">
                  {detail.photos.map((photo, i) => (
                    <img key={i} src={`${API_STORAGE}/${photo}`} alt={`Lampiran ${i+1}`} className="journal-photo" />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
