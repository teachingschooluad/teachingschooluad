import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import FilterBar from '../../../components/FilterBar';
import Pagination from '../../../components/Pagination';

export default function ClassesPage() {
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [search, setSearch] = useState('');

  // Form states
  const [showFormModal, setShowFormModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ name: '', prodi: '', tahun_ajaran: '2026/2027' });

  useEffect(() => {
    fetchClasses();
  }, [page, search]);

  const fetchClasses = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/master/classes?page=${page}${search ? `&search=${search}` : ''}`);
      setClasses(res.data.data.data);
      setLastPage(res.data.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus kelompok PPL ini?')) return;
    try {
      await api.delete(`/master/classes/${id}`);
      fetchClasses();
    } catch (err) {
      alert('Gagal menghapus kelompok PPL');
    }
  };

  const openAddForm = () => {
    setEditId(null);
    setFormData({ name: '', prodi: '', tahun_ajaran: '2026/2027' });
    setShowFormModal(true);
  };

  const openEditForm = (cls) => {
    setEditId(cls.id);
    setFormData({ name: cls.name, prodi: cls.prodi || '', tahun_ajaran: cls.tahun_ajaran || '2026/2027' });
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editId) {
        await api.put(`/master/classes/${editId}`, formData);
      } else {
        await api.post('/master/classes', formData);
      }
      setShowFormModal(false);
      fetchClasses();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan kelompok PPL');
    }
  };

  return (
    <div>
      <div className="main-header" style={{ position: 'relative', padding: 0, marginBottom: '24px', background: 'transparent', border: 'none' }}>
        <div>
          <h1 className="page-title">Data Master Kelompok PPL</h1>
        </div>
        <button className="btn btn-primary" onClick={openAddForm}>+ Tambah Kelompok PPL</button>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <FilterBar onSearch={(val) => { setSearch(val); setPage(1); }} placeholder="Cari Nama Kelompok..." />
      </div>

      <div className="card">
        {loading ? (
          <div className="card-body empty-state loading">Memuat data...</div>
        ) : (
          <div className="table-container">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '16px' }}>ID Kelompok</th>
                  <th style={{ textAlign: 'left', padding: '16px' }}>Nama Kelompok</th>
                  <th style={{ textAlign: 'left', padding: '16px' }}>Program Studi</th>
                  <th style={{ textAlign: 'left', padding: '16px' }}>Tahun Ajaran</th>
                  <th style={{ textAlign: 'center', padding: '16px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {classes.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Tidak ada data</td></tr>
                ) : (
                  classes.map(cls => (
                    <tr key={cls.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px' }}>{cls.id}</td>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{cls.name}</td>
                      <td style={{ padding: '16px' }}>{cls.prodi || '-'}</td>
                      <td style={{ padding: '16px' }}>{cls.tahun_ajaran || '-'}</td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', marginRight: '8px' }} onClick={() => openEditForm(cls)}>Edit</button>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(cls.id)}>Hapus</button>
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

      {/* Form Modal */}
      {showFormModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ width: '400px', padding: '24px' }}>
            <h3 style={{ marginBottom: '16px' }}>{editId ? 'Edit Kelompok PPL' : 'Tambah Kelompok PPL'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Nama Kelompok</label>
                <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="Contoh: Kelompok PPL A" />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Program Studi (Prodi)</label>
                <input type="text" className="form-input" value={formData.prodi} onChange={(e) => setFormData({...formData, prodi: e.target.value})} placeholder="Contoh: Informatika" />
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Tahun Ajaran</label>
                <input type="text" className="form-input" value={formData.tahun_ajaran} onChange={(e) => setFormData({...formData, tahun_ajaran: e.target.value})} required placeholder="Contoh: 2026/2027" />
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
