import { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function MahasiswaLogbook() {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null); // The selected assignment & submission detail
  const [inputText, setInputText] = useState('');
  const [inputUrl, setInputUrl] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const fetchSummary = async () => {
    setLoading(true);
    try {
      const res = await api.get('/logbooks/summary');
      if (res.data.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil data logbook');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSummary();
  }, []);

  const handleFileChange = (e) => {
    setSelectedFiles(Array.from(e.target.files));
  };

  const handleOpenAssignment = (item) => {
    setSelectedItem(item);
    if (item.submitted && item.logbook) {
      setInputText(item.logbook.content_text || '');
      setInputUrl(item.logbook.content_url || '');
    } else {
      setInputText('');
      setInputUrl('');
      setSelectedFiles([]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedItem) return;

    setSubmitting(true);
    try {
      const formData = new FormData();
      const isRevision = selectedItem.submitted && selectedItem.logbook?.status === 'rejected';

      if (isRevision) {
        formData.append('_method', 'PUT');
      } else {
        formData.append('assignment_id', selectedItem.assignment.id);
      }

      if (selectedItem.assignment.type === 'essay') {
        if (!inputText.trim()) {
          toast.error('Essay wajib diisi');
          setSubmitting(false);
          return;
        }
        formData.append('content_text', inputText);
      } else if (selectedItem.assignment.type === 'url') {
        if (!inputUrl.trim()) {
          toast.error('URL Wajib diisi');
          setSubmitting(false);
          return;
        }
        formData.append('content_url', inputUrl);
      } else if (selectedItem.assignment.type === 'image') {
        // If revision, uploading files is optional
        if (!isRevision && selectedFiles.length === 0) {
          toast.error('Minimal upload 1 gambar');
          setSubmitting(false);
          return;
        }
        selectedFiles.forEach((file) => {
          formData.append('photos[]', file);
        });
      }

      let res;
      if (isRevision) {
        res = await api.post(`/logbooks/${selectedItem.logbook.id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        res = await api.post('/logbooks', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }

      if (res.data.success) {
        toast.success(isRevision ? 'Revisi logbook berhasil dikirim!' : 'Logbook berhasil dikirim!');
        setSelectedItem(null);
        fetchSummary();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal mengirim logbook');
    } finally {
      setSubmitting(false);
    }
  };

  const getStorageUrl = (path) => {
    const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
    return baseUrl.replace('/api/v1', '') + '/storage/' + path;
  };

  if (loading) return <div className="student-loading"><div className="spinner" /></div>;

  return (
    <div className="student-page fade-in">
      <h2 className="student-page-title">Logbook PPL</h2>

      {/* Summary Cards */}
      <div className="student-stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '20px' }}>
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Total Tugas</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)' }}>{summary?.total_assignments || 0}</div>
        </div>
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Selesai</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: '#22c55e' }}>{summary?.completed_assignments || 0}</div>
        </div>
        <div style={{ background: '#ffffff', borderRadius: '12px', padding: '12px', textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.02)', border: '1px solid rgba(0,0,0,0.05)' }}>
          <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>Rata-rata Nilai</div>
          <div style={{ fontSize: '18px', fontWeight: '700', color: 'var(--primary)' }}>{summary?.average_score ? summary.average_score : '-'}</div>
        </div>
      </div>

      {/* Assignment List */}
      <div className="student-list" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {summary?.details?.map((item) => {
          const typeLabels = { essay: 'Essay 📝', url: 'URL Link 🔗', image: 'Unggah Gambar 📷' };
          
          let badgeText = '⏳ Belum';
          let badgeColor = '#f59e0b';
          let badgeBg = 'rgba(245, 158, 11, 0.1)';

          if (item.submitted && item.logbook) {
            const status = item.logbook.status || 'pending';
            if (status === 'approved') {
              badgeText = item.logbook.score !== null ? `✅ Nilai: ${item.logbook.score}` : '✅ Disetujui';
              badgeColor = '#22c55e';
              badgeBg = 'rgba(34, 197, 94, 0.1)';
            } else if (status === 'rejected') {
              badgeText = '❌ Perlu Revisi';
              badgeColor = '#ef4444';
              badgeBg = 'rgba(239, 68, 68, 0.1)';
            } else {
              badgeText = '⏳ Menunggu';
              badgeColor = '#3b82f6';
              badgeBg = 'rgba(59, 130, 246, 0.1)';
            }
          }

          return (
            <div
              key={item.assignment.id}
              onClick={() => handleOpenAssignment(item)}
              style={{
                background: '#ffffff',
                border: '1px solid rgba(0,0,0,0.06)',
                borderRadius: '16px',
                padding: '16px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(0,0,0,0.02)',
                position: 'relative',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '11px', background: '#f1f5f9', color: '#64748b', padding: '4px 8px', borderRadius: '6px', fontWeight: '600' }}>
                  {typeLabels[item.assignment.type] || item.assignment.type}
                </span>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '700',
                    color: badgeColor,
                    background: badgeBg,
                    padding: '4px 8px',
                    borderRadius: '6px'
                  }}
                >
                  {badgeText}
                </span>
              </div>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 6px 0' }}>{item.assignment.title}</h3>
              <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: 0, lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {item.assignment.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Detail & Action Modal */}
      {selectedItem && (
        <div
          style={{
            position: 'fixed',
            top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(15, 23, 42, 0.6)',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            zIndex: 1000,
            backdropFilter: 'blur(4px)'
          }}
          onClick={() => setSelectedItem(null)}
        >
          <div
            style={{
              background: '#ffffff',
              width: '100%',
              maxWidth: '500px',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '24px',
              boxShadow: '0 -8px 30px rgba(0,0,0,0.1)',
              maxHeight: '90vh',
              overflowY: 'auto'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', margin: 0 }}>Detail Penugasan</h3>
              <button
                onClick={() => setSelectedItem(null)}
                style={{ background: '#f1f5f9', border: 'none', borderRadius: '50%', width: '28px', height: '28px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#64748b' }}
              >
                ✕
              </button>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <h4 style={{ fontSize: '15px', fontWeight: '600', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>{selectedItem.assignment.title}</h4>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0, whiteSpace: 'pre-wrap' }}>{selectedItem.assignment.description}</p>
            </div>

            {/* If logbook is rejected, show DPL feedback prominently */}
            {selectedItem.submitted && selectedItem.logbook?.status === 'rejected' && (
              <div style={{
                padding: '12px 16px',
                background: 'rgba(239, 68, 68, 0.08)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                borderRadius: '12px',
                marginBottom: '20px',
                color: '#ef4444',
                fontSize: '13px'
              }}>
                <strong>❌ Ditolak oleh Dosen Pembimbing:</strong>
                <p style={{ margin: '4px 0 0 0', fontStyle: 'italic' }}>{selectedItem.logbook.feedback || 'Silakan lakukan revisi sesuai instruksi.'}</p>
              </div>
            )}

            {(!selectedItem.submitted || selectedItem.logbook?.status === 'rejected') ? (
              // Submit Form / Revision Form
              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                {selectedItem.assignment.type === 'essay' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>Esai Jawaban</label>
                    <textarea
                      rows={5}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      placeholder="Tuliskan laporan esai Anda di sini..."
                      required
                      style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', fontFamily: 'inherit', outline: 'none' }}
                    />
                  </div>
                )}

                {selectedItem.assignment.type === 'url' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>URL Luaran / Google Drive</label>
                    <input
                      type="url"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      placeholder="https://..."
                      required
                      style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '13px', outline: 'none' }}
                    />
                  </div>
                )}

                {selectedItem.assignment.type === 'image' && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {selectedItem.submitted && selectedItem.logbook?.content_images && (
                      <div style={{ marginBottom: '10px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '6px' }}>Gambar Sebelumnya:</span>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                          {selectedItem.logbook.content_images.map((path, idx) => (
                            <img
                              key={idx}
                              src={getStorageUrl(path)}
                              alt={`Sebelumnya-${idx + 1}`}
                              style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                    <label style={{ fontSize: '12px', fontWeight: '600', color: '#64748b' }}>
                      {selectedItem.submitted ? 'Unggah Gambar Baru (Opsional)' : 'Unggah Gambar Dokumentasi (Max 5)'}
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleFileChange}
                      required={!selectedItem.submitted}
                      style={{ fontSize: '13px' }}
                    />
                    {selectedFiles.length > 0 && (
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        Selected: {selectedFiles.map(f => f.name).join(', ')}
                      </div>
                    )}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    background: 'var(--primary)',
                    color: '#fff',
                    border: 'none',
                    padding: '12px',
                    borderRadius: '8px',
                    fontWeight: '600',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginTop: '12px'
                  }}
                >
                  {submitting ? <div className="spinner-sm" /> : (selectedItem.submitted ? '🚀 Kirim Revisi' : '🚀 Kirim Logbook')}
                </button>
              </form>
            ) : (
              // Submitted and not rejected (Pending or Approved)
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                <div>
                  <h5 style={{ fontSize: '12px', fontWeight: '600', color: '#64748b', margin: '0 0 6px 0' }}>Jawaban Anda:</h5>
                  {selectedItem.assignment.type === 'essay' && (
                    <div style={{ padding: '12px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px', whiteSpace: 'pre-wrap', color: 'var(--text-primary)' }}>
                      {selectedItem.logbook?.content_text}
                    </div>
                  )}
                  {selectedItem.assignment.type === 'url' && (
                    <a
                      href={selectedItem.logbook?.content_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ color: 'var(--primary)', textDecoration: 'underline', fontSize: '13px', fontWeight: '600' }}
                    >
                      🔗 {selectedItem.logbook?.content_url}
                    </a>
                  )}
                  {selectedItem.assignment.type === 'image' && selectedItem.logbook?.content_images && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                      {selectedItem.logbook.content_images.map((path, idx) => (
                        <img
                          key={idx}
                          src={getStorageUrl(path)}
                          alt={`Upload-${idx + 1}`}
                          style={{ width: '100%', height: '120px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #e2e8f0' }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Score & Feedback */}
                {selectedItem.logbook?.status === 'approved' ? (
                  <div style={{ padding: '16px', background: 'rgba(0, 61, 122, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 61, 122, 0.1)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--primary)' }}>Nilai Dosen</span>
                      <span style={{ fontSize: '20px', fontWeight: '800', color: 'var(--primary)' }}>{selectedItem.logbook.score}</span>
                    </div>
                    {selectedItem.logbook.feedback && (
                      <div style={{ borderTop: '1px dashed rgba(0, 61, 122, 0.2)', paddingTop: '8px' }}>
                        <span style={{ fontSize: '11px', fontWeight: '600', color: '#64748b', display: 'block', marginBottom: '4px' }}>Catatan/Feedback:</span>
                        <p style={{ fontSize: '12px', color: 'var(--text-primary)', margin: 0, fontStyle: 'italic' }}>{selectedItem.logbook.feedback}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: '#eff6ff', borderRadius: '8px', border: '1px solid #bfdbfe', color: '#1e3a8a', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span>⏳</span> Menunggu penilaian dari Dosen Pembimbing.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
