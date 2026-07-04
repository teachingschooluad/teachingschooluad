import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import api from '../../lib/api';

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const res = await api.get('/dashboard/student');
      setStats(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const safeInt = (v) => parseInt(v) || 0;
  const completed = safeInt(stats?.completed_logbooks);
  const totalAssignments = safeInt(stats?.total_logbook_assignments);
  const percentLogbook = totalAssignments > 0 ? Math.round((completed / totalAssignments) * 100) : 0;

  if (loading) return <div className="student-loading"><div className="spinner" /></div>;

  return (
    <div className="student-page fade-in">
      {/* Greeting */}
      <div className="student-greeting" style={{ background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)', padding: '24px', borderRadius: '16px', color: '#ffffff', marginBottom: '24px', boxShadow: '0 8px 20px rgba(0, 61, 122, 0.15)' }}>
        <p className="greeting-sub" style={{ opacity: 0.8, fontSize: '14px', margin: 0 }}>Selamat datang kembali,</p>
        <h1 className="greeting-name" style={{ fontSize: '24px', fontWeight: '700', margin: '4px 0 8px 0', color: '#ffffff' }}>{user?.name || 'Mahasiswa'}</h1>
        <div className="greeting-info-grid" style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', opacity: 0.9 }}>
          <span><span className="material-icon">🆔</span> NIM: {user?.nim_nidn || '-'}</span>
          <span><span className="material-icon">🎓</span> Prodi: {user?.prodi || '-'}</span>
          <span><span className="material-icon">🏫</span> Kelompok: {user?.kelompok_ppl?.name || user?.class_id || 'Umum'}</span>
        </div>
      </div>

      {/* Alerts */}
      {stats?.today_status === 'belum_absen' && (
        <div className="student-alert alert-danger" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '16px', borderRadius: '12px', marginBottom: '16px', color: '#ef4444' }}>
          <span className="alert-icon" style={{ fontSize: '20px' }}>⚠️</span>
          <div className="alert-content">
            <strong style={{ display: 'block', fontSize: '14px' }}>Perhatian</strong>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', opacity: 0.9 }}>Anda belum melakukan presensi masuk hari ini.</p>
          </div>
          <button className="btn btn-sm" onClick={() => navigate('/mahasiswa/attendance')} style={{ marginLeft: 'auto', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '6px', cursor: 'pointer' }}>Absen Sekarang</button>
        </div>
      )}

      {stats?.today_status === 'sudah_masuk' && !stats?.has_logbook_today && (
        <div className="student-alert alert-warning" style={{ display: 'flex', alignItems: 'center', gap: '12px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.2)', padding: '16px', borderRadius: '12px', marginBottom: '16px', color: '#f59e0b' }}>
          <span className="alert-icon" style={{ fontSize: '20px' }}>📝</span>
          <div className="alert-content">
            <strong style={{ display: 'block', fontSize: '14px' }}>Logbook Hari Ini</strong>
            <p style={{ margin: '2px 0 0 0', fontSize: '13px', opacity: 0.9 }}>Anda sudah masuk presensi tetapi belum mengisi logbook hari ini.</p>
          </div>
          <button className="btn btn-sm" onClick={() => navigate('/mahasiswa/logbooks')} style={{ marginLeft: 'auto', background: '#f59e0b', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: '6px', cursor: 'pointer' }}>Isi Logbook</button>
        </div>
      )}

      {/* Progress Logbook */}
      <div className="student-card gamification-card" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <div className="gamification-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <div className="gamification-label" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Penyelesaian Tugas Logbook</div>
            <div className="gamification-points" style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)' }}>{completed} <span style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>dari {totalAssignments} Tugas</span></div>
          </div>
          <div className="gamification-badge" style={{ background: 'rgba(0, 61, 122, 0.1)', color: 'var(--primary)', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '600' }}>
            {percentLogbook}% Selesai
          </div>
        </div>
        <div className="gamification-bar-bg" style={{ background: '#f1f5f9', height: '10px', borderRadius: '5px', overflow: 'hidden', marginBottom: '8px' }}>
          <div className="gamification-bar-fill" style={{ width: `${percentLogbook}%`, background: 'var(--primary)', height: '100%', borderRadius: '5px', transition: 'width 0.5s ease-in-out' }} />
        </div>
      </div>

      {/* Unsubmitted Assignments */}
      {stats?.unsubmitted_assignments?.length > 0 && (
        <div className="student-card" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', padding: '20px', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', margin: '0 0 12px 0', color: 'var(--text-primary)' }}>Tugas Logbook Belum Dikirim</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {stats.unsubmitted_assignments.map((assignment) => (
              <div key={assignment.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: '13px', fontWeight: '500', color: '#334155' }}>{assignment.title}</span>
                <button className="btn btn-sm" onClick={() => navigate(`/mahasiswa/logbooks`)} style={{ background: 'var(--primary)', color: '#fff', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', cursor: 'pointer' }}>Kerjakan</button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="student-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '24px' }}>
        <div className="student-stat-card" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div className="stat-icon-wrapper primary" style={{ background: 'rgba(0, 61, 122, 0.1)', color: 'var(--primary)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '8px' }}>⏱️</div>
          <div className="stat-val" style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>{safeInt(stats?.total_jp)}</div>
          <div className="stat-lbl" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Total JP</div>
        </div>
        <div className="student-stat-card" onClick={() => navigate('/mahasiswa/history')} style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', cursor: 'pointer' }}>
          <div className="stat-icon-wrapper success" style={{ background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '8px' }}>✅</div>
          <div className="stat-val" style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>{safeInt(stats?.total_hadir)}</div>
          <div className="stat-lbl" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Hari Hadir</div>
        </div>
        <div className="student-stat-card" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div className="stat-icon-wrapper secondary" style={{ background: 'rgba(212, 168, 48, 0.1)', color: 'var(--secondary)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '8px' }}>📝</div>
          <div className="stat-val" style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>{completed}</div>
          <div className="stat-lbl" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Logbook Selesai</div>
        </div>
        <div className="student-stat-card" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div className="stat-icon-wrapper warning" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', marginBottom: '8px' }}>🏥</div>
          <div className="stat-val" style={{ fontSize: '20px', fontWeight: '700', color: 'var(--text-primary)' }}>{safeInt(stats?.total_sakit) + safeInt(stats?.total_ijin)}</div>
          <div className="stat-lbl" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Sakit/Izin</div>
        </div>
      </div>

      {/* Quote */}
      {stats?.quote && (
        <div className="student-card quote-card" style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '20px', textAlign: 'center', fontStyle: 'italic', position: 'relative' }}>
          <div className="quote-icon" style={{ fontSize: '24px', opacity: 0.15, position: 'absolute', top: '10px', left: '20px' }}>“</div>
          <p className="quote-text" style={{ fontSize: '14px', color: '#475569', margin: '0 0 8px 0', lineHeight: 1.5 }}>{stats.quote.text}</p>
          <p className="quote-author" style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', margin: 0 }}>— {stats.quote.author}</p>
        </div>
      )}
    </div>
  );
}
