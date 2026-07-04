import { useState } from 'react';
import api from '../../lib/api';

export default function ParentTrackingPage() {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [selectedItem, setSelectedItem] = useState(null);
  const [itemType, setItemType] = useState(null);

  const getFullImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    const API_STORAGE = (import.meta.env.VITE_API_URL || 'https://eppl.uad.ac.id/api/v1').replace('/ppl/api/v1', '/eppl-api/storage/app/public').replace('/api/v1', '/storage');
    // Ensure we don't double up slashes if path already has a leading slash
    const cleanPath = path.startsWith('/') ? path.substring(1) : path;
    return `${API_STORAGE}/${cleanPath}`;
  };

  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!query || query.length < 3) {
      setError('Masukkan minimal 3 karakter NIM atau Nama.');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const res = await api.get('/public/tracking', { 
        params: { query, month, year } 
      });
      setResult(res.data.data);
    } catch (err) {
      setResult(null);
      setError(err.response?.data?.message || 'Data mahasiswa tidak ditemukan.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (newMonth, newYear) => {
    setMonth(newMonth);
    setYear(newYear);
    if (result) {
      setTimeout(() => handleSearch(), 0);
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #001f3f 0%, #003d7a 100%)', // UAD themed navy gradient
      padding: '40px 0',
      color: '#f8fafc',
      fontFamily: '"Inter", sans-serif'
    }}>
      <div className="container" style={{ maxWidth: '900px', margin: '0 auto', padding: '0 20px' }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <h1 style={{ color: '#ffffff', marginBottom: '12px', fontSize: '2.5rem', fontWeight: 800, textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>Portal Pemantauan Orang Tua</h1>
          <p style={{ color: '#cbd5e1', fontSize: '1.1rem' }}>Pantau kehadiran dan logbook PPL anak Anda secara komprehensif dan real-time</p>
        </div>

        {/* Search Card */}
        <div className="card" style={{ 
          marginBottom: '32px', 
          background: 'rgba(255, 255, 255, 0.05)', 
          backdropFilter: 'blur(10px)', 
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '16px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
        }}>
          <div className="card-body" style={{ padding: '24px' }}>
            <form onSubmit={handleSearch} style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
              <div style={{ flex: '1 1 200px' }}>
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Masukkan NIM atau Nama Mahasiswa..." 
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  style={{ 
                    padding: '16px', 
                    fontSize: '16px', 
                    borderRadius: '12px', 
                    background: 'rgba(255, 255, 255, 0.9)', 
                    border: 'none',
                    color: '#0f172a'
                  }}
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={loading} style={{ 
                padding: '16px 32px', 
                borderRadius: '12px', 
                fontSize: '16px', 
                fontWeight: 'bold',
                background: 'linear-gradient(135deg, #003d7a 0%, #0056b3 100%)',
                border: 'none',
                boxShadow: '0 4px 12px rgba(0, 61, 122, 0.4)'
              }}>
                {loading ? 'Mencari Data...' : 'Cari Data Anak'}
              </button>
            </form>
            {error && <div style={{ color: '#fca5a5', marginTop: '16px', fontSize: '15px', fontWeight: 500, textAlign: 'center' }}>{error}</div>}
          </div>
        </div>

        {/* Results Area */}
        {result && (
          <div style={{ animation: 'fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            
            {/* Filter Area */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
              <h2 style={{ fontSize: '24px', color: '#f8fafc', margin: 0, fontWeight: 700 }}>Hasil Pemantauan</h2>
              <div style={{ display: 'flex', gap: '12px' }}>
                <select 
                  value={month} 
                  onChange={(e) => handleFilterChange(e.target.value, year)}
                  style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', outline: 'none', cursor: 'pointer' }}
                >
                  {Array.from({ length: 12 }, (_, i) => (
                    <option key={i + 1} value={i + 1} style={{ color: '#0f172a' }}>Bulan {i + 1}</option>
                  ))}
                </select>
                <select 
                  value={year} 
                  onChange={(e) => handleFilterChange(month, e.target.value)}
                  style={{ padding: '10px 16px', borderRadius: '8px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)', outline: 'none', cursor: 'pointer' }}
                >
                  {[2024, 2025, 2026, 2027].map(y => (
                    <option key={y} value={y} style={{ color: '#0f172a' }}>{y}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Profile Summary */}
            <div className="card" style={{ 
              marginBottom: '32px', 
              background: 'rgba(255,255,255,0.95)',
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
            }}>
              <div style={{ height: '6px', background: 'linear-gradient(90deg, #003d7a, #ffd700)' }}></div>
              <div className="card-body" style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
                  <div>
                    <h3 style={{ fontSize: '28px', marginBottom: '8px', color: '#0f172a', fontWeight: 800 }}>{result.student.name}</h3>
                    <p style={{ color: '#475569', fontSize: '16px', margin: 0, fontWeight: 500 }}>
                      <span style={{ background: '#e2e8f0', padding: '4px 10px', borderRadius: '6px', marginRight: '8px' }}>NIM: {result.student.nis}</span>
                      <span style={{ background: '#e2e8f0', padding: '4px 10px', borderRadius: '6px' }}>Kelompok: {result.student.class}</span>
                    </p>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '24px', background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                  <div>
                    <div style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 600 }}>Instansi Mitra PPL</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{result.student.company}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px', fontWeight: 600 }}>Dosen Pembimbing</div>
                    <div style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b' }}>{result.student.guru}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '20px', marginBottom: '32px' }}>
              {[
                { label: 'Hadir', value: result.summary.hadir, color: '#10b981', bg: 'rgba(16,185,129,0.1)' },
                { label: 'Izin', value: result.summary.izin, color: '#f59e0b', bg: 'rgba(245,158,11,0.1)' },
                { label: 'Sakit', value: result.summary.sakit, color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
                { label: 'Alpa', value: result.summary.alpa, color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
              ].map((stat, idx) => (
                <div key={idx} className="card" style={{ 
                  textAlign: 'center', 
                  padding: '24px 16px', 
                  background: 'rgba(255,255,255,0.95)',
                  borderRadius: '16px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                  borderBottom: `4px solid ${stat.color}`
                }}>
                  <div style={{ fontSize: '36px', fontWeight: 800, color: stat.color, lineHeight: 1 }}>{stat.value}</div>
                  <div style={{ fontSize: '15px', color: '#64748b', marginTop: '8px', fontWeight: 600 }}>{stat.label}</div>
                </div>
              ))}
              <div className="card" style={{ 
                textAlign: 'center', 
                padding: '24px 16px', 
                background: 'linear-gradient(135deg, #003d7a 0%, #0056b3 100%)',
                borderRadius: '16px',
                gridColumn: '1 / -1',
                boxShadow: '0 8px 20px rgba(0,61,122,0.3)',
                color: 'white'
              }}>
                <div style={{ fontSize: '36px', fontWeight: 800, lineHeight: 1 }}>{result.summary.journals_count}</div>
                <div style={{ fontSize: '15px', marginTop: '8px', fontWeight: 500, opacity: 0.9 }}>Total Logbook Dibuat Bulan Ini</div>
              </div>
            </div>

            {/* Detailed Lists */}
            <div style={{ display: 'grid', gap: '24px', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))' }}>
              
              {/* Attendance List */}
              <div className="card" style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>📅</span>
                  <h3 style={{ fontSize: '18px', margin: 0, color: '#0f172a', fontWeight: 700 }}>Rincian Presensi Harian</h3>
                </div>
                <div style={{ padding: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                  {result.attendances.length === 0 ? (
                    <div style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8' }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>📭</div>
                      Belum ada catatan presensi bulan ini
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {result.attendances.map((a, i) => (
                        <div key={i} 
                          onClick={() => { setSelectedItem(a); setItemType('attendance'); }}
                          style={{ 
                          padding: '16px', 
                          background: '#ffffff', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '12px',
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                        >
                          <div>
                            <div style={{ fontWeight: 700, color: '#1e293b', fontSize: '15px', marginBottom: '6px' }}>
                              {new Date(a.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div style={{ fontSize: '13px', color: '#64748b', display: 'flex', gap: '12px' }}>
                              {a.status === 'hadir' ? (
                                <>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ color: '#10b981' }}>●</span> Masuk: <strong style={{ color: '#334155' }}>{a.check_in || '-'}</strong>
                                  </span>
                                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                                    <span style={{ color: '#ef4444' }}>●</span> Pulang: <strong style={{ color: '#334155' }}>{a.check_out || '-'}</strong>
                                  </span>
                                </>
                              ) : (
                                <span>Tidak hadir pada hari ini</span>
                              )}
                            </div>
                          </div>
                          <div style={{ 
                            padding: '6px 12px', 
                            borderRadius: '20px', 
                            fontSize: '12px', 
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background: a.status === 'hadir' ? '#dcfce7' : a.status === 'alpa' ? '#fee2e2' : '#fef3c7',
                            color: a.status === 'hadir' ? '#166534' : a.status === 'alpa' ? '#991b1b' : '#92400e'
                          }}>
                            {a.status}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Logbook List */}
              <div className="card" style={{ background: 'rgba(255,255,255,0.95)', borderRadius: '16px', overflow: 'hidden' }}>
                <div style={{ padding: '20px 24px', background: '#f1f5f9', borderBottom: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '20px' }}>📝</span>
                  <h3 style={{ fontSize: '18px', margin: 0, color: '#0f172a', fontWeight: 700 }}>Rincian Logbook Harian</h3>
                </div>
                <div style={{ padding: '12px', maxHeight: '500px', overflowY: 'auto' }}>
                  {result.journals.length === 0 ? (
                    <div style={{ padding: '40px 24px', textAlign: 'center', color: '#94a3b8' }}>
                      <div style={{ fontSize: '40px', marginBottom: '12px' }}>📄</div>
                      Belum ada logbook yang diisi bulan ini
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {result.journals.map((j, i) => (
                        <div key={i} 
                          onClick={() => { setSelectedItem(j); setItemType('journal'); }}
                          style={{ 
                          padding: '16px', 
                          background: '#ffffff', 
                          border: '1px solid #e2e8f0', 
                          borderRadius: '12px',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                        }}
                        onMouseOver={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
                        onMouseOut={(e) => e.currentTarget.style.transform = 'none'}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', paddingBottom: '10px', borderBottom: '1px dashed #cbd5e1' }}>
                            <div style={{ fontWeight: 700, color: '#3b82f6', fontSize: '14px' }}>
                              {new Date(j.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            {j.reviewed ? (
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#059669', background: '#d1fae5', padding: '4px 10px', borderRadius: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                ✓ Dinilai
                              </span>
                            ) : (
                              <span style={{ fontSize: '12px', fontWeight: 600, color: '#b45309', background: '#fef3c7', padding: '4px 10px', borderRadius: '20px' }}>
                                ⏳ Menunggu
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '15px', color: '#334155', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                            {j.kegiatan}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Modal for Details & Photo */}
        {selectedItem && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, 
            background: 'rgba(0,0,0,0.7)', zIndex: 1000,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px'
          }} onClick={() => setSelectedItem(null)}>
            <div style={{
              background: '#fff', borderRadius: '16px', padding: '24px', 
              maxWidth: '500px', width: '100%', maxHeight: '90vh', overflowY: 'auto',
              color: '#0f172a'
            }} onClick={(e) => e.stopPropagation()}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #e2e8f0', paddingBottom: '12px' }}>
                <h3 style={{ margin: 0, fontSize: '20px', fontWeight: 700 }}>
                  Detail {itemType === 'attendance' ? 'Presensi' : 'Logbook'}
                </h3>
                <button onClick={() => setSelectedItem(null)} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#64748b' }}>&times;</button>
              </div>

              <div style={{ marginBottom: '16px', fontWeight: 600, color: '#3b82f6' }}>
                {new Date(selectedItem.date).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
              </div>

              {itemType === 'attendance' ? (
                <div style={{ marginBottom: '20px' }}>
                  <p><strong>Status:</strong> <span style={{ textTransform: 'uppercase' }}>{selectedItem.status}</span></p>
                  {selectedItem.status === 'hadir' && (
                    <>
                      <p><strong>Jam Masuk:</strong> {selectedItem.check_in || '-'}</p>
                      <p><strong>Jam Pulang:</strong> {selectedItem.check_out || '-'}</p>
                    </>
                  )}
                </div>
              ) : (
                <div style={{ marginBottom: '20px' }}>
                  <p><strong>Status Penilaian:</strong> {selectedItem.reviewed ? 'Sudah Dinilai' : 'Menunggu'}</p>
                  <p><strong>Judul Penugasan:</strong></p>
                  <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '8px', whiteSpace: 'pre-wrap' }}>
                    {selectedItem.kegiatan}
                  </div>
                </div>
              )}

              <div style={{ marginTop: '20px' }}>
                <p style={{ fontWeight: 600, marginBottom: '8px' }}>Foto Lampiran:</p>
                {itemType === 'attendance' ? (
                  selectedItem.photo ? (
                    <img 
                      src={getFullImageUrl(selectedItem.photo)} 
                      alt="Lampiran" 
                      style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', objectFit: 'cover' }} 
                    />
                  ) : (
                    <div style={{ background: '#f1f5f9', padding: '32px', textAlign: 'center', borderRadius: '12px', color: '#94a3b8' }}>
                      Tidak ada foto terlampir
                    </div>
                  )
                ) : (
                  selectedItem.photos && selectedItem.photos.length > 0 ? (
                    <div style={{ display: 'grid', gap: '12px', gridTemplateColumns: selectedItem.photos.length > 1 ? '1fr 1fr' : '1fr' }}>
                      {selectedItem.photos.map((p, idx) => (
                        <img 
                          key={idx}
                          src={getFullImageUrl(p)} 
                          alt={`Lampiran ${idx+1}`} 
                          style={{ width: '100%', borderRadius: '12px', border: '1px solid #e2e8f0', objectFit: 'cover' }} 
                        />
                      ))}
                    </div>
                  ) : (
                    <div style={{ background: '#f1f5f9', padding: '32px', textAlign: 'center', borderRadius: '12px', color: '#94a3b8' }}>
                      Tidak ada foto terlampir
                    </div>
                  )
                )}
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
