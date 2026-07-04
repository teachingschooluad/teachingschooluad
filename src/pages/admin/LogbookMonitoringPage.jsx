import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/authStore';

const STATUS_CONFIG = {
  pending: { label: '⏳', color: '#f59e0b', bg: 'bg-yellow-50 text-yellow-700 border border-yellow-200', text: 'Menunggu' },
  approved: { label: '✅', color: '#10b981', bg: 'bg-green-50 text-green-700 border border-green-200', text: 'Disetujui' },
  rejected: { label: '❌', color: '#ef4444', bg: 'bg-red-50 text-red-700 border border-red-200', text: 'Ditolak' },
};

const API_STORAGE = (import.meta.env.VITE_API_URL || 'https://eppl.uad.ac.id/api/v1').replace('/ppl/api/v1', '/eppl-api/storage/app/public').replace('/api/v1', '/storage');

export default function LogbookMonitoringPage() {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState([]);
  const [logbooks, setLogbooks] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLogbook, setSelectedLogbook] = useState(null);
  const [scoreForm, setScoreForm] = useState({ score: '', feedback: '' });
  const [submitting, setSubmitting] = useState(false);

  const isLecturer = user?.role === 'dpl' || user?.role === 'dps';
  const [associationType, setAssociationType] = useState(user?.role === 'dps' ? 'dps' : 'dpl');

  const fetchData = () => {
    setLoading(true);
    let studentUrl = '/master/students?per_page=9999';
    if (isLecturer) {
      studentUrl += `&association_type=${associationType}`;
    }
    Promise.all([
      api.get('/logbook-assignments'),
      api.get('/logbooks?per_page=9999'),
      api.get(studentUrl),
    ]).then(([aRes, lRes, sRes]) => {
      setAssignments(aRes.data.data || aRes.data || []);
      setLogbooks(lRes.data.data?.data || lRes.data.data || lRes.data || []);
      setStudents(sRes.data.data?.data || sRes.data.data || sRes.data || []);
    }).catch(() => toast.error('Gagal memuat data monitoring'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [associationType]);

  const getLogbook = (assignmentId, userId) => {
    return logbooks.find(l => l.assignment_id === assignmentId && l.user_id === userId);
  };

  const getStatusCell = (assignmentId, userId) => {
    const lb = getLogbook(assignmentId, userId);
    if (!lb) return { status: 'empty', label: '—', color: 'text-on-surface-variant/40', bg: 'bg-surface-container' };
    const st = lb.status || 'pending';
    const cfg = STATUS_CONFIG[st] || STATUS_CONFIG.pending;
    if (st === 'approved' && lb.score !== null) {
      return { status: 'approved', label: lb.score, color: 'text-green-700', bg: 'bg-green-50' };
    }
    return { status: st, label: cfg.label, color: cfg.color, bg: cfg.bg };
  };

  const handleCellClick = (assignmentId, userId) => {
    const lb = getLogbook(assignmentId, userId);
    if (!lb) return;
    setSelectedLogbook(lb);
    setScoreForm({ score: lb.score ?? '', feedback: lb.feedback || '' });
  };

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!scoreForm.score) { toast.error('Masukkan nilai terlebih dahulu'); return; }
    setSubmitting(true);
    try {
      await api.put(`/logbooks/${selectedLogbook.id}/score`, {
        status: 'approved',
        score: parseInt(scoreForm.score),
        feedback: scoreForm.feedback,
      });
      toast.success('Logbook disetujui dan dinilai');
      setSelectedLogbook(null);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menyetujui logbook');
    } finally { setSubmitting(false); }
  };

  const handleReject = async () => {
    if (!scoreForm.feedback) { toast.error('Catatan wajib diisi untuk penolakan'); return; }
    setSubmitting(true);
    try {
      await api.put(`/logbooks/${selectedLogbook.id}/score`, {
        status: 'rejected',
        feedback: scoreForm.feedback,
      });
      toast.success('Logbook ditolak. Mahasiswa akan diminta merevisi.');
      setSelectedLogbook(null);
      fetchData();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menolak logbook');
    } finally { setSubmitting(false); }
  };

  if (loading) return <div className="p-12 text-center text-on-surface-variant animate-pulse font-medium">Memuat data monitoring...</div>;

  return (
    <div className="space-y-gutter">
      {/* Page Header */}
      <div className="flex justify-between items-end">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant text-label-sm mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-bold">Monitoring Logbook</span>
          </nav>
          <h2 className="font-headline-lg text-headline-lg text-primary">Monitoring Logbook Mahasiswa</h2>
          <p className="text-on-surface-variant font-body-md mt-1">
            Klik sel untuk melihat detail penugasan, memberikan nilai persetujuan, atau menolak logbook mahasiswa.
          </p>
        </div>
      </div>

      {isLecturer && user?.role !== 'dps' && (
        <div className="flex gap-2 border-b border-outline-variant pb-3">
          <button 
            type="button"
            className={`px-4 py-2 text-label-md font-bold rounded-lg transition-all cursor-pointer ${associationType === 'dpl' ? 'bg-primary text-on-primary' : 'bg-white text-on-surface border border-outline-variant hover:bg-surface-container-low'}`}
            onClick={() => { setAssociationType('dpl'); }}
          >
            Mahasiswa Bimbingan PPL (DPL)
          </button>
          <button 
            type="button"
            className={`px-4 py-2 text-label-md font-bold rounded-lg transition-all cursor-pointer ${associationType === 'dps' ? 'bg-primary text-on-primary' : 'bg-white text-on-surface border border-outline-variant hover:bg-surface-container-low'}`}
            onClick={() => { setAssociationType('dps'); }}
          >
            Mahasiswa Bimbingan Skripsi (DPS)
          </button>
        </div>
      )}

      {/* Legend */}
      <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        <div className="p-4 bg-surface-container-low border-b border-outline-variant flex flex-wrap gap-6 text-label-sm font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded flex items-center justify-center bg-yellow-50 text-yellow-700 border border-yellow-200 text-[10px]">⏳</span>
            <span className="text-on-surface-variant">Menunggu</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded flex items-center justify-center bg-green-50 text-green-700 border border-green-200 text-[10px]">✅</span>
            <span className="text-on-surface-variant">Disetujui</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded flex items-center justify-center bg-red-50 text-red-700 border border-red-200 text-[10px]">❌</span>
            <span className="text-on-surface-variant">Ditolak</span>
          </div>
        </div>

        {/* Table Grid */}
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse min-w-[1000px] text-body-sm">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant">
                <th className="sticky-col py-4 px-6 font-label-md text-label-md text-primary w-64 bg-surface-container">Mahasiswa</th>
                {assignments.map(a => (
                  <th key={a.id} className="py-3 px-2 text-center font-label-sm text-on-surface-variant border-x border-outline-variant/30 min-w-[120px]" title={a.title}>
                    {a.title.length > 20 ? a.title.slice(0, 20) + '...' : a.title}
                  </th>
                ))}
                <th className="py-3 px-4 text-center font-bold text-primary bg-primary-fixed min-w-[80px]">Rata-rata</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {students.map(s => {
                const approvedScores = assignments
                  .map(a => getLogbook(a.id, s.id))
                  .filter(lb => lb && lb.status === 'approved' && lb.score !== null)
                  .map(lb => lb.score);
                const avg = approvedScores.length > 0
                  ? (approvedScores.reduce((a, b) => a + b, 0) / approvedScores.length).toFixed(1)
                  : '—';
                return (
                  <tr key={s.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="sticky-col py-4 px-6 border-r-2 border-outline-variant bg-white z-10">
                      <div>
                        <p className="font-bold text-body-sm text-primary leading-tight">{s.name}</p>
                        <p className="text-[10px] text-on-surface-variant mt-0.5">{s.nim_nidn}</p>
                      </div>
                    </td>
                    {assignments.map(a => {
                      const cell = getStatusCell(a.id, s.id);
                      return (
                        <td key={a.id} className="py-3 px-2 text-center border-x border-outline-variant/30">
                          <span 
                            onClick={() => handleCellClick(a.id, s.id)}
                            className={`w-10 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] mx-auto cursor-pointer transition-transform active:scale-95 ${cell.bg}`}
                          >
                            {cell.label}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-3 px-4 text-center font-bold text-primary bg-primary-fixed">{avg}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Score Modal popup */}
      {selectedLogbook && (
        <div className="modal-overlay" onClick={() => setSelectedLogbook(null)}>
          <div className="modal-content max-w-[600px]" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="font-bold text-body-lg text-primary">Detail & Persetujuan Logbook</h3>
              <button className="btn-close" onClick={() => setSelectedLogbook(null)}>×</button>
            </div>
            <div className="modal-body space-y-4">
              {/* Status Indicator */}
              {(() => {
                const st = selectedLogbook.status || 'pending';
                const cfg = STATUS_CONFIG[st] || STATUS_CONFIG.pending;
                return (
                  <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-[11px] uppercase ${cfg.bg}`}>
                    {cfg.label} {cfg.text}
                  </div>
                );
              })()}

              {/* Logbook Contents */}
              <div className="bg-surface-container-low border border-outline-variant p-4 rounded-lg space-y-3">
                {selectedLogbook.content_text && (
                  <div>
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Isi Laporan / Jawaban</label>
                    <p className="text-body-sm whitespace-pre-wrap text-primary leading-relaxed">{selectedLogbook.content_text}</p>
                  </div>
                )}
                {selectedLogbook.content_url && (
                  <div>
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-1">Tautan URL Luaran</label>
                    <a href={selectedLogbook.content_url} target="_blank" rel="noopener noreferrer" className="text-info hover:underline font-semibold break-all text-body-sm block">
                      🔗 {selectedLogbook.content_url}
                    </a>
                  </div>
                )}
                {selectedLogbook.content_images && selectedLogbook.content_images.length > 0 && (
                  <div>
                    <label className="text-label-sm font-bold text-on-surface-variant uppercase tracking-wider block mb-2">Lampiran Dokumentasi</label>
                    <div className="grid grid-cols-2 gap-3">
                      {selectedLogbook.content_images.map((img, i) => (
                        <a key={i} href={`${API_STORAGE}/${img}`} target="_blank" rel="noreferrer">
                          <img src={`${API_STORAGE}/${img}`} alt={`Lampiran ${i + 1}`} className="w-full h-32 object-cover rounded-lg border border-outline-variant" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Previous Rejection Notes */}
              {selectedLogbook.status === 'rejected' && selectedLogbook.feedback && (
                <div className="bg-red-50 border border-red-200 text-red-700 p-3 rounded-lg text-body-sm font-medium">
                  <strong>Catatan Penolakan Sebelumnya:</strong>
                  <p className="mt-1 font-normal italic">{selectedLogbook.feedback}</p>
                </div>
              )}

              {/* Assessment Input Forms */}
              {associationType !== 'dps' ? (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
                      Nilai Logbook (0-100) <span className="text-[11px] text-on-surface-variant/60 font-medium">— Wajib diisi untuk menyetujui</span>
                    </label>
                    <input 
                      type="number" 
                      min="0" 
                      max="100" 
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:ring-1 focus:ring-primary outline-none"
                      value={scoreForm.score} 
                      onChange={e => setScoreForm({ ...scoreForm, score: e.target.value })}
                      placeholder="Masukkan nilai 0 - 100"
                    />
                  </div>
                  <div>
                    <label className="text-label-sm font-semibold text-on-surface-variant block mb-1">
                      Catatan / Feedback <span className="text-[11px] text-on-surface-variant/60 font-medium">— Wajib diisi jika menolak logbook</span>
                    </label>
                    <textarea 
                      rows="3" 
                      className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:ring-1 focus:ring-primary outline-none resize-none"
                      value={scoreForm.feedback} 
                      onChange={e => setScoreForm({ ...scoreForm, feedback: e.target.value })}
                      placeholder="Tuliskan umpan balik atau instruksi revisi..."
                    />
                  </div>
                </div>
              ) : selectedLogbook.score !== null ? (
                <div className="pt-4 border-t border-outline-variant text-body-sm">
                  <p><strong>Nilai:</strong> <span className="text-green-700 font-bold">{selectedLogbook.score}</span></p>
                  {selectedLogbook.feedback && <p className="mt-1"><strong>Feedback:</strong> {selectedLogbook.feedback}</p>}
                </div>
              ) : (
                <div className="pt-4 border-t border-outline-variant text-[13px] text-on-surface-variant/60 italic">
                  Belum dinilai oleh DPL. DPS hanya memantau laporan.
                </div>
              )}

              {/* Actions Footer */}
              <div className="flex gap-2 justify-end pt-4 border-t border-outline-variant flex-wrap">
                <button 
                  type="button" 
                  className="py-2 px-4 border border-outline rounded-lg text-body-sm hover:bg-surface-container-low cursor-pointer" 
                  onClick={() => setSelectedLogbook(null)}
                  disabled={submitting}
                >
                  Tutup
                </button>
                {associationType !== 'dps' && (
                  <>
                    <button 
                      type="button" 
                      className="py-2 px-6 bg-error text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-transform text-body-sm shadow-sm cursor-pointer"
                      onClick={handleReject} 
                      disabled={submitting}
                    >
                      {submitting ? '...' : '❌ Tolak (Revisikan)'}
                    </button>
                    <button 
                      type="button" 
                      className="py-2 px-6 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-transform text-body-sm shadow-sm cursor-pointer"
                      onClick={handleApprove} 
                      disabled={submitting}
                    >
                      {submitting ? '...' : '✅ Setujui & Nilai'}
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
