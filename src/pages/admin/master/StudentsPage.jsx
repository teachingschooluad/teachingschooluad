import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import useAuthStore from '../../../stores/authStore';
import FilterBar from '../../../components/FilterBar';
import Pagination from '../../../components/Pagination';

export default function StudentsPage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin' || user?.role === 'dkl';
  const [students, setStudents] = useState([]);
  const [classes, setClasses] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [dosens, setDosens] = useState([]);
  const [dpsOptions, setDpsOptions] = useState([]);
  const [guruPamongs, setGuruPamongs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');
  const [classId, setClassId] = useState('');
  
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  // Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({
    name: '', username: '', nim_nidn: '', class_id: '',
    company_id: '', dpl_id: '', dps_id: '', guru_pamong_id: '', prodi: ''
  });

  const isLecturer = user?.role === 'dpl' || user?.role === 'dps';
  const [associationType, setAssociationType] = useState(user?.role === 'dps' ? 'dps' : 'dpl');

  useEffect(() => {
    fetchClasses();
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchStudents();
  }, [page, search, classId, associationType]);

  const fetchClasses = async () => {
    try {
      const res = await api.get('/master/classes?all=true');
      setClasses(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchOptions = async () => {
    try {
      const [compRes, dosenRes, dpsRes, pamongRes] = await Promise.all([
        api.get('/options/companies'),
        api.get('/options/dosens'),
        api.get('/options/dps'),
        api.get('/options/guru-pamongs')
      ]);
      setCompanies(compRes.data.data);
      setDosens(dosenRes.data.data);
      setDpsOptions(dpsRes.data.data);
      setGuruPamongs(pamongRes.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchStudents = async () => {
    setLoading(true);
    try {
      let url = `/master/students?page=${page}`;
      if (search) url += `&search=${search}`;
      if (classId) url += `&class_id=${classId}`;
      if (isLecturer) url += `&association_type=${associationType}`;
      
      const res = await api.get(url);
      setStudents(res.data.data.data);
      setLastPage(res.data.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) return;

    setImporting(true);
    const formDataObj = new FormData();
    formDataObj.append('file', importFile);

    try {
      await api.post('/master/students/import', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Data mahasiswa berhasil diimport!');
      setShowImportModal(false);
      setImportFile(null);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengimport data');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/template_mahasiswa.xlsx';
    link.download = 'template_mahasiswa.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus mahasiswa ini?')) return;
    try {
      await api.delete(`/master/students/${id}`);
      fetchStudents();
    } catch (err) {
      alert('Gagal menghapus mahasiswa');
    }
  };

  const openAddForm = () => {
    setEditId(null);
    setFormData({
      name: '', username: '', nim_nidn: '', class_id: '',
      company_id: '', dpl_id: '', dps_id: '', guru_pamong_id: '', prodi: ''
    });
    setShowFormModal(true);
  };

  const openEditForm = (student) => {
    setEditId(student.id);
    setFormData({
      name: student.name,
      username: student.username,
      nim_nidn: student.nim_nidn,
      class_id: student.class_id || '',
      company_id: student.company_id || '',
      dpl_id: student.dpl_id || '',
      dps_id: student.dps_id || '',
      guru_pamong_id: student.guru_pamong_id || '',
      prodi: student.prodi || ''
    });
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/master/students/${editId}`, formData);
      } else {
        await api.post('/master/students', formData);
      }
      setShowFormModal(false);
      fetchStudents();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  return (
    <div>
      <div className="main-header" style={{ position: 'relative', padding: 0, marginBottom: '24px', background: 'transparent', border: 'none' }}>
        <div>
          <h1 className="page-title">Data Master Mahasiswa</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Kelola data mahasiswa yang mengikuti PPL UAD.
          </p>
        </div>
        {isAdmin && (
          <div style={{ display: 'flex', gap: '12px' }}>
            <button className="btn btn-outline" onClick={() => setShowImportModal(true)}>
              Import Excel
            </button>
            <button className="btn btn-primary" onClick={openAddForm}>
              + Tambah Manual
            </button>
          </div>
        )}
      </div>

      {isLecturer && user?.role !== 'dps' && (
        <div style={{ display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          <button 
            className={`btn ${associationType === 'dpl' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 16px', borderRadius: '8px' }}
            onClick={() => { setAssociationType('dpl'); setPage(1); }}
          >
            Mahasiswa Bimbingan PPL (DPL)
          </button>
          <button 
            className={`btn ${associationType === 'dps' ? 'btn-primary' : 'btn-outline'}`}
            style={{ padding: '8px 16px', borderRadius: '8px' }}
            onClick={() => { setAssociationType('dps'); setPage(1); }}
          >
            Mahasiswa Bimbingan Skripsi (DPS)
          </button>
        </div>
      )}

      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <FilterBar onSearch={(val) => { setSearch(val); setPage(1); }} placeholder="Cari NIM atau Nama...">
          <select 
            className="form-select" 
            value={classId} 
            onChange={(e) => { setClassId(e.target.value); setPage(1); }}
          >
            <option value="">Semua Kelompok</option>
            {classes.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </FilterBar>
      </div>

      <div className="card">
        {loading ? (
          <div className="card-body empty-state loading">Memuat data...</div>
        ) : (
          <div className="table-container">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '16px' }}>Mahasiswa</th>
                  <th style={{ textAlign: 'left', padding: '16px' }}>Username</th>
                  <th style={{ textAlign: 'left', padding: '16px' }}>Kelompok</th>
                  <th style={{ textAlign: 'left', padding: '16px' }}>Instansi Mitra</th>
                  <th style={{ textAlign: 'left', padding: '16px' }}>Dosen Pembimbing (DPL)</th>
                  <th style={{ textAlign: 'left', padding: '16px' }}>Dosen Skripsi (DPS)</th>
                  <th style={{ textAlign: 'left', padding: '16px' }}>Guru Pamong</th>
                  {isAdmin && <th style={{ textAlign: 'center', padding: '16px' }}>Aksi</th>}
                </tr>
              </thead>
              <tbody>
                {students.length === 0 ? (
                  <tr>
                    <td colSpan={isAdmin ? 8 : 7} style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Tidak ada data</td>
                  </tr>
                ) : (
                  students.map(student => (
                    <tr key={student.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px' }}>
                        <div style={{ fontWeight: 600 }}>{student.name}</div>
                        <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>NIM: {student.nim_nidn} | Prodi: {student.prodi || '-'}</div>
                      </td>
                      <td style={{ padding: '16px' }}>{student.username}</td>
                      <td style={{ padding: '16px' }}>{student.kelompok_ppl?.name || '-'}</td>
                      <td style={{ padding: '16px' }}>{student.mitra?.name || '-'}</td>
                      <td style={{ padding: '16px', fontSize: '13px' }}>{student.dosen_pembimbing?.name || '-'}</td>
                      <td style={{ padding: '16px', fontSize: '13px' }}>{student.dps?.name || '-'}</td>
                      <td style={{ padding: '16px', fontSize: '13px' }}>{student.guru_pamong?.name || '-'}</td>
                      {isAdmin && (
                        <td style={{ padding: '16px', textAlign: 'center' }}>
                          <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', marginRight: '8px' }} onClick={() => openEditForm(student)}>Edit</button>
                          <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(student.id)}>Hapus</button>
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {!loading && <Pagination page={page} lastPage={lastPage} onPageChange={setPage} />}

      {/* Import Modal */}
      {showImportModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '800px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '16px' }}>Import Data Mahasiswa</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
              Upload file Excel (.xlsx/.csv) dengan kolom: <b>nama, username, nim_nidn, class_id, company_id, dpl_id, dps_id, guru_pamong_id, prodi</b>. <br/>
              <i>Password default akan sama dengan NIM. Kolom class_id, company_id, dpl_id, dps_id, dan guru_pamong_id dapat diisi menggunakan angka ID pada tabel referensi di bawah ini.</i>
            </p>
            
            {/* Referensi ID */}
            <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
              <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}>ID Kelompok</div>
                <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '12px' }}>
                  {classes.map(c => <div key={c.id} style={{ padding: '4px 12px', borderBottom: '1px solid var(--border)' }}><b>{c.id}</b> = {c.name}</div>)}
                </div>
              </div>
              <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}>ID Mitra</div>
                <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '12px' }}>
                  {companies.map(c => <div key={c.id} style={{ padding: '4px 12px', borderBottom: '1px solid var(--border)' }}><b>{c.id}</b> = {c.name}</div>)}
                </div>
              </div>
              <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}>ID DPL</div>
                <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '12px' }}>
                  {dosens.map(g => <div key={g.id} style={{ padding: '4px 12px', borderBottom: '1px solid var(--border)' }}><b>{g.id}</b> = {g.name}</div>)}
                </div>
              </div>
              <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}>ID DPS</div>
                <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '12px' }}>
                  {dpsOptions.map(g => <div key={g.id} style={{ padding: '4px 12px', borderBottom: '1px solid var(--border)' }}><b>{g.id}</b> = {g.name}</div>)}
                </div>
              </div>
              <div style={{ flex: 1, border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden' }}>
                <div style={{ background: 'var(--bg-secondary)', padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}>ID Pamong</div>
                <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '12px' }}>
                  {guruPamongs.map(g => {
                    const cName = companies.find(c => c.id === g.company_id)?.name || 'Mitra';
                    return <div key={g.id} style={{ padding: '4px 12px', borderBottom: '1px solid var(--border)' }}><b>{g.id}</b> = {g.name} ({cName})</div>;
                  })}
                </div>
              </div>
            </div>

            <button 
              type="button"
              onClick={handleDownloadTemplate}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-light)', fontSize: '13px', marginBottom: '16px', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              📥 Download Template Excel Mahasiswa
            </button>
            <form onSubmit={handleImport}>
              <input 
                type="file" 
                accept=".xlsx,.xls,.csv" 
                className="form-input" 
                onChange={(e) => setImportFile(e.target.files[0])}
                style={{ marginBottom: '16px' }}
                required
              />
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowImportModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={importing}>
                  {importing ? 'Mengupload...' : 'Import'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Form Modal */}
      {showFormModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '500px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '16px' }}>{editId ? 'Edit Mahasiswa' : 'Tambah Mahasiswa'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Nama Lengkap</label>
                <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>NIM</label>
                <input type="text" className="form-input" value={formData.nim_nidn} onChange={(e) => setFormData({...formData, nim_nidn: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Username Login</label>
                <input type="text" className="form-input" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Program Studi (Prodi)</label>
                <input type="text" className="form-input" placeholder="Contoh: Informatika" value={formData.prodi} onChange={(e) => setFormData({...formData, prodi: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Kelompok PPL</label>
                <select className="form-input" value={formData.class_id} onChange={(e) => setFormData({...formData, class_id: e.target.value})} required>
                  <option value="">Pilih Kelompok</option>
                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Instansi Mitra PPL</label>
                <select className="form-input" value={formData.company_id} onChange={(e) => setFormData({...formData, company_id: e.target.value})}>
                  <option value="">-- Belum Dipilih --</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Dosen Pembimbing (DPL)</label>
                <select className="form-input" value={formData.dpl_id} onChange={(e) => setFormData({...formData, dpl_id: e.target.value})}>
                  <option value="">-- Belum Dipilih --</option>
                  {dosens.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Dosen Pamong Skripsi (DPS)</label>
                <select className="form-input" value={formData.dps_id} onChange={(e) => setFormData({...formData, dps_id: e.target.value})}>
                  <option value="">-- Belum Dipilih --</option>
                  {dpsOptions.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                </select>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Guru Pamong</label>
                <select className="form-input" value={formData.guru_pamong_id} onChange={(e) => setFormData({...formData, guru_pamong_id: e.target.value})}>
                  <option value="">-- Belum Dipilih --</option>
                  {(formData.company_id ? guruPamongs.filter(p => p.company_id === Number(formData.company_id)) : guruPamongs).map(g => (
                    <option key={g.id} value={g.id}>{g.name}</option>
                  ))}
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowFormModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
