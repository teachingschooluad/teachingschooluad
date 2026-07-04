import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function StudentJournalForm() {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [kegiatan, setKegiatan] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [photos, setPhotos] = useState([]); // { file, preview }
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleAddPhoto = (e) => {
    const files = Array.from(e.target.files);
    if (photos.length + files.length > 5) {
      toast.error('Maksimal 5 foto per jurnal.');
      return;
    }
    const newPhotos = files.map(f => ({ file: f, preview: URL.createObjectURL(f) }));
    setPhotos(prev => [...prev, ...newPhotos]);
    e.target.value = '';
  };

  const removePhoto = (index) => {
    setPhotos(prev => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!kegiatan.trim() || !deskripsi.trim()) {
      toast.error('Kegiatan dan deskripsi harus diisi.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('date', date);
      formData.append('kegiatan', kegiatan.trim());
      formData.append('deskripsi', deskripsi.trim());
      photos.forEach((p) => formData.append('photos[]', p.file));

      const res = await api.post('/journals', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.data.success) {
        toast.success('Jurnal berhasil disimpan!');
        navigate('/student/journals');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyimpan jurnal');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="student-page fade-in">
      <h2 className="student-page-title">Isi Jurnal Baru</h2>

      <form onSubmit={handleSubmit} className="student-form">
        {error && <div className="attendance-error">{error}</div>}

        <div className="form-group">
          <label className="student-label">Tanggal Kegiatan</label>
          <input type="date" className="student-input" value={date} onChange={e => setDate(e.target.value)}
            max={new Date().toISOString().split('T')[0]} />
        </div>

        <div className="form-group">
          <label className="student-label">Ringkasan Kegiatan</label>
          <input type="text" className="student-input" placeholder="Cth: Memperbaiki mesin, Membuat desain..."
            value={kegiatan} onChange={e => setKegiatan(e.target.value)} required />
        </div>

        <div className="form-group">
          <label className="student-label">Deskripsi Detail</label>
          <textarea className="student-input student-textarea" rows={5}
            placeholder="Jelaskan apa saja yang Anda lakukan hari ini..."
            value={deskripsi} onChange={e => setDeskripsi(e.target.value)} required />
        </div>

        <div className="form-group">
          <label className="student-label">Lampiran Foto (Opsional, Maks. 5)</label>
          <div className="photos-grid">
            {photos.map((p, i) => (
              <div key={i} className="photo-thumb">
                <img src={p.preview} alt={`Foto ${i+1}`} />
                <button type="button" className="photo-remove" onClick={() => removePhoto(i)}>✕</button>
              </div>
            ))}
            {photos.length < 5 && (
              <button type="button" className="photo-add" onClick={() => fileInputRef.current?.click()}>
                📷 +
              </button>
            )}
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" multiple style={{ display: 'none' }}
            onChange={handleAddPhoto} />
        </div>

        <button type="submit" className="btn-attendance" disabled={submitting} style={{ marginTop: 16 }}>
          {submitting ? <span className="spinner-sm" /> : 'Simpan Jurnal'}
        </button>
      </form>
    </div>
  );
}
