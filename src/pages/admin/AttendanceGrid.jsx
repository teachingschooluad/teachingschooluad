import { useState, useEffect } from 'react';
import api from '../../lib/api';
import useAuthStore from '../../stores/authStore';
import Pagination from '../../components/Pagination';

const API_STORAGE = (import.meta.env.VITE_API_URL || 'https://eppl.uad.ac.id/api/v1').replace('/ppl/api/v1', '/eppl-api/storage/app/public').replace('/api/v1', '/storage');
const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export default function AttendanceGrid() {
  const { user } = useAuthStore();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState('');
  const [classes, setClasses] = useState([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [selectedDetail, setSelectedDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  // Edit attendance state
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({ check_in_time: '', check_out_time: '', note: '' });
  const [editSaving, setEditSaving] = useState(false);

  const isLecturer = user?.role === 'dpl' || user?.role === 'dps';
  const [associationType, setAssociationType] = useState(user?.role === 'dps' ? 'dps' : 'dpl');

  const canEdit = (user?.role === 'admin' || user?.role === 'guru' || user?.role === 'dpl') && associationType !== 'dps';

  useEffect(() => {
    fetchClasses();
  }, []);

  useEffect(() => {
    fetchGrid();
  }, [month, year, page, search, classId, associationType]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/master/classes?all=true');
      setClasses(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchGrid = async () => {
    setLoading(true);
    try {
      let url = `/attendances/monthly?month=${month}&year=${year}&page=${page}`;
      if (search) url += `&search=${search}`;
      if (classId) url += `&class_id=${classId}`;
      if (isLecturer) url += `&association_type=${associationType}`;
      const res = await api.get(url);
      setData(res.data.data);
      setLastPage(res.data.data.last_page || 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    if (status === 'H') return 'bg-green-100 text-green-700';
    if (status === 'S') return 'bg-red-100 text-red-700';
    if (status === 'I') return 'bg-yellow-100 text-yellow-700';
    if (status === 'TPP') return 'bg-blue-100 text-blue-700';
    return 'text-on-surface-variant/40 bg-surface-container';
  };

  const getInitials = (name) => {
    if (!name) return 'MA';
    const split = name.split(' ');
    if (split.length > 1) {
      return (split[0].charAt(0) + split[1].charAt(0)).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  };

  const handleCellClick = async (dayData, student, day) => {
    if (dayData.status === '-') return;
    
    setSelectedDetail({ type: 'loading', student, dayData, day });
    setDetailLoading(true);
    setEditing(false);
    
    try {
      if (dayData.attendance_id) {
        const res = await api.get(`/attendances/${dayData.attendance_id}`);
        setSelectedDetail({ type: 'attendance', data: res.data.data, student, dayData, day });
      } else if (dayData.permission_id) {
        setSelectedDetail({ type: 'permission', student, dayData, day });
      }
    } catch (err) {
      console.error(err);
      setSelectedDetail(null);
      alert('Gagal mengambil detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStartEdit = () => {
    if (!selectedDetail?.data) return;
    setEditForm({
      check_in_time: selectedDetail.data.check_in_time?.substring(0, 5) || '',
      check_out_time: selectedDetail.data.check_out_time?.substring(0, 5) || '',
      note: ''
    });
    setEditing(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedDetail?.data) return;
    setEditSaving(true);
    try {
      const payload = {};
      if (editForm.check_in_time) payload.check_in_time = editForm.check_in_time;
      if (editForm.check_out_time) payload.check_out_time = editForm.check_out_time;
      if (editForm.note) payload.note = editForm.note;

      const res = await api.put(`/attendances/${selectedDetail.data.id}/manual`, payload);
      setSelectedDetail(prev => ({ ...prev, data: res.data.data }));
      setEditing(false);
      alert('Presensi berhasil diperbarui!');
      fetchGrid();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal memperbarui presensi');
    } finally {
      setEditSaving(false);
    }
  };

  const handleExportExcel = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem('eppl_token');
      const baseUrl = import.meta.env.VITE_API_URL || 'https://eppl.uad.ac.id/api/v1';
      let url = `${baseUrl}/attendances/monthly/export?month=${month}&year=${year}`;
      if (search) url += `&search=${search}`;
      if (classId) url += `&class_id=${classId}`;

      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      });
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `Rekap_Presensi_${month}_${year}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(link.href);
    } catch (err) {
      console.error(err);
      alert('Gagal mengunduh rekap. Pastikan server mendukung fitur export.');
    } finally {
      setExporting(false);
    }
  };

  // Helper values for analytics stats
  const totalSiswaCount = data?.grid?.length || 0;
  const rawHadirSum = data?.grid?.reduce((acc, row) => acc + (row.total_hadir || 0), 0) || 0;
  const rawSakitSum = data?.grid?.reduce((acc, row) => acc + (row.total_sakit || 0), 0) || 0;
  const rawIzinSum = data?.grid?.reduce((acc, row) => acc + (row.total_ijin || 0), 0) || 0;
  const rawTppSum = data?.grid?.reduce((acc, row) => acc + (row.total_tpp || 0), 0) || 0;
  const attendancePercentage = totalSiswaCount > 0 ? ((rawHadirSum / (rawHadirSum + rawSakitSum + rawIzinSum + rawTppSum || 1)) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-gutter">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant text-label-sm mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-bold">Monitoring Kehadiran</span>
          </nav>
          <h2 className="font-headline-lg text-headline-lg text-primary">Monitoring Kehadiran Mahasiswa</h2>
        </div>
        <button 
          onClick={handleExportExcel}
          disabled={exporting}
          className="flex items-center gap-2 px-6 py-3 bg-secondary text-on-primary font-bold rounded-lg hover:brightness-110 active:scale-[0.98] transition-all shadow-sm cursor-pointer"
        >
          <span className="material-symbols-outlined">download</span>
          <span>{exporting ? 'Mengunduh...' : 'Download Excel'}</span>
        </button>
      </div>

      {isLecturer && user?.role !== 'dps' && (
        <div className="flex gap-2 border-b border-outline-variant pb-3">
          <button 
            type="button"
            className={`px-4 py-2 text-label-md font-bold rounded-lg transition-all cursor-pointer ${associationType === 'dpl' ? 'bg-primary text-on-primary' : 'bg-white text-on-surface border border-outline-variant hover:bg-surface-container-low'}`}
            onClick={() => { setAssociationType('dpl'); setPage(1); }}
          >
            Mahasiswa Bimbingan PPL (DPL)
          </button>
          <button 
            type="button"
            className={`px-4 py-2 text-label-md font-bold rounded-lg transition-all cursor-pointer ${associationType === 'dps' ? 'bg-primary text-on-primary' : 'bg-white text-on-surface border border-outline-variant hover:bg-surface-container-low'}`}
            onClick={() => { setAssociationType('dps'); setPage(1); }}
          >
            Mahasiswa Bimbingan Skripsi (DPS)
          </button>
        </div>
      )}

      {/* Filter Section */}
      <div className="bg-white border border-outline-variant p-6 rounded-xl flex flex-wrap gap-6 items-end shadow-sm">
        <div className="flex-1 min-w-[240px]">
          <label className="block text-label-sm text-on-surface-variant mb-2 font-bold uppercase tracking-wider">Kelompok PPL</label>
          <div className="relative">
            <select 
              className="w-full appearance-none bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-body-sm"
              value={classId}
              onChange={(e) => { setClassId(e.target.value); setPage(1); }}
            >
              <option value="">Semua Kelompok PPL</option>
              {classes.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
          </div>
        </div>

        <div className="w-48">
          <label className="block text-label-sm text-on-surface-variant mb-2 font-bold uppercase tracking-wider">Bulan</label>
          <div className="relative">
            <select 
              className="w-full appearance-none bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-body-sm"
              value={month}
              onChange={(e) => { setMonth(Number(e.target.value)); setPage(1); }}
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i + 1}>{m}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">calendar_month</span>
          </div>
        </div>

        <div className="w-32">
          <label className="block text-label-sm text-on-surface-variant mb-2 font-bold uppercase tracking-wider">Tahun</label>
          <div className="relative">
            <select 
              className="w-full appearance-none bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 pr-10 focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all text-body-sm"
              value={year}
              onChange={(e) => { setYear(Number(e.target.value)); setPage(1); }}
            >
              {[2025, 2026, 2027].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">expand_more</span>
          </div>
        </div>

        <div className="w-full sm:w-auto">
          <input 
            type="text"
            className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-4 py-3 text-body-sm focus:ring-2 focus:ring-primary outline-none"
            placeholder="Cari Mahasiswa..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {/* Attendance Table Section */}
      <div className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm">
        {/* Legend */}
        <div className="p-4 bg-surface-container-low border-b border-outline-variant flex flex-wrap gap-6 text-label-sm font-semibold">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded flex items-center justify-center bg-green-100 text-green-700 font-bold text-[10px]">H</span>
            <span className="text-on-surface-variant">Hadir</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded flex items-center justify-center bg-red-100 text-red-700 font-bold text-[10px]">S</span>
            <span className="text-on-surface-variant">Sakit</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded flex items-center justify-center bg-yellow-100 text-yellow-700 font-bold text-[10px]">I</span>
            <span className="text-on-surface-variant">Izin</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded flex items-center justify-center bg-blue-100 text-blue-700 font-bold text-[10px]">TPP</span>
            <span className="text-on-surface-variant">Tidak Presensi Pulang (Alpha)</span>
          </div>
        </div>

        {/* Table Wrapper */}
        <div className="overflow-x-auto custom-scrollbar">
          {loading ? (
            <div className="p-12 text-center text-on-surface-variant animate-pulse font-medium">
              Memuat data presensi harian...
            </div>
          ) : !data?.grid?.length ? (
            <div className="p-12 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-[48px] mb-2 text-outline">calendar_month</span>
              <h3 className="font-bold text-body-md">Tidak ada data presensi</h3>
              <p className="text-label-sm">Tidak ada catatan presensi mahasiswa untuk periode ini.</p>
            </div>
          ) : (
            <table className="w-full text-left border-collapse min-w-[1200px] text-body-sm">
              <thead>
                <tr className="bg-surface-container border-b border-outline-variant">
                  <th className="sticky-col py-4 px-6 font-label-md text-label-md text-primary w-64 bg-surface-container">Nama Mahasiswa</th>
                  {/* Day Columns 1 to days_in_month */}
                  {[...Array(data.days_in_month)].map((_, i) => (
                    <th key={i} className="py-3 px-1 text-center font-label-sm text-on-surface-variant border-x border-outline-variant/30 min-w-[36px]">
                      {i + 1}
                    </th>
                  ))}
                  <th className="py-3 px-2 text-center font-bold text-green-700 bg-green-50 border-l-2 border-outline-variant min-w-[40px]">H</th>
                  <th className="py-3 px-2 text-center font-bold text-red-700 bg-red-50 min-w-[40px]">S</th>
                  <th className="py-3 px-2 text-center font-bold text-yellow-700 bg-yellow-50 min-w-[40px]">I</th>
                  <th className="py-3 px-2 text-center font-bold text-blue-700 bg-blue-50 min-w-[40px]">TPP</th>
                  <th className="py-3 px-2 text-center font-bold text-primary bg-primary-fixed min-w-[48px]">JP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {data.grid.map((row) => (
                  <tr key={row.student.id} className="hover:bg-surface-container-low transition-colors">
                    <td className="sticky-col py-4 px-6 border-r-2 border-outline-variant bg-white z-10">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-primary/10 text-primary flex items-center justify-center font-extrabold text-[10px]">
                          {getInitials(row.student.name)}
                        </div>
                        <div>
                          <p className="font-bold text-body-sm text-primary leading-tight">{row.student.name}</p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">{row.student.nis} • {row.student.class}</p>
                        </div>
                      </div>
                    </td>
                    {[...Array(data.days_in_month)].map((_, i) => {
                      const dayData = row.days[i + 1];
                      return (
                        <td key={i} className="py-2 px-1 text-center border-x border-outline-variant/30">
                          <span 
                            onClick={() => handleCellClick(dayData, row.student, i + 1)}
                            className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-[10px] mx-auto cursor-pointer transition-transform active:scale-90 ${getStatusClass(dayData?.status)}`}
                          >
                            {dayData?.status || '-'}
                          </span>
                        </td>
                      );
                    })}
                    <td className="py-2 px-1 text-center font-bold text-green-700 bg-green-50 border-l-2 border-outline-variant">{row.total_hadir}</td>
                    <td className="py-2 px-1 text-center font-bold text-red-700 bg-red-50">{row.total_sakit}</td>
                    <td className="py-2 px-1 text-center font-bold text-yellow-700 bg-yellow-50">{row.total_ijin}</td>
                    <td className="py-2 px-1 text-center font-bold text-blue-700 bg-blue-50">{row.total_tpp}</td>
                    <td className="py-2 px-1 text-center font-bold text-primary bg-primary-fixed">{row.total_jp}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination Footer */}
        {!loading && data && (
          <div className="p-6 bg-surface-container-low border-t border-outline-variant flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-body-sm text-on-surface-variant font-medium">
              Menampilkan {data.grid?.length || 0} Mahasiswa PPL
            </p>
            <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />
          </div>
        )}
      </div>

      {/* Analytics Insights */}
      {!loading && data && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-green-600 bg-green-100 p-2 rounded-lg">check_circle</span>
            </div>
            <p className="text-on-surface-variant text-label-sm uppercase font-bold tracking-wider">Persentase Hadir</p>
            <h3 className="text-display-lg text-[28px] font-extrabold text-primary mt-1">{attendancePercentage}%</h3>
            <p className="text-[10px] text-on-surface-variant mt-2">Rata-rata presensi bulan berjalan</p>
          </div>
          <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-red-600 bg-red-100 p-2 rounded-lg">medical_services</span>
            </div>
            <p className="text-on-surface-variant text-label-sm uppercase font-bold tracking-wider">Total Sakit</p>
            <h3 className="text-display-lg text-[28px] font-extrabold text-primary mt-1">{rawSakitSum}</h3>
            <p className="text-[10px] text-on-surface-variant mt-2">Akumulasi hari tidak hadir karena sakit</p>
          </div>
          <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-blue-600 bg-blue-100 p-2 rounded-lg">warning</span>
            </div>
            <p className="text-on-surface-variant text-label-sm uppercase font-bold tracking-wider">Tanpa Keterangan</p>
            <h3 className="text-display-lg text-[28px] font-extrabold text-primary mt-1">{rawTppSum}</h3>
            <p className="text-[10px] text-on-surface-variant mt-2">Alpha / tidak melakukan presensi pulang</p>
          </div>
          <div className="bg-white border border-outline-variant p-6 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <span className="material-symbols-outlined text-secondary bg-secondary-fixed p-2 rounded-lg">groups</span>
            </div>
            <p className="text-on-surface-variant text-label-sm uppercase font-bold tracking-wider">Total Hari Hadir</p>
            <h3 className="text-display-lg text-[28px] font-extrabold text-primary mt-1">{rawHadirSum}</h3>
            <p className="text-[10px] text-on-surface-variant mt-2">Akumulasi hari aktif mahasiswa PPL</p>
          </div>
        </div>
      )}

      {/* Modal Popup Details */}
      {selectedDetail && (
        <div 
          className="modal-overlay" 
          onClick={() => { setSelectedDetail(null); setEditing(false); }}
        >
          <div 
            className="modal-content max-w-[500px]" 
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3 className="font-bold text-body-lg text-primary">Detail Presensi</h3>
              <button 
                className="btn-close" 
                onClick={() => { setSelectedDetail(null); setEditing(false); }}
              >
                ×
              </button>
            </div>
            <div className="modal-body space-y-4">
              {detailLoading ? (
                <div className="text-center p-6 text-on-surface-variant animate-pulse font-medium">
                  Memuat data detail presensi...
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="pb-4 border-b border-outline-variant">
                    <strong className="text-primary font-bold text-body-md block">{selectedDetail.student.name}</strong>
                    <div className="text-label-sm text-on-surface-variant mt-1">
                      Tanggal: {selectedDetail.day} {MONTHS[month - 1]} {year}
                    </div>
                  </div>

                  {selectedDetail.type === 'attendance' && selectedDetail.data && (
                    <div className="space-y-4">
                      <div className="flex flex-col gap-3">
                        <div className="flex justify-between items-center">
                          <span className="text-on-surface-variant text-body-sm font-semibold">Status</span>
                          <span className={`px-3 py-1 rounded-full font-bold text-[11px] uppercase ${selectedDetail.data.status === 'H' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {selectedDetail.data.status === 'H' ? 'Hadir' : 'Tidak Pulang'}
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-on-surface-variant text-body-sm">Jam Masuk</span>
                          <strong className="text-primary font-bold">{selectedDetail.data.check_in_time || '-'}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-on-surface-variant text-body-sm">Jam Pulang</span>
                          <strong className="text-primary font-bold">{selectedDetail.data.check_out_time || '-'}</strong>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-on-surface-variant text-body-sm">JP Diperoleh</span>
                          <strong className="text-primary font-bold">{selectedDetail.data.jp_earned} JP</strong>
                        </div>
                        {selectedDetail.data.is_manual && (
                          <div className="text-[11px] text-on-surface-variant/80 font-medium italic bg-yellow-50 border border-yellow-200 p-2.5 rounded-lg">
                            ✏️ Diedit manual oleh {selectedDetail.data.manual_editor?.name || 'Admin'}
                            {selectedDetail.data.manual_note && ` — ${selectedDetail.data.manual_note}`}
                          </div>
                        )}
                      </div>

                      {/* Photos */}
                      {(selectedDetail.data.check_in_photo || selectedDetail.data.check_out_photo) && (
                        <div className="pt-4 border-t border-outline-variant">
                          <div className="text-label-sm font-bold mb-3 text-on-surface-variant">📷 Foto Presensi</div>
                          <div className="grid grid-cols-2 gap-4">
                            {selectedDetail.data.check_in_photo && (
                              <div className="text-center">
                                <div className="text-[11px] text-on-surface-variant font-bold mb-2">Foto Masuk</div>
                                <a href={`${API_STORAGE}/${selectedDetail.data.check_in_photo}`} target="_blank" rel="noreferrer">
                                  <img 
                                    src={`${API_STORAGE}/${selectedDetail.data.check_in_photo}`} 
                                    alt="Foto Masuk" 
                                    className="w-full h-32 object-cover rounded-lg border border-outline-variant"
                                  />
                                </a>
                              </div>
                            )}
                            {selectedDetail.data.check_out_photo && (
                              <div className="text-center">
                                <div className="text-[11px] text-on-surface-variant font-bold mb-2">Foto Pulang</div>
                                <a href={`${API_STORAGE}/${selectedDetail.data.check_out_photo}`} target="_blank" rel="noreferrer">
                                  <img 
                                    src={`${API_STORAGE}/${selectedDetail.data.check_out_photo}`} 
                                    alt="Foto Pulang" 
                                    className="w-full h-32 object-cover rounded-lg border border-outline-variant"
                                  />
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Edit actions */}
                      {canEdit && !editing && (
                        <div className="pt-4 border-t border-outline-variant">
                          <button 
                            className="w-full py-2 border border-outline hover:bg-surface-container-low text-primary font-bold rounded-lg transition-colors text-body-sm"
                            onClick={handleStartEdit}
                          >
                            ✏️ Edit Presensi Jam Masuk / Pulang
                          </button>
                        </div>
                      )}

                      {canEdit && editing && (
                        <div className="pt-4 border-t border-outline-variant space-y-4">
                          <div className="font-bold text-body-sm text-primary">✏️ Edit Data Presensi</div>
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <label className="text-label-sm font-semibold text-on-surface-variant mb-1 block">Jam Masuk</label>
                              <input 
                                type="time" 
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:ring-1 focus:ring-primary outline-none" 
                                value={editForm.check_in_time} 
                                onChange={e => setEditForm({...editForm, check_in_time: e.target.value})} 
                              />
                            </div>
                            <div>
                              <label className="text-label-sm font-semibold text-on-surface-variant mb-1 block">Jam Pulang</label>
                              <input 
                                type="time" 
                                className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:ring-1 focus:ring-primary outline-none" 
                                value={editForm.check_out_time} 
                                onChange={e => setEditForm({...editForm, check_out_time: e.target.value})} 
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-label-sm font-semibold text-on-surface-variant mb-1 block">Catatan Edit</label>
                            <input 
                              type="text" 
                              className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 text-body-sm focus:ring-1 focus:ring-primary outline-none" 
                              placeholder="Alasan edit data..." 
                              value={editForm.note} 
                              onChange={e => setEditForm({...editForm, note: e.target.value})} 
                            />
                          </div>
                          <div className="flex gap-2">
                            <button 
                              className="flex-1 py-2 bg-primary text-on-primary font-bold rounded-lg hover:opacity-90 active:scale-[0.98] transition-transform text-body-sm"
                              onClick={handleSaveEdit} 
                              disabled={editSaving}
                            >
                              {editSaving ? 'Menyimpan...' : 'Simpan'}
                            </button>
                            <button 
                              className="py-2 px-4 border border-outline rounded-lg text-body-sm"
                              onClick={() => setEditing(false)}
                            >
                              Batal
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {selectedDetail.type === 'permission' && (
                    <div className="text-center p-6 space-y-3">
                      <div className="text-[48px]">
                        {selectedDetail.dayData.status === 'S' ? '🤒' : '📝'}
                      </div>
                      <h4 className="font-bold text-primary text-body-lg">
                        Mahasiswa ini sedang {selectedDetail.dayData.status === 'S' ? 'Sakit' : 'Izin'}
                      </h4>
                      <p className="text-on-surface-variant text-body-sm leading-relaxed">
                        Data surat izin dan bukti persetujuan ketidakhadiran dapat dikelola di halaman Perijinan.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
