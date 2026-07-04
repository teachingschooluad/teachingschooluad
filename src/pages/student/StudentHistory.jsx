import { useState, useEffect } from 'react';
import api from '../../lib/api';

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export default function StudentHistory() {
  const [attendances, setAttendances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const res = await api.get('/attendances', { params: { month, year } });
      if (res.data.success) setAttendances(res.data.data.data || []);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, [month, year]);

  const formatDate = (d) => {
    try { return new Date(d).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }); }
    catch { return d; }
  };

  return (
    <div className="student-page fade-in">
      <h2 className="student-page-title">Riwayat Presensi</h2>

      <div className="student-filters">
        <select className="student-select" value={month} onChange={e => setMonth(+e.target.value)}>
          {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
        </select>
        <select className="student-select" value={year} onChange={e => setYear(+e.target.value)}>
          {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="student-loading"><div className="spinner" /></div>
      ) : attendances.length === 0 ? (
        <div className="student-empty">Belum ada data presensi bulan {MONTHS[month - 1]}.</div>
      ) : (
        <div className="student-list">
          {attendances.map(a => (
            <div key={a.id} className="student-card history-card">
              <div className="history-icon">📅</div>
              <div className="history-content">
                <div className="history-date">{formatDate(a.date)}</div>
                <div className="history-times">
                  <div className="history-time">
                    <span className="time-label">Masuk</span>
                    <span className="time-val success">{a.check_in_time?.substring(0, 5) || '--:--'}</span>
                  </div>
                  <div className="history-time">
                    <span className="time-label">Pulang</span>
                    <span className="time-val primary">{a.check_out_time?.substring(0, 5) || '--:--'}</span>
                  </div>
                  <div className="history-time">
                    <span className="time-label">Poin</span>
                    <span className="time-val bold">{a.jp_earned || 0} JP</span>
                  </div>
                </div>
                {(a.is_manual === true || a.is_manual === 1) && (
                  <span className="history-manual-badge">Diedit Manual</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
