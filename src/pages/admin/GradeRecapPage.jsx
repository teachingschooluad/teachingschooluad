import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import useAuthStore from '../../stores/authStore';
import { HiOutlineSearch, HiOutlineDownload } from 'react-icons/hi';

export default function GradeRecapPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'dkl';
  const isDpl = user?.role === 'dpl';
  const isGuruPamong = user?.role === 'guru_pamong';

  const [recapData, setRecapData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState('');

  const fetchRecap = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) params.search = search;
      if (classId) params.class_id = classId;

      const { data } = await api.get('/grades/final', { params });
      if (data.success) {
        setRecapData(data.data);
      }
    } catch (err) {
      toast.error('Gagal memuat rekap nilai');
    } finally {
      setLoading(false);
    }
  };

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/master/classes?all=true');
      setClasses(data.data?.data || data.data || data || []);
    } catch (err) {
      console.error('Gagal memuat kelompok', err);
    }
  };

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchRecap();
  }, [search, classId]);

  const handleExport = () => {
    // Basic CSV export
    if (!recapData || !recapData.recap || recapData.recap.length === 0) return;
    
    let csv = 'NIM,Nama,Kelompok PPL,DPL,Mitra,Rata Logbook,Rata Asesmen Akhir,% Presensi,Nilai Akhir\n';
    recapData.recap.forEach((r) => {
      csv += `"${r.student.nim_nidn}","${r.student.name}","${r.student.kelompok_ppl}","${r.student.dpl}","${r.student.mitra}",${r.components.logbook.average},${r.components.final_assessment.average},${r.components.attendance.rate},${r.final_grade}\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'rekap_nilai_ppl.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title">📊 Penilaian Mahasiswa PPL</h1>
        <button className="btn btn-primary" onClick={handleExport} disabled={!recapData || !recapData.recap || recapData.recap.length === 0}>
          <HiOutlineDownload /> Ekspor CSV
        </button>
      </div>

      {/* Weights Info Card */}
      {recapData?.weights && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '24px', alignItems: 'center' }}>
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>Bobot Penilaian Aktif:</span>
            <div style={{ display: 'flex', gap: '16px', fontSize: '14px' }}>
              <span className="badge badge-info">Asesmen Akhir: {recapData.weights.bobot_asesmen_akhir}%</span>
              <span className="badge badge-warning">Logbook Harian: {recapData.weights.bobot_logbook}%</span>
              <span className="badge badge-success">Presensi Kehadiran: {recapData.weights.bobot_kehadiran}%</span>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div className="form-group" style={{ flex: 1, minWidth: '200px', margin: 0 }}>
            <div style={{ position: 'relative' }}>
              <input
                className="form-input"
                style={{ paddingLeft: '32px' }}
                placeholder="Cari nama atau NIM..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span style={{ position: 'absolute', left: '10px', top: '12px', color: 'var(--text-secondary)' }}>
                <HiOutlineSearch size={18} />
              </span>
            </div>
          </div>

          <div className="form-group" style={{ width: '200px', margin: 0 }}>
            <select className="form-select" value={classId} onChange={(e) => setClassId(e.target.value)}>
              <option value="">-- Semua Kelompok PPL --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="loading" style={{ textAlign: 'center', padding: '40px' }}>Memuat...</div>
      ) : !recapData || !recapData.recap || recapData.recap.length === 0 ? (
        <div className="card">
          <div className="card-body empty-state">
            <div className="icon">📊</div>
            <h3>Data Nilai Kosong</h3>
            <p style={{ marginTop: '8px' }}>Tidak ada data rekap nilai mahasiswa.</p>
          </div>
        </div>
      ) : (
        <div className="card" style={{ overflowX: 'auto' }}>
          <div className="card-body" style={{ padding: 0 }}>
            <table className="table">
              <thead>
                <tr>
                  <th>NIM</th>
                  <th>Nama Lengkap</th>
                  <th>Kelompok PPL</th>
                  <th style={{ textAlign: 'center' }}>Rata Logbook ({recapData.weights.bobot_logbook}%)</th>
                  <th style={{ textAlign: 'center' }}>% Hadir ({recapData.weights.bobot_kehadiran}%)</th>
                  <th style={{ textAlign: 'center' }}>Skor DPL</th>
                  <th style={{ textAlign: 'center' }}>Skor GP</th>
                  <th style={{ textAlign: 'center', fontWeight: '700' }}>Nilai Akhir ({recapData.weights.bobot_asesmen_akhir}%)</th>
                  {(isAdmin || isDpl || isGuruPamong) && <th style={{ textAlign: 'center' }}>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {recapData.recap.map((row) => (
                  <tr key={row.student.id}>
                    <td style={{ fontSize: '13px', fontWeight: '600' }}>{row.student.nim_nidn}</td>
                    <td>
                      <div style={{ fontWeight: '600' }}>{row.student.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>DPL: {row.student.dpl} • Mitra: {row.student.mitra}</div>
                    </td>
                    <td>{row.student.kelompok_ppl}</td>
                    <td style={{ textAlign: 'center', fontWeight: '600', color: 'var(--secondary)' }}>
                      {row.components.logbook.average}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '600', color: '#22c55e' }}>
                      {row.components.attendance.rate}%
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '600', color: 'var(--primary)' }}>
                      {row.components.final_assessment.dpl_score !== null ? row.components.final_assessment.dpl_score : '—'}
                    </td>
                    <td style={{ textAlign: 'center', fontWeight: '600', color: 'var(--info)' }}>
                      {row.components.final_assessment.gp_score !== null ? row.components.final_assessment.gp_score : '—'}
                    </td>
                    <td style={{ textAlign: 'center', fontSize: '16px', fontWeight: '800', color: 'var(--primary)' }}>
                      {row.final_grade}
                    </td>
                    {(isAdmin || isDpl || isGuruPamong) && (
                      <td style={{ textAlign: 'center' }}>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                          {(isAdmin || isDpl) && (
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => {
                                const prefix = isDpl ? '/dpl' : '/admin';
                                navigate(`${prefix}/instruments/${row.components.final_assessment.dpl_instrument_id}/fill/${row.student.id}`);
                              }}
                              disabled={!row.components.final_assessment.dpl_instrument_id}
                              title={row.components.final_assessment.dpl_instrument_id ? "Isi Instrumen DPL" : "Instrumen DPL belum aktif"}
                            >
                              📝 Penilaian Akhir
                            </button>
                          )}
                          {(isAdmin || isGuruPamong) && (
                            <button
                              className="btn btn-sm btn-secondary"
                              onClick={() => {
                                const prefix = isGuruPamong ? '/guru-pamong' : '/admin';
                                navigate(`${prefix}/instruments/${row.components.final_assessment.gp_instrument_id}/fill/${row.student.id}`);
                              }}
                              disabled={!row.components.final_assessment.gp_instrument_id}
                              title={row.components.final_assessment.gp_instrument_id ? "Isi Instrumen Guru Pamong" : "Instrumen Guru Pamong belum aktif"}
                            >
                              📝 Penilaian Akhir
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
