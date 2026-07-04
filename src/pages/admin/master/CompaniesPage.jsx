import { useState, useEffect } from 'react';
import api from '../../../lib/api';
import FilterBar from '../../../components/FilterBar';
import Pagination from '../../../components/Pagination';

export default function CompaniesPage() {
  const [companies, setCompanies] = useState([]);
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
  const [formData, setFormData] = useState({ 
    name: '', address: '', description: '', owner_name: '', username: '',
    coord_1: '', coord_2: '', coord_3: '', coord_4: '' 
  });

  useEffect(() => {
    fetchCompanies();
  }, [page, search]);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/master/companies?page=${page}${search ? `&search=${search}` : ''}`);
      setCompanies(res.data.data.data);
      setLastPage(res.data.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Yakin ingin menghapus instansi mitra ini?')) return;
    try {
      await api.delete(`/master/companies/${id}`);
      fetchCompanies();
    } catch (err) {
      alert('Gagal menghapus instansi mitra');
    }
  };

  const handleImport = async (e) => {
    e.preventDefault();
    if (!importFile) return;

    setImporting(true);
    const formDataObj = new FormData();
    formDataObj.append('file', importFile);

    try {
      await api.post('/master/companies/import', formDataObj, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert('Data instansi mitra berhasil diimport!');
      setShowImportModal(false);
      setImportFile(null);
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal mengimport data');
    } finally {
      setImporting(false);
    }
  };

  const handleDownloadTemplate = () => {
    const link = document.createElement('a');
    link.href = '/templates/template_mitra.xlsx';
    link.download = 'template_mitra.xlsx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const openAddForm = () => {
    setEditId(null);
    setFormData({ 
      name: '', address: '', description: '', owner_name: '', username: '',
      coord_1: '', coord_2: '', coord_3: '', coord_4: '' 
    });
    setShowFormModal(true);
  };

  const formatCoord = (lat, lng) => lat && lng ? `${lat}, ${lng}` : '';

  const openEditForm = (company) => {
    setEditId(company.id);
    setFormData({ 
      name: company.name, 
      address: company.alamat || '', 
      description: company.bidang_usaha || '',
      owner_name: company.owner_name || '',
      username: '', // Don't pre-fill username for security
      coord_1: formatCoord(company.latitude, company.longitude),
      coord_2: formatCoord(company.latitude_2, company.longitude_2),
      coord_3: formatCoord(company.latitude_3, company.longitude_3),
      coord_4: formatCoord(company.latitude_4, company.longitude_4)
    });
    setShowFormModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const parseCoord = (coordStr) => {
        if (!coordStr) return { lat: null, lng: null };
        const parts = coordStr.split(',').map(s => s.trim());
        if (parts.length === 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          return { lat: parts[0], lng: parts[1] };
        }
        return { lat: null, lng: null };
      };

      const c1 = parseCoord(formData.coord_1);
      const c2 = parseCoord(formData.coord_2);
      const c3 = parseCoord(formData.coord_3);
      const c4 = parseCoord(formData.coord_4);

      const payload = {
        name: formData.name,
        address: formData.address,
        description: formData.description,
        owner_name: formData.owner_name,
        latitude: c1.lat, longitude: c1.lng,
        latitude_2: c2.lat, longitude_2: c2.lng,
        latitude_3: c3.lat, longitude_3: c3.lng,
        latitude_4: c4.lat, longitude_4: c4.lng,
      };

      // Only send username if it was filled
      if (formData.username) {
        payload.username = formData.username;
      }

      if (editId) {
        await api.put(`/master/companies/${editId}`, payload);
      } else {
        await api.post('/master/companies', payload);
      }
      setShowFormModal(false);
      fetchCompanies();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan instansi mitra');
    }
  };

  return (
    <div>
      <div className="main-header" style={{ position: 'relative', padding: 0, marginBottom: '24px', background: 'transparent', border: 'none' }}>
        <div>
          <h1 className="page-title">Data Master Instansi Mitra</h1>
        </div>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button className="btn btn-outline" onClick={() => setShowImportModal(true)}>
            Import Excel
          </button>
          <button className="btn btn-primary" onClick={openAddForm}>+ Tambah Instansi</button>
        </div>
      </div>

      <div className="card" style={{ marginBottom: '24px', padding: '16px' }}>
        <FilterBar onSearch={(val) => { setSearch(val); setPage(1); }} placeholder="Cari Nama Instansi..." />
      </div>

      <div className="card">
        {loading ? (
          <div className="card-body empty-state loading">Memuat data...</div>
        ) : (
          <div className="table-container">
            <table style={{ width: '100%' }}>
              <thead>
                <tr>
                  <th style={{ textAlign: 'left', padding: '16px' }}>Nama Instansi Mitra</th>
                  <th style={{ textAlign: 'left', padding: '16px' }}>Alamat</th>
                  <th style={{ textAlign: 'left', padding: '16px' }}>Username Mitra</th>
                  <th style={{ textAlign: 'center', padding: '16px' }}>Lokasi GPS</th>
                  <th style={{ textAlign: 'center', padding: '16px' }}>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {companies.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: 'center', padding: '32px', color: 'var(--text-muted)' }}>Tidak ada data</td></tr>
                ) : (
                  companies.map(company => (
                    <tr key={company.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '16px', fontWeight: 600 }}>{company.name}</td>
                      <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{company.alamat}</td>
                      <td style={{ padding: '16px' }}>
                        {company.industry_username ? (
                          <span style={{ background: '#f1f5f9', padding: '4px 8px', borderRadius: '4px', fontSize: '13px', fontFamily: 'monospace' }}>
                            {company.industry_username}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        {company.latitude && company.longitude ? (
                          <a href={`https://maps.google.com/?q=${company.latitude},${company.longitude}`} target="_blank" rel="noreferrer" style={{ fontSize: '12px', color: 'white', textDecoration: 'none', background: 'var(--primary-light)', padding: '4px 8px', borderRadius: '4px' }}>
                            📍 Maps
                          </a>
                        ) : (
                          <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>-</span>
                        )}
                      </td>
                      <td style={{ padding: '16px', textAlign: 'center' }}>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', marginRight: '8px' }} onClick={() => openEditForm(company)}>Edit</button>
                        <button className="btn btn-outline" style={{ padding: '6px 12px', fontSize: '12px', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={() => handleDelete(company.id)}>Hapus</button>
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
            <h3 style={{ marginBottom: '16px' }}>Import Data Instansi Mitra</h3>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '16px', fontSize: '14px' }}>
              Upload file Excel (.xlsx/.csv) dengan kolom: <b>nama, alamat, pemilik, username, gps1, gps2, gps3, gps4</b>. <br/>
              <i>Username digunakan untuk membuat login instansi. Koordinat GPS format: "latitude, longitude".</i>
            </p>
            <button 
              type="button"
              onClick={handleDownloadTemplate}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--primary-light)', fontSize: '13px', marginBottom: '16px', textDecoration: 'none', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
            >
              📥 Download Template Excel Instansi
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
          <div className="card" style={{ width: '480px', padding: '24px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ marginBottom: '16px' }}>{editId ? 'Edit Instansi Mitra' : 'Tambah Instansi Mitra'}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Nama Instansi</label>
                <input type="text" className="form-input" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Alamat</label>
                <textarea className="form-input" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} required style={{ minHeight: '80px', resize: 'vertical' }}></textarea>
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Nama Pimpinan / Kepala Sekolah</label>
                <input type="text" className="form-input" value={formData.owner_name} onChange={(e) => setFormData({...formData, owner_name: e.target.value})} />
              </div>

              {/* Username Mitra */}
              <div style={{ marginBottom: '16px', padding: '16px', background: 'rgba(0, 61, 122, 0.05)', borderRadius: '12px', border: '1px solid rgba(0, 61, 122, 0.1)' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>
                  🔐 Username Mitra <span style={{ color: 'var(--text-muted)', fontWeight: 400, fontSize: '12px' }}>(untuk login instansi)</span>
                </label>
                <input 
                  type="text" 
                  className="form-input" 
                  value={formData.username} 
                  onChange={(e) => setFormData({...formData, username: e.target.value})} 
                  placeholder={editId ? 'Kosongkan jika tidak ingin mengubah' : 'Contoh: mitrasman1'}
                />
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '6px' }}>
                  {editId 
                    ? 'Isi untuk membuat/memperbarui akun login instansi. Kosongkan jika tidak ingin mengubah.'
                    : 'Password default = username. Akun ini memungkinkan pihak Instansi login dan memonitor mahasiswa.'
                  }
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Koordinat 1 (Utama)</label>
                  <input type="text" className="form-input" value={formData.coord_1} onChange={(e) => setFormData({...formData, coord_1: e.target.value})} placeholder="Misal: -7.123, 110.123" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Koordinat 2</label>
                  <input type="text" className="form-input" value={formData.coord_2} onChange={(e) => setFormData({...formData, coord_2: e.target.value})} placeholder="Opsional" />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '16px', marginBottom: '16px' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Koordinat 3</label>
                  <input type="text" className="form-input" value={formData.coord_3} onChange={(e) => setFormData({...formData, coord_3: e.target.value})} placeholder="Opsional" />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', marginBottom: '8px' }}>Koordinat 4</label>
                  <input type="text" className="form-input" value={formData.coord_4} onChange={(e) => setFormData({...formData, coord_4: e.target.value})} placeholder="Opsional" />
                </div>
              </div>
              <div style={{ marginBottom: '24px' }}>
                <label style={{ display: 'block', marginBottom: '8px' }}>Deskripsi / Bidang (Opsional)</label>
                <textarea className="form-input" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} style={{ minHeight: '80px', resize: 'vertical' }}></textarea>
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
