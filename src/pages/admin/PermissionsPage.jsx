import { useState, useEffect } from 'react';
import api from '../../lib/api';
import useAuthStore from '../../stores/authStore';
import Pagination from '../../components/Pagination';

export default function PermissionsPage() {
  const { user } = useAuthStore();
  const [permissions, setPermissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Form State
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    user_id: '',
    date: new Date().toISOString().slice(0, 10),
    type: 'sakit',
    keterangan: ''
  });

  // Pagination
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchPermissions();
  }, [page, month, year]);

  useEffect(() => {
    if (showForm && students.length === 0) {
      fetchStudents();
    }
  }, [showForm]);

  const fetchPermissions = async () => {
    setLoading(true);
    try {
      const res = await api.get('/permissions', { params: { page, month, year } });
      setPermissions(res.data.data.data);
      setTotalPages(res.data.data.last_page);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchStudents = async () => {
    try {
      const res = await api.get('/master/students');
      // Set to all fetched students for this user (Teacher only gets theirs)
      setStudents(res.data.data.data || []);
    } catch (err) {
      console.error("Gagal load mahasiswa", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.user_id) return alert("Pilih mahasiswa!");
    
    try {
      await api.post('/permissions', formData);
      alert('Ijin berhasil dicatat!');
      setShowForm(false);
      setFormData({ ...formData, keterangan: '' });
      fetchPermissions();
    } catch (err) {
      alert(err.response?.data?.message || 'Gagal menyimpan ijin');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Hapus data perijinan ini?")) return;
    try {
      await api.delete(`/permissions/${id}`);
      fetchPermissions();
    } catch (err) {
      alert('Gagal menghapus');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 className="page-title">Data Perijinan PPL</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Batal' : '+ Input Ijin'}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: '24px' }}>
          <div className="card-header">
            <h3>Form Input Perijinan (Sakit/Izin)</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '16px', gridTemplateColumns: '1fr 1fr' }}>
              <div>
                <label>Nama Mahasiswa</label>
                <select className="form-control" value={formData.user_id} onChange={e => setFormData({...formData, user_id: e.target.value})} required>
                  <option value="">-- Pilih Mahasiswa --</option>
                  {students.map(s => (
                    <option key={s.id} value={s.id}>{s.name} ({s.nis_nip})</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label>Tanggal</label>
                <input type="date" className="form-control" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              </div>

              <div>
                <label>Jenis Perijinan</label>
                <select className="form-control" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} required>
                  <option value="sakit">Sakit</option>
                  <option value="ijin">Izin</option>
                </select>
              </div>

              <div>
                <label>Keterangan Tambahan</label>
                <input type="text" className="form-control" value={formData.keterangan} onChange={e => setFormData({...formData, keterangan: e.target.value})} placeholder="Opsional" />
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <button type="submit" className="btn btn-primary">Simpan Ijin</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <div className="card-header" style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <select className="form-control" style={{ width: 'auto' }} value={month} onChange={(e) => { setMonth(e.target.value); setPage(1); }}>
            {Array.from({ length: 12 }, (_, i) => (
              <option key={i + 1} value={i + 1}>Bulan {i + 1}</option>
            ))}
          </select>
          <select className="form-control" style={{ width: 'auto' }} value={year} onChange={(e) => { setYear(e.target.value); setPage(1); }}>
            {[2024, 2025, 2026, 2027].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>

        {loading ? (
          <div className="card-body" style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : permissions.length === 0 ? (
          <div className="card-body empty-state">
            <div className="icon">✓</div>
            <h3>Tidak ada data perijinan</h3>
            <p>Mahasiswa tidak ada yang ijin/sakit di bulan ini.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Tanggal</th>
                  <th>Nama Mahasiswa</th>
                  <th>Jenis</th>
                  <th>Keterangan</th>
                  <th>Diinput Oleh</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {permissions.map((p) => (
                  <tr key={p.id}>
                    <td>{new Date(p.date).toLocaleDateString('id-ID')}</td>
                    <td style={{ fontWeight: 500 }}>{p.user?.name}</td>
                    <td>
                      <span className={`badge ${p.type === 'sakit' ? 'badge-danger' : 'badge-warning'}`} style={{textTransform: 'uppercase'}}>
                        {p.type}
                      </span>
                    </td>
                    <td>{p.keterangan || '-'}</td>
                    <td><small>{p.inputted_by?.name || 'Sistem'}</small></td>
                    <td>
                      <button className="btn btn-danger" style={{ padding: '4px 8px', fontSize: '12px' }} onClick={() => handleDelete(p.id)}>
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} lastPage={totalPages} onPageChange={setPage} />
          </div>
        )}
      </div>
    </div>
  );
}
