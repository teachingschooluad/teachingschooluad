import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import FilterBar from '../../../components/FilterBar';
import Pagination from '../../../components/Pagination';

export default function GuruPamongsPage() {
  const [pamongs, setPamongs] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');
  const [companyId, setCompanyId] = useState('');

  // Import states
  const [showImportModal, setShowImportModal] = useState(false);
  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);

  // Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', username: '', nim_nidn: '', company_id: '' });

  useEffect(() => {
    fetchCompanies();
  }, []);

  useEffect(() => {
    fetchPamongs();
  }, [page, search, companyId]);

  const fetchCompanies = async () => {
    try {
      const res = await api.get('/options/companies');
      setCompanies(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchPamongs = async () => {
    setLoading(true);
    try {
      let url = `/master/guru-pamongs?page=${page}`;
      if (search) url += `&search=${search}`;
      if (companyId) url += `&company_id=${companyId}`;
      const res = await api.get(url);
      setPamongs(res.data.data.data);
      setLastPage(res.data.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus guru pamong ini?')) return;
    try {
      await api.delete(`/master/guru-pamongs/${id}`);
      fetchPamongs();
    } catch (err) {
      alert('Gagal menghapus guru pamong');
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) return;

    setImporting(true);
    const formDataObj = new FormData();
    formDataObj.append('file', importFile);

    try {
      await api.post('/master/guru-pamongs/import', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Data guru pamong berhasil diimport!');
      setShowImportModal(false);
      setImportFile(null);
      fetchPamongs();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengimport data');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/template_guru_pamong.xlsx';
    link.download = 'template_guru_pamong.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAddForm = () => {
    setEditId(null);
    setFormData({ name: '', username: '', nim_nidn: '', company_id: '' });
    setShowFormModal(true);
  };

  const openEditForm = (pamong) => {
    setEditId(pamong.id);
    setFormData({ 
      name: pamong.name, 
      username: pamong.username, 
      nim_nidn: pamong.nim_nidn, 
      company_id: pamong.company_id || '' 
    });
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/master/guru-pamongs/${editId}`, formData);
      } else {
        await api.post('/master/guru-pamongs', formData);
      }
      setShowFormModal(false);
      fetchPamongs();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan data');
    }
  };

  return (
    <div>
      <div className="main-header" style={{ position: 'relative', padding: 0, marginBottom: '24px', background: 'transparent', border: 'none' }}>
        <div>
          <h1 className="page-title">Data Master Guru Pamong</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '4px' }}>
            Kelola data guru pamong (pembimbing lapangan instansi) untuk PPL UAD.
          </p>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={() => setShowImportModal(true)}>
            Import Excel
          </button>
          <button className="btn btn-primary" onClick={openAddForm}>+ Tambah Guru Pamong</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <FilterBar onSearch={(val) => { setSearch(val); setPage(1); }} placeholder="Cari Nama / Username Guru Pamong...">
          <select 
            className="form-select" 
            value={companyId} 
            onChange={(e) => { setCompanyId(e.target.value); setPage(1); }}
          >
            <option value="">Semua Instansi Mitra</option>
            {companies.map(c => (
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
                  <th style={{ textAlign: 'left', padding: '16px' }}>Nama Lengkap</th>
                  <th style={{ textAlign: 'left', padding: '16px' }}>NIP / Identitas</th>
                  <th style={{ textAlign: 'left', padding: '16px' }}>Username</th>
                  <th style={{ textAlign: 'left', padding: '16px' }}>Instansi Mitra</th>
                  <th style={{ textAlign: 'center', padding: '16px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {pamongs.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Tidak ada data</td></tr>
                ) : (
                  pamongs.map(p => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{p.name}</td>
                      <td style={{ padding: '16px' }}>{p.nim_nidn}</td>
                      <td style={{ padding: '16px' }}>{p.username}</td>
                      <td style={{ padding: '16px' }}>{p.mitra?.name || '-'}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', marginRight: '8px' }} onClick={() => openEditForm(p)}>Edit</button>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(p.id)}>Hapus</button>
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
          <div className="card" style={{ width: '460px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '16px' }}>Import Data Guru Pamong</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
              Upload file Excel (.xlsx/.csv) dengan kolom: <b>nama, username, nip, company_id</b>. <br/>
              <i>Password default akan sama dengan NIP. Kolom company_id diisi dengan ID Instansi Mitra referensi di bawah ini.</i>
            </p>
            
            {/* Referensi ID Mitra */}
            <div style={{ border: '1px solid var(--border)', borderRadius: '8px', overflow: 'hidden', marginBottom: '16px' }}>
              <div style={{ background: 'var(--bg-secondary)', padding: '6px 12px', fontSize: '12px', fontWeight: 600 }}>ID Instansi Mitra</div>
              <div style={{ maxHeight: '150px', overflowY: 'auto', fontSize: '12px' }}>
                {companies.map(c => <div key={c.id} style={{ padding: '4px 12px', borderBottom: '1px solid var(--border)' }}><b>{c.id}</b> = {c.name}</div>)}
              </div>
            </div>

            <button 
              type="button"
              onClick={handleDownloadTemplate}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-light)', fontSize: '13px', marginBottom: '16px', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              📥 Download Template Excel Guru Pamong
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
            <h3 style={{ marginBottom: '16px' }}>{editId ? 'Edit Guru Pamong' : 'Tambah Guru Pamong'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Nama Lengkap</label>
                <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>NIP / NIK / Identitas</label>
                <input type="text" className="form-input" value={formData.nim_nidn} onChange={(e) => setFormData({...formData, nim_nidn: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Username Login</label>
                <input type="text" className="form-input" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Instansi Mitra PPL</label>
                <select className="form-input" value={formData.company_id} onChange={(e) => setFormData({...formData, company_id: e.target.value})} required>
                  <option value="">Pilih Instansi Mitra</option>
                  {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
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
