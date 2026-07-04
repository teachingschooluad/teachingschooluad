import { useState, useEffect } from 'react';
import api from '../../lib/api';
import useAuthStore from '../../stores/authStore';
import FilterBar from '../../components/FilterBar';
import Pagination from '../../components/Pagination';

const API_STORAGE = (import.meta.env.VITE_API_URL || 'https://ejurnal.smk1kawunganten.sch.id/api/v1').replace('/ppl/api/v1', '/eppl-api/storage/app/public').replace('/api/v1', '/storage');

export default function JournalsPage() {
  const { user } = useAuthStore();
  const [grid, setGrid] = useState([]);
  const [daysInMonth, setDaysInMonth] = useState(30);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);

  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState('');
  const [classes, setClasses] = useState([]);

  // Modal
  const [selectedJournal, setSelectedJournal] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [reviewingAll, setReviewingAll] = useState(false);

  useEffect(() => { fetchClasses(); }, []);
  useEffect(() => { buildGrid(); }, [month, year, search, classId, page]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/master/classes?all=true');
      setClasses(res.data.data || []);
    } catch (err) { console.error(err); }
  };

  const buildGrid = async () => {
    setLoading(true);
    try {
      // 1. Fetch students (paginated)
      let studentUrl = `/master/students?page=${page}`;
      if (search) studentUrl += `&search=${search}`;
      if (classId) studentUrl += `&class_id=${classId}`;
      const studentsRes = await api.get(studentUrl);
      const studentsData = studentsRes.data.data;
      const students = studentsData.data || [];
      setLastPage(studentsData.last_page || 1);

      // 2. Fetch ALL journals for the selected month (no pagination, get all)
      let journalUrl = `/journals?month=${month}&year=${year}&per_page=9999`;
      const journalsRes = await api.get(journalUrl);
      const journalsRaw = journalsRes.data.data?.data || journalsRes.data.data || [];

      // 3. Build journal lookup: user_id => { day => journal }
      const lookup = {};
      const journalList = Array.isArray(journalsRaw) ? journalsRaw : [];
      journalList.forEach(j => {
        const d = new Date(j.date).getDate();
        if (!lookup[j.user_id]) lookup[j.user_id] = {};
        lookup[j.user_id][d] = j;
      });

      // 4. Calculate days in month
      const dim = new Date(year, month, 0).getDate();
      setDaysInMonth(dim);

      // 5. Build grid rows
      const rows = students.map(student => {
        const row = {
          student: {
            id: student.id,
            name: student.name,
            nis: student.nis_nip,
            class: student.kelas?.name || '-',
          },
          days: {},
          total: 0,
        };

        for (let d = 1; d <= dim; d++) {
          const j = lookup[student.id]?.[d];
          if (j) {
            row.days[d] = {
              has: 1,
              journal_id: j.id,
              reviewed: !!(j.reviewed_guru || j.reviewed_perusahaan),
            };
            row.total++;
          } else {
            row.days[d] = { has: 0 };
          }
        }

        return row;
      });

      setGrid(rows);
    } catch (err) {
      console.error('Build grid error:', err);
      setGrid([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCellClick = async (dayData) => {
    if (!dayData || dayData.has !== 1 || !dayData.journal_id) return;
    setDetailLoading(true);
    setSelectedJournal(null);
    try {
      const res = await api.get(`/journals/${dayData.journal_id}`);
      setSelectedJournal(res.data.data);
    } catch (err) {
      alert('Gagal mengambil detail jurnal');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleReview = async (id) => {
    try {
      await api.post(`/journals/${id}/review`, { _method: 'PUT' });
      // Update local grid
      setGrid(prev => prev.map(row => {
        const newDays = { ...row.days };
        for (const d in newDays) {
          if (newDays[d].journal_id === id) {
            newDays[d] = { ...newDays[d], reviewed: true };
          }
        }
        return { ...row, days: newDays };
      }));
      setSelectedJournal(null);
      alert('Jurnal berhasil direview!');
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mereview jurnal');
    }
  };

  const handleReviewAll = async () => {
    if (!window.confirm('Tandai semua jurnal bulan ini sudah diperiksa?')) return;
    setReviewingAll(true);
    try {
      const res = await api.post('/journals/review-all', { month, year, _method: 'PUT' });
      alert(res.data.message);
      buildGrid();
    } catch (err) {
      alert('Gagal menandai semua jurnal');
    } finally {
      setReviewingAll(false);
    }
  };

  // Cell styles
  const cellBase = {
    width: '28px', height: '28px', lineHeight: '28px',
    textAlign: 'center', fontSize: '12px', fontWeight: 700,
    borderRadius: '4px', cursor: 'pointer', userSelect: 'none',
    margin: '0 auto',
  };

  const getCellStyle = (dayData) => {
    if (!dayData || dayData.has === 0) {
      return { ...cellBase, background: 'var(--bg-secondary)', color: 'var(--text-muted)', cursor: 'default' };
    }
    if (dayData.reviewed) {
      return { ...cellBase, background: '#22c55e', color: '#fff' };
    }
    return { ...cellBase, background: '#f59e0b', color: '#fff' };
  };

  return (
    <div>
      {/* Header */}
      <div className="main-header" style={{ position: 'relative', padding: 0, marginBottom: '24px', background: 'transparent', border: 'none' }}>
        <div>
          <h1 className="page-title">Jurnal PKL</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Pemantauan jurnal harian siswa. <b>1</b> = ada jurnal, <b>0</b> = belum ada.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={handleReviewAll}
          disabled={reviewingAll}
          style={{ whiteSpace: 'nowrap' }}
        >
          {reviewingAll ? 'Memproses...' : '✅ Review Semua'}
        </button>
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <FilterBar onSearch={(val) => { setSearch(val); setPage(1); }} placeholder="Cari Nama Siswa...">
          <select className="form-select" value={classId} onChange={(e) => { setClassId(e.target.value); setPage(1); }}>
            <option value="">Semua Kelas</option>
            {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <select className="form-select" value={month} onChange={(e) => { setMonth(Number(e.target.value)); setPage(1); }}>
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => (
              <option key={m} value={m}>{new Date(0, m - 1).toLocaleString('id-ID', { month: 'long' })}</option>
            ))}
          </select>
          <select className="form-select" value={year} onChange={(e) => { setYear(Number(e.target.value)); setPage(1); }}>
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </FilterBar>
      </div>

      {/* Grid Table */}
      <div className="card">
        {loading ? (
          <div className="card-body empty-state loading">Memuat data...</div>
        ) : !grid.length ? (
          <div className="card-body empty-state">
            <div className="icon">📝</div>
            <h3>Belum ada data siswa</h3>
            <p>Tidak ada data siswa ditemukan. Pastikan data siswa sudah diimport.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', padding: '8px 16px', textAlign: 'right' }}>
              💡 Klik angka <b>1</b> untuk melihat detail jurnal & review
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid var(--border-color)' }}>
                  <th style={{
                    position: 'sticky', left: 0, background: 'var(--bg-secondary)', zIndex: 10,
                    padding: '10px 12px', textAlign: 'left', minWidth: '180px'
                  }}>Nama Siswa</th>
                  {[...Array(daysInMonth)].map((_, i) => (
                    <th key={i} style={{ textAlign: 'center', padding: '8px 2px', minWidth: '32px', fontSize: '11px' }}>
                      {i + 1}
                    </th>
                  ))}
                  <th style={{ textAlign: 'center', padding: '8px', minWidth: '50px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {grid.map((row) => (
                  <tr key={row.student.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{
                      position: 'sticky', left: 0, background: 'var(--bg-card)', zIndex: 10,
                      padding: '8px 12px'
                    }}>
                      <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '170px' }} title={row.student.name}>
                        {row.student.name}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        {row.student.nis} • {row.student.class}
                      </div>
                    </td>
                    {[...Array(daysInMonth)].map((_, i) => {
                      const dayData = row.days[i + 1];
                      const hasJournal = dayData?.has === 1;
                      return (
                        <td key={i} style={{ padding: '3px 1px', textAlign: 'center' }}>
                          <div
                            style={getCellStyle(dayData)}
                            title={hasJournal ? (dayData.reviewed ? 'Sudah direview - Klik untuk detail' : 'Belum direview - Klik untuk detail & review') : 'Belum ada jurnal'}
                            onClick={() => handleCellClick(dayData)}
                          >
                            {hasJournal ? '1' : '0'}
                          </div>
                        </td>
                      );
                    })}
                    <td style={{ textAlign: 'center', fontWeight: 700, padding: '8px', fontSize: '13px' }}>
                      {row.total}/{daysInMonth}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />}

      {/* Legend */}
      <div style={{ display: 'flex', gap: '20px', marginTop: '16px', fontSize: '12px', color: 'var(--text-secondary)', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ ...cellBase, width: '22px', height: '22px', lineHeight: '22px', fontSize: '11px', background: '#22c55e', color: '#fff' }}>1</div>
          Sudah Direview
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ ...cellBase, width: '22px', height: '22px', lineHeight: '22px', fontSize: '11px', background: '#f59e0b', color: '#fff' }}>1</div>
          Belum Direview
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <div style={{ ...cellBase, width: '22px', height: '22px', lineHeight: '22px', fontSize: '11px', background: 'var(--bg-secondary)', color: 'var(--text-muted)' }}>0</div>
          Belum Ada Jurnal
        </div>
      </div>

      {/* Detail Modal */}
      {(detailLoading || selectedJournal) && (
        <div className="modal-overlay" onClick={() => setSelectedJournal(null)}>
          <div className="modal-content" onClick={e => e.stopPropagation()} style={{ maxWidth: '600px', width: '90%' }}>
            <div className="modal-header">
              <h3>Detail Jurnal</h3>
              <button className="btn-close" onClick={() => setSelectedJournal(null)}>×</button>
            </div>
            <div className="modal-body">
              {detailLoading ? (
                <div style={{ textAlign: 'center', padding: '40px' }}>Memuat detail jurnal...</div>
              ) : selectedJournal ? (
                <div>
                  <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                    <strong style={{ fontSize: '16px' }}>{selectedJournal.user?.name}</strong>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                      📅 {selectedJournal.date}
                    </div>
                    <div style={{ marginTop: '8px' }}>
                      {selectedJournal.reviewed_guru || selectedJournal.reviewed_perusahaan ? (
                        <span style={{ background: '#22c55e', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                          ✓ Sudah Direview
                        </span>
                      ) : (
                        <span style={{ background: '#f59e0b', color: '#fff', padding: '3px 10px', borderRadius: '12px', fontSize: '12px', fontWeight: 600 }}>
                          ⏳ Belum Direview
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Kegiatan</div>
                    <h3 style={{ fontSize: '15px', margin: 0 }}>{selectedJournal.kegiatan}</h3>
                  </div>

                  <div style={{ marginBottom: '16px' }}>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Deskripsi</div>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
                      {selectedJournal.deskripsi}
                    </p>
                  </div>

                  {selectedJournal.photos?.length > 0 && (
                    <div style={{ marginBottom: '16px' }}>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Lampiran Foto</div>
                      <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '8px' }}>
                        {selectedJournal.photos.map((photo, idx) => (
                          <a key={idx} href={`${API_STORAGE}/${photo}`} target="_blank" rel="noreferrer">
                            <img
                              src={`${API_STORAGE}/${photo}`}
                              alt="Lampiran"
                              style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px', border: '1px solid var(--border-color)' }}
                            />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '12px', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--border-color)' }}>
                    {!(selectedJournal.reviewed_guru && selectedJournal.reviewed_perusahaan) && (
                      <button
                        className="btn btn-primary"
                        style={{ flex: 1 }}
                        onClick={() => handleReview(selectedJournal.id)}
                      >
                        ✅ Tandai Sudah Direview
                      </button>
                    )}
                    <button className="btn btn-outline" style={{ flex: 1 }} onClick={() => setSelectedJournal(null)}>
                      Tutup
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
