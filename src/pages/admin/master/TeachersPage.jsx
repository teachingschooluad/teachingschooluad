import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import FilterBar from '../../../components/FilterBar';
import Pagination from '../../../components/Pagination';

export default function TeachersPage() {
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');

  // Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  // Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', username: '', nim_nidn: '', role: 'dpl' });

  // Password states
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordUserId, setPasswordUserId] = useState(null);
  const [passwordUserName, setPasswordUserName] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, [page, search]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/master/teachers?page=${page}${search ? `&search=${search}` : ''}`);
      setTeachers(res.data.data.data);
      setLastPage(res.data.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus dosen ini?')) return;
    try {
      await api.delete(`/master/teachers/${id}`);
      fetchTeachers();
    } catch (err) {
      alert('Gagal menghapus dosen');
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) return;

    setImporting(true);
    const formDataObj = new FormData();
    formDataObj.append('file', importFile);

    try {
      await api.post('/master/teachers/import', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Data dosen berhasil diimport!');
      setShowImportModal(false);
      setImportFile(null);
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengimport data');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/template_dosen.xlsx';
    link.download = 'template_dosen.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAddForm = () => {
    setEditId(null);
    setFormData({ name: '', username: '', nim_nidn: '', role: 'dpl' });
    setShowFormModal(true);
  };

  const openEditForm = (teacher) => {
    setEditId(teacher.id);
    setFormData({ name: teacher.name, username: teacher.username, nim_nidn: teacher.nim_nidn, role: teacher.role || 'dpl' });
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/master/teachers/${editId}`, formData);
      } else {
        await api.post('/master/teachers', formData);
      }
      setShowFormModal(false);
      fetchTeachers();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  const openPasswordModal = (teacher) => {
    setPasswordUserId(teacher.id);
    setPasswordUserName(teacher.name);
    setNewPassword('');
    setShowPasswordModal(true);
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (!newPassword || newPassword.length < 6) {
      alert('Password harus minimal 6 karakter');
      return;
    }
    setUpdatingPassword(true);
    try {
      await api.put(`/master/users/${passwordUserId}/password`, { password: newPassword });
      alert('Password berhasil diperbarui!');
      setShowPasswordModal(false);
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengubah password');
    } finally {
      setUpdatingPassword(false);
    }
  };

  return (
    <div>
      <div className="main-header" style={{ position: 'relative', padding: 0, marginBottom: '24px', background: 'transparent', border: 'none' }}>
        <div>
          <h1 className="page-title">Data Master Dosen</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={() => setShowImportModal(true)}>
            Import Excel
          </button>
          <button className="btn btn-primary" onClick={openAddForm}>+ Tambah Dosen</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <FilterBar onSearch={(val) => { setSearch(val); setPage(1); }} placeholder="Cari Nama Dosen..." />
      </div>

      <div className="card">
        {loading ? (
          <div className="card-body empty-state loading">Memuat data...</div>
        ) : (
          <div className="table-container">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '16px' }}>Nama Dosen</th>
                  <th style={{ textAlign: 'left', padding: '16px' }}>NIDN</th>
                  <th style={{ textAlign: 'left', padding: '16px' }}>Peran / Role</th>
                  <th style={{ textAlign: 'left', padding: '16px' }}>Username</th>
                  <th style={{ textAlign: 'center', padding: '16px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {teachers.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Tidak ada data</td></tr>
                ) : (
                  teachers.map(teacher => (
                    <tr key={teacher.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{teacher.name}</td>
                      <td style={{ padding: '16px' }}>{teacher.nim_nidn}</td>
                      <td style={{ padding: '16px' }}>
                        <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase ${teacher.role === 'dps' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-primary/10 text-primary'}`}>
                          {teacher.role === 'dps' ? 'DPS (Skripsi)' : 'DPL (PPL)'}
                        </span>
                      </td>
                      <td style={{ padding: '16px' }}>{teacher.username}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', marginRight: '8px' }} onClick={() => openPasswordModal(teacher)}>Password</button>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', marginRight: '8px' }} onClick={() => openEditForm(teacher)}>Edit</button>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(teacher.id)}>Hapus</button>
                      </td>
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
          <div className="card" style={{ width: '440px', padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Import Data Dosen</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
              Upload file Excel (.xlsx/.csv) dengan kolom: <b>nama, username, nim_nidn, role</b>. <br/>
              <i>Password default akan sama dengan NIDN. Role dapat diisi 'dpl' atau 'dps' (default 'dpl').</i>
            </p>
            <button 
              type="button"
              onClick={handleDownloadTemplate}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-light)', fontSize: '13px', marginBottom: '16px', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              📥 Download Template Excel Dosen
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
          <div className="card" style={{ width: '400px', padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>{editId ? 'Edit Dosen' : 'Tambah Dosen'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Nama Lengkap</label>
                <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>NIDN</label>
                <input type="text" className="form-input" value={formData.nim_nidn} onChange={(e) => setFormData({...formData, nim_nidn: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Username Login</label>
                <input type="text" className="form-input" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Peran / Role</label>
                <select className="form-input" value={formData.role} onChange={(e) => setFormData({...formData, role: e.target.value})} required>
                  <option value="dpl">Dosen Pembimbing Lapangan (DPL)</option>
                  <option value="dps">Dosen Pamong Skripsi (DPS)</option>
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

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>Ubah Password</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
              Mengubah password untuk dosen <strong>{passwordUserName}</strong>.
            </p>
            <form onSubmit={handleUpdatePassword}>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Password Baru</label>
                <input 
                  type="password" 
                  className="form-input" 
                  value={newPassword} 
                  onChange={(e) => setNewPassword(e.target.value)} 
                  placeholder="Minimal 6 karakter"
                  required 
                  minLength={6}
                />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowPasswordModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary" disabled={updatingPassword}>
                  {updatingPassword ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
