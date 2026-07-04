import { useState, useEffect } from 'react';
import useAuthStore from '../../stores/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';
import { HiOutlinePlus, HiOutlinePencil, HiOutlineTrash, HiOutlinePlusCircle, HiOutlineMinusCircle } from 'react-icons/hi';

export default function InstrumentManagePage() {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  
  const [instruments, setInstruments] = useState([]);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    class_id: '',
    evaluator_type: 'dpl',
    is_active: true,
    aspects: [
      { name: '', description: '', items: [{ question: '', description: '' }] }
    ]
  });

  const [classFilter, setClassFilter] = useState('');
  const [evaluatorFilter, setEvaluatorFilter] = useState('');

  useEffect(() => {
    fetchClasses();
    fetchInstruments();
  }, [classFilter, evaluatorFilter]);

  const fetchClasses = async () => {
    try {
      const { data } = await api.get('/master/classes?all=true');
      const fetchedClasses = data.data?.data || data.data || data || [];
      setClasses(fetchedClasses);
      if (fetchedClasses.length > 0 && !form.class_id) {
        setForm(prev => ({ ...prev, class_id: fetchedClasses[0].id }));
      }
    } catch (e) {
      console.error('Gagal memuat kelompok PPL', e);
    }
  };

  const fetchInstruments = async () => {
    setLoading(true);
    try {
      const params = {};
      if (classFilter) params.class_id = classFilter;
      if (evaluatorFilter) params.evaluator_type = evaluatorFilter;
      
      const { data } = await api.get('/instruments', { params });
      setInstruments(data.data || data);
    } catch (e) {
      toast.error('Gagal memuat instrumen penilaian');
    } finally {
      setLoading(false);
    }
  };

  const handleAddAspect = () => {
    setForm(prev => ({
      ...prev,
      aspects: [...prev.aspects, { name: '', description: '', items: [{ question: '', description: '' }] }]
    }));
  };

  const handleRemoveAspect = (aIdx) => {
    if (form.aspects.length === 1) {
      toast.error('Instrumen harus memiliki minimal 1 aspek penilaian.');
      return;
    }
    setForm(prev => ({
      ...prev,
      aspects: prev.aspects.filter((_, idx) => idx !== aIdx)
    }));
  };

  const handleAspectChange = (aIdx, field, val) => {
    setForm(prev => {
      const updatedAspects = [...prev.aspects];
      updatedAspects[aIdx] = { ...updatedAspects[aIdx], [field]: val };
      return { ...prev, aspects: updatedAspects };
    });
  };

  const handleAddItem = (aIdx) => {
    setForm(prev => {
      const updatedAspects = [...prev.aspects];
      updatedAspects[aIdx] = {
        ...updatedAspects[aIdx],
        items: [...updatedAspects[aIdx].items, { question: '', description: '' }]
      };
      return { ...prev, aspects: updatedAspects };
    });
  };

  const handleRemoveItem = (aIdx, iIdx) => {
    if (form.aspects[aIdx].items.length === 1) {
      toast.error('Aspek harus memiliki minimal 1 kriteria pertanyaan.');
      return;
    }
    setForm(prev => {
      const updatedAspects = [...prev.aspects];
      updatedAspects[aIdx] = {
        ...updatedAspects[aIdx],
        items: updatedAspects[aIdx].items.filter((_, idx) => idx !== iIdx)
      };
      return { ...prev, aspects: updatedAspects };
    });
  };

  const handleItemChange = (aIdx, iIdx, field, val) => {
    setForm(prev => {
      const updatedAspects = [...prev.aspects];
      const updatedItems = [...updatedAspects[aIdx].items];
      updatedItems[iIdx] = { ...updatedItems[iIdx], [field]: val };
      updatedAspects[aIdx] = { ...updatedAspects[aIdx], items: updatedItems };
      return { ...prev, aspects: updatedAspects };
    });
  };

  const handleOpenCreate = () => {
    setEditing(null);
    setForm({
      title: '',
      description: '',
      class_id: classes[0]?.id || '',
      evaluator_type: 'dpl',
      is_active: true,
      aspects: [
        { name: '', description: '', items: [{ question: '', description: '' }] }
      ]
    });
    setShowModal(true);
  };

  const handleOpenEdit = async (inst) => {
    try {
      const { data } = await api.get(`/instruments/${inst.id}`);
      const fullInst = data.data;
      setEditing(fullInst);
      setForm({
        title: fullInst.title,
        description: fullInst.description || '',
        class_id: fullInst.class_id,
        evaluator_type: fullInst.evaluator_type,
        is_active: fullInst.is_active,
        aspects: fullInst.aspects.map(asp => ({
          id: asp.id,
          name: asp.name,
          description: asp.description || '',
          items: asp.items.map(it => ({
            id: it.id,
            question: it.question,
            description: it.description || ''
          }))
        }))
      });
      setShowModal(true);
    } catch (e) {
      toast.error('Gagal mengambil detail instrumen');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus instrumen ini? Semua nilai mahasiswa yang menggunakan instrumen ini akan terhapus secara permanen.')) {
      return;
    }
    try {
      await api.delete(`/instruments/${id}`);
      toast.success('Instrumen penilaian berhasil dihapus.');
      fetchInstruments();
    } catch (e) {
      toast.error('Gagal menghapus instrumen penilaian');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/instruments/${editing.id}`, form);
        toast.success('Instrumen penilaian berhasil diperbarui.');
      } else {
        await api.post('/instruments', form);
        toast.success('Instrumen penilaian baru berhasil dibuat.');
      }
      setShowModal(false);
      fetchInstruments();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Gagal menyimpan instrumen penilaian.');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1 className="page-title">📋 Instrumen Penilaian Akhir</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            Kelola instrumen penilaian berskala Likert 1-5 berdasarkan kelompok PPL dan evaluator.
          </p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={handleOpenCreate}>
            <HiOutlinePlus /> Tambah Instrumen
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="card" style={{ marginBottom: '20px' }}>
        <div className="card-body" style={{ display: 'flex', flexWrap: 'wrap', gap: '12px', alignItems: 'center' }}>
          <div className="form-group" style={{ width: '250px', margin: 0 }}>
            <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px' }}>Kelompok PPL</label>
            <select className="form-select" value={classFilter} onChange={(e) => setClassFilter(e.target.value)}>
              <option value="">-- Semua Kelompok PPL --</option>
              {classes.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group" style={{ width: '200px', margin: 0 }}>
            <label className="form-label" style={{ marginBottom: '4px', fontSize: '12px' }}>Tipe Evaluator</label>
            <select className="form-select" value={evaluatorFilter} onChange={(e) => setEvaluatorFilter(e.target.value)}>
              <option value="">-- Semua Evaluator --</option>
              <option value="dpl">👨‍🏫 Dosen Pembimbing (DPL)</option>
              <option value="guru_pamong">👩‍🏫 Guru Pamong</option>
            </select>
          </div>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="loading" style={{ textAlign: 'center', padding: '40px' }}>Memuat instrumen...</div>
      ) : instruments.length === 0 ? (
        <div className="card">
          <div className="card-body empty-state">
            <div className="icon">📋</div>
            <h3>Belum Ada Instrumen Penilaian</h3>
            <p style={{ marginTop: '8px' }}>Admin dapat membuat instrumen kriteria penilaian untuk DPL maupun Guru Pamong.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))', gap: '16px' }}>
          {instruments.map((inst) => (
            <div className="card animate-fade-in" key={inst.id} style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
              <div className="card-body" style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                  <span className={`badge ${inst.evaluator_type === 'dpl' ? 'badge-primary' : 'badge-info'}`}>
                    {inst.evaluator_type === 'dpl' ? '👨‍🏫 Dosen (DPL)' : '👩‍🏫 Guru Pamong'}
                  </span>
                  <span className={`badge ${inst.is_active ? 'badge-success' : 'badge-danger'}`}>
                    {inst.is_active ? 'Aktif' : 'Nonaktif'}
                  </span>
                </div>
                
                <h3 style={{ fontSize: '16px', fontWeight: '700', color: 'var(--primary)', marginBottom: '8px' }}>
                  {inst.title}
                </h3>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px', flex: 1 }}>
                  {inst.description || 'Tidak ada deskripsi.'}
                </p>

                <hr style={{ border: 'none', borderTop: '1px solid var(--outline-variant)', margin: '12px 0' }} />

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>
                      Kelompok: <span style={{ color: 'var(--on-background)' }}>{inst.school_class?.name}</span>
                    </span>
                  </div>
                  {isAdmin && (
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button className="btn btn-sm btn-secondary" onClick={() => handleOpenEdit(inst)}>
                        <HiOutlinePencil /> Edit
                      </button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDelete(inst.id)}>
                        <HiOutlineTrash /> Hapus
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '750px', width: '90%' }}>
            <div className="modal-header">
              <h3 style={{ fontWeight: 700 }}>{editing ? 'Edit Instrumen Penilaian' : 'Buat Instrumen Penilaian Baru'}</h3>
              <button className="btn-close" onClick={() => setShowModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div className="form-group">
                    <label className="form-label">Kelompok PPL</label>
                    <select className="form-select" value={form.class_id} onChange={(e) => setForm({ ...form, class_id: e.target.value })} required>
                      {classes.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tipe Evaluator</label>
                    <select className="form-select" value={form.evaluator_type} onChange={(e) => setForm({ ...form, evaluator_type: e.target.value })} required>
                      <option value="dpl">Dosen Pembimbing (DPL)</option>
                      <option value="guru_pamong">Guru Pamong Sekolah</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Judul Instrumen</label>
                  <input className="form-input" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required placeholder="Contoh: Penilaian Kompetensi PPL Mahasiswa" />
                </div>

                <div className="form-group">
                  <label className="form-label">Deskripsi</label>
                  <textarea className="form-input" rows="2" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Catatan instruksi penilaian..." />
                </div>

                <div className="form-group">
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />
                    <span className="form-label" style={{ marginBottom: 0 }}>Aktif (Terbuka untuk pengisian nilai oleh DPL/Pamong)</span>
                  </label>
                </div>

                <div style={{ marginTop: '20px', borderTop: '1px solid var(--outline-variant)', paddingTop: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <h4 style={{ fontWeight: '700', color: 'var(--primary)' }}>Aspek & Kriteria Penilaian</h4>
                    <button type="button" className="btn btn-sm btn-secondary" onClick={handleAddAspect}>
                      <HiOutlinePlus /> Tambah Aspek
                    </button>
                  </div>

                  {form.aspects.map((aspect, aIdx) => (
                    <div key={aIdx} className="card" style={{ marginBottom: '16px', background: '#f8fafc', border: '1px solid var(--outline-variant)' }}>
                      <div className="card-body" style={{ padding: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                          <h5 style={{ fontWeight: '700', fontSize: '13px' }}>Aspek #{aIdx + 1}</h5>
                          <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px' }} onClick={() => handleRemoveAspect(aIdx)}>
                            <HiOutlineMinusCircle /> Hapus Aspek
                          </button>
                        </div>

                        <div className="form-group">
                          <input className="form-input" value={aspect.name} onChange={(e) => handleAspectChange(aIdx, 'name', e.target.value)} required placeholder="Nama Aspek (Contoh: Kompetensi Pedagogik, Sikap Profesional)" />
                        </div>

                        {/* Items under aspect */}
                        <div style={{ marginLeft: '16px', marginTop: '12px', borderLeft: '2px solid var(--primary-fixed-dim)', paddingLeft: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-secondary)' }}>Kriteria Pertanyaan (Likert 1-5)</span>
                            <button type="button" style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--primary)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', fontWeight: '600' }} onClick={() => handleAddItem(aIdx)}>
                              <HiOutlinePlusCircle /> Tambah Kriteria
                            </button>
                          </div>

                          {aspect.items.map((item, iIdx) => (
                            <div key={iIdx} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start', marginBottom: '8px' }}>
                              <span style={{ fontSize: '12px', marginTop: '10px', color: 'var(--text-secondary)' }}>{iIdx + 1}.</span>
                              <div style={{ flex: 1 }}>
                                <input className="form-input" value={item.question} onChange={(e) => handleItemChange(aIdx, iIdx, 'question', e.target.value)} required placeholder="Pertanyaan/Indikator Kinerja yang dinilai..." />
                              </div>
                              <button type="button" style={{ marginTop: '8px', color: 'var(--error)', background: 'none', border: 'none', cursor: 'pointer' }} onClick={() => handleRemoveItem(aIdx, iIdx)}>
                                &times;
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Batal</button>
                <button type="submit" className="btn btn-primary">{editing ? 'Simpan Perubahan' : 'Buat Instrumen'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
