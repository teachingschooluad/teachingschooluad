import { useState, useEffect } from 'react';
import useAuthStore from '../../stores/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlineMenuAlt2 } from 'react-icons/hi';

export default function LogbookAssignmentsPage() {
  const { user } = useAuthStore();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ title: '', description: '', type: 'essay', is_active: true });

  useEffect(() => { fetchAssignments(); }, []);

  const fetchAssignments = async () => {
    try {
      const { data } = await api.get('/logbook-assignments');
      setAssignments(data.data || data);
    } catch (e) {
      toast.error('Gagal memuat penugasan logbook');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/logbook-assignments/${editing.id}`, form);
        toast.success('Penugasan berhasil diperbarui');
      } else {
        await api.post('/logbook-assignments', form);
        toast.success('Penugasan berhasil ditambahkan');
      }
      setShowModal(false);
      setEditing(null);
      setForm({ title: '', description: '', type: 'essay', is_active: true });
      fetchAssignments();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menyimpan penugasan');
    }
  };

  const handleEdit = (a) => {
    setEditing(a);
    setForm({ title: a.title, description: a.description || '', type: a.type, is_active: a.is_active });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Hapus penugasan ini? Semua logbook mahasiswa terkait akan ikut terhapus.')) return;
    try {
      await api.delete(`/logbook-assignments/${id}`);
      toast.success('Penugasan dihapus');
      fetchAssignments();
    } catch (e) {
      toast.error('Gagal menghapus penugasan');
    }
  };

  const typeLabels = { essay: '📝 Essay', url: '🔗 URL/Luaran', image: '🖼️ Gambar' };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 className="page-title">📋 Penugasan Logbook</h1>
        <button className="btn btn-primary" onClick={() => { setEditing(null); setForm({ title: '', description: '', type: 'essay', is_active: true }); setShowModal(true); }}>
          <HiOutlinePlus /> Tambah Penugasan
        </button>
      </div>

      {loading ? (
        <div className="loading" style={{ textAlign: 'center', padding: '40px' }}>Memuat...</div>
      ) : assignments.length === 0 ? (
        <div className="card">
          <div className="card-body empty-state">
            <div className="icon">📋</div>
            <h3>Belum Ada Penugasan</h3>
            <p style={{ marginTop: '8px' }}>Buat penugasan logbook pertama untuk mahasiswa.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {assignments.map((a, idx) => (
            <div className="card" key={a.id} style={{ position: 'relative' }}>
              <div className="card-body" style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
                <div style={{ background: 'var(--bg-glass)', borderRadius: '8px', padding: '8px 12px', fontWeight: 700, fontSize: '18px', color: 'var(--secondary)' }}>
                  #{idx + 1}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: 700 }}>{a.title}</h3>
                    <span className={`badge ${a.is_active ? 'badge-success' : 'badge-danger'}`}>
                      {a.is_active ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    {a.description || 'Tidak ada deskripsi'}
                  </p>
                  <span className="badge badge-info">{typeLabels[a.type] || a.type}</span>
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button className="btn btn-sm btn-secondary" onClick={() => handleEdit(a)} title="Edit">
                    <HiOutlinePencil />
                  </button>
                  <button className="btn btn-sm btn-danger" onClick={() => handleDelete(a.id)} title="Hapus">
                    <HiOutlineTrash />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>{editing ? 'Edit Penugasan' : 'Tambah Penugasan'}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label className="form-label">Judul Penugasan</label>
                  <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Contoh: Logbook Minggu 1" />
                </div>
                <div className="form-group">
                  <label className="form-label">Deskripsi</label>
                  <textarea className="form-input" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Instruksi untuk mahasiswa..." />
                </div>
                <div className="form-group">
                  <label className="form-label">Jenis Penugasan</label>
                  <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
                    <option value="essay">📝 Essay (Teks)</option>
                    <option value="url">🔗 URL / Luaran</option>
                    <option value="image">🖼️ Upload Gambar</option>
                  </select>
                </div>
                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                    <span className="form-label" style={{ marginBottom: 0 }}>Aktif (Terlihat oleh mahasiswa)</span>
                  </label>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Simpan Perubahan' : 'Tambah'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
