import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function MahasiswaNilai() {
  const [gradeData, setGradeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showScores, setShowScores] = useState(false);

  const fetchGrades = async () => {
    setLoading(true);
    try {
      const scoresRes = await api.get('/instruments/my-scores');
      const isAllowed = scoresRes.data.show_scores === true;
      setShowScores(isAllowed);

      if (isAllowed) {
        const res = await api.get('/grades/final');
        if (res.data.success) {
          setGradeData(res.data.data);
        }
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal memuat rekap nilai');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGrades();
  }, []);

  if (loading) return <div className="student-loading"><div className="spinner" /></div>;

  if (!showScores) {
    return (
      <div className="student-page fade-in" style={{ padding: '24px' }}>
        <h2 className="student-page-title">Rekap Nilai PPL</h2>
        <div 
          className="student-card" 
          style={{ 
            background: '#ffffff', 
            border: '1px solid rgba(0,0,0,0.06)', 
            borderRadius: '16px', 
            padding: '40px 24px', 
            textAlign: 'center', 
            boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px'
          }}
        >
          <div style={{ fontSize: '48px' }}>🔒</div>
          <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Nilai Belum Dirilis</h3>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5, maxWidth: '280px' }}>
            Rekap nilai akhir PPL belum dibuka oleh administrator. Silakan hubungi admin atau DPL Anda untuk informasi lebih lanjut.
          </p>
        </div>
      </div>
    );
  }

  if (!gradeData) return <div className="student-empty">Data nilai tidak tersedia.</div>;

  const { final_grade, components, weights } = gradeData;

  // Grade classification
  const getGradeLetter = (score) => {
    if (score >= 80) return { letter: 'A', desc: 'Sangat Memuaskan', color: '#22c55e' };
    if (score >= 70) return { letter: 'B', desc: 'Memuaskan', color: 'var(--primary)' };
    if (score >= 60) return { letter: 'C', desc: 'Cukup', color: 'var(--secondary)' };
    if (score >= 50) return { letter: 'D', desc: 'Kurang', color: '#f59e0b' };
    return { letter: 'E', desc: 'Gagal', color: '#ef4444' };
  };

  const gradeInfo = getGradeLetter(final_grade);

  return (
    <div className="student-page fade-in">
      <h2 className="student-page-title">Rekap Nilai PPL</h2>

      {/* Final Grade Circular Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--primary) 0%, var(--primary-light) 100%)',
          borderRadius: '24px',
          padding: '30px 24px',
          color: '#ffffff',
          textAlign: 'center',
          boxShadow: '0 8px 24px rgba(0, 61, 122, 0.2)',
          marginBottom: '24px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center'
        }}
      >
        <span style={{ fontSize: '13px', opacity: 0.8, textTransform: 'uppercase', trackingLetter: '1px' }}>Nilai Akhir Kumulatif</span>
        <div
          style={{
            fontSize: '64px',
            fontWeight: '900',
            margin: '12px 0 4px 0',
            lineHeight: 1
          }}
        >
          {final_grade}
        </div>
        <div
          style={{
            fontSize: '18px',
            fontWeight: '700',
            background: 'rgba(255, 255, 255, 0.2)',
            padding: '6px 20px',
            borderRadius: '20px',
            marginTop: '8px',
            display: 'inline-block'
          }}
        >
          Predikat: {gradeInfo.letter} ({gradeInfo.desc})
        </div>
      </div>

      {/* Component Breakdown list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '15px', fontWeight: '700', margin: '0 0 4px 0', color: 'var(--text-primary)' }}>Rincian Komponen Nilai</h3>

        {/* 1. Asesmen Akhir */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>1. Asesmen Akhir PPL</span>
            <span style={{ fontSize: '12px', background: 'rgba(0, 61, 122, 0.1)', color: 'var(--primary)', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>
              Bobot: {weights.final_assessment}%
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Rata-rata Nilai</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{components.final_assessment.average}</span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Progress Kiriman</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{components.final_assessment.completed} / {components.final_assessment.total_assignments}</span>
            </div>
          </div>
        </div>

        {/* 2. Logbook */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>2. Logbook Harian</span>
            <span style={{ fontSize: '12px', background: 'rgba(212, 168, 48, 0.1)', color: 'var(--secondary)', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>
              Bobot: {weights.logbook}%
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Rata-rata Nilai</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{components.logbook.average}</span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Tugas Terisi</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{components.logbook.completed} / {components.logbook.total_assignments}</span>
            </div>
          </div>
        </div>

        {/* 3. Kehadiran */}
        <div style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', padding: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <span style={{ fontWeight: '700', fontSize: '14px', color: 'var(--text-primary)' }}>3. Presensi Kehadiran</span>
            <span style={{ fontSize: '12px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', padding: '4px 10px', borderRadius: '12px', fontWeight: '600' }}>
              Bobot: {weights.attendance}%
            </span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '1px solid #f1f5f9', marginBottom: '12px' }}>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Persentase Kehadiran</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: '#22c55e' }}>{components.attendance.rate}%</span>
            </div>
            <div>
              <span style={{ fontSize: '11px', color: '#64748b', display: 'block' }}>Hari Aktif</span>
              <span style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>{components.attendance.total_active_days} Hari</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '16px', padding: '0 4px', fontSize: '12px', color: '#64748b' }}>
            <span>Hadir: <strong>{components.attendance.present_days} Hari</strong></span>
            <span>Izin/Sakit: <strong>{components.attendance.permission_days} Hari</strong></span>
          </div>
        </div>
      </div>

      {/* Info Card */}
      <div style={{ background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '16px', marginTop: '24px' }}>
        <h4 style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>Rumus Penghitungan Nilai:</h4>
        <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineHeight: 1.5 }}>
          Nilai Akhir dihitung secara otomatis berdasarkan bobot konfigurasi:<br />
          <code>({weights.final_assessment}% × Rata Asesmen) + ({weights.logbook}% × Rata Logbook) + ({weights.attendance}% × % Presensi)</code>
        </p>
      </div>
    </div>
  );
}
