import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../../stores/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function StudentSettings() {
  const { user, fetchMe, logout } = useAuthStore();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [companyId, setCompanyId] = useState('');
  const [dplId, setDplId] = useState('');
  const [guruPamongId, setGuruPamongId] = useState('');
  const [dpsId, setDpsId] = useState('');
  const [pembimbingIndustri, setPembimbingIndustri] = useState('');
  const [companies, setCompanies] = useState([]);
  const [dosens, setDosens] = useState([]);
  const [guruPamongs, setGuruPamongs] = useState([]);
  const [dpsList, setDpsList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [loadingOpts, setLoadingOpts] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setUsername(user.username || '');
      setCompanyId(user.mitra?.id || user.company_id || '');
      setDplId(user.dosen_pembimbing?.id || user.dpl_id || '');
      setGuruPamongId(user.guru_pamong?.id || user.guru_pamong_id || '');
      setDpsId(user.dps?.id || user.dps_id || '');
      setPembimbingIndustri(user.pembimbing_industri || '');
    }
  }, [user]);

  useEffect(() => {
    const loadOpts = async () => {
      try {
        const [cRes, dRes, gpRes, dpsRes] = await Promise.all([
          api.get('/options/companies'),
          api.get('/options/dosens'),
          api.get('/options/guru-pamongs'),
          api.get('/options/dps')
        ]);
        setCompanies(cRes.data.data || []);
        setDosens(dRes.data.data || []);
        setGuruPamongs(gpRes.data.data || []);
        setDpsList(dpsRes.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOpts(false);
      }
    };
    loadOpts();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = { name, username };
      if (password) data.password = password;
      if (companyId) data.company_id = companyId;
      if (dplId) data.dpl_id = dplId;
      if (guruPamongId) data.guru_pamong_id = guruPamongId;
      if (dpsId) data.dps_id = dpsId;
      if (pembimbingIndustri) data.pembimbing_industri = pembimbingIndustri;

      await api.post('/auth/update-profile', data);
      await fetchMe();
      toast.success('Profil berhasil diperbarui!');
      navigate('/mahasiswa/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const filteredGuruPamongs = companyId
    ? guruPamongs.filter(gp => gp.company_id == companyId)
    : guruPamongs;

  return (
    <div className="student-page fade-in">
      <h2 className="student-page-title">Pengaturan Profil</h2>

      {/* Header Card */}
      <div className="student-card settings-header-card" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', padding: '20px', textAlign: 'center', marginBottom: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }}>
        <div className="settings-icon" style={{ fontSize: '32px', marginBottom: '8px' }}>⚙️</div>
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Ubah Data Profil</h3>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', margin: 0 }}>Perbarui informasi akun dan data PPL kamu</p>
      </div>

      {loadingOpts ? (
        <div className="student-loading"><div className="spinner" /></div>
      ) : (
        <form onSubmit={handleSave} className="student-form" style={{ background: '#ffffff', border: '1px solid rgba(0,0,0,0.06)', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-section-title" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="section-bar" style={{ width: '4px', height: '16px', background: 'var(--primary)', borderRadius: '2px' }} /> Data Akun
          </div>
          
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="student-label" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Nama Lengkap</label>
            <input className="student-input" value={name} onChange={e => setName(e.target.value)} required style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="student-label" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Username</label>
            <input className="student-input" value={username} onChange={e => setUsername(e.target.value)} required style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="student-label" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Password Baru (kosongkan jika tidak ubah)</label>
            <input className="student-input" type="password" value={password} onChange={e => setPassword(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
          </div>

          <div className="form-section-title" style={{ fontSize: '14px', fontWeight: '700', color: 'var(--primary)', borderBottom: '1px solid #f1f5f9', paddingBottom: '8px', marginBottom: '8px', marginTop: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="section-bar" style={{ width: '4px', height: '16px', background: 'var(--primary)', borderRadius: '2px' }} /> Data PPL UAD
          </div>

          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="student-label" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Instansi Mitra PPL</label>
            <select className="student-select full" value={companyId} onChange={e => setCompanyId(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' }}>
              <option value="">-- Pilih Instansi Mitra --</option>
              {companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="student-label" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Dosen Pembimbing Lapangan (DPL)</label>
            <select className="student-select full" value={dplId} onChange={e => setDplId(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' }}>
              <option value="">-- Pilih Dosen --</option>
              {dosens.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="student-label" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Dosen Pembimbing Akademik / Sektor (DPS)</label>
            <select className="student-select full" value={dpsId} onChange={e => setDpsId(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' }}>
              <option value="">-- Pilih DPS --</option>
              {dpsList.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="student-label" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Guru Pamong</label>
            <select className="student-select full" value={guruPamongId} onChange={e => setGuruPamongId(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none', background: '#fff' }}>
              <option value="">-- Pilih Guru Pamong --</option>
              {filteredGuruPamongs.map(gp => <option key={gp.id} value={gp.id}>{gp.name}</option>)}
            </select>
          </div>
          <div className="form-group" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <label className="student-label" style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-secondary)' }}>Pamong / Pembimbing Lapangan Instansi (Custom Text)</label>
            <input className="student-input" value={pembimbingIndustri} onChange={e => setPembimbingIndustri(e.target.value)} style={{ padding: '10px 14px', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '14px', outline: 'none' }} />
          </div>

          <button type="submit" className="btn-attendance" disabled={saving} style={{ marginTop: '16px', background: 'var(--primary)', color: '#fff', border: 'none', padding: '12px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            {saving ? <div className="spinner-sm" /> : '💾 Simpan Perubahan'}
          </button>

          <button type="button" className="btn-logout" onClick={handleLogout} style={{ background: 'transparent', color: '#ef4444', border: '1px solid rgba(239, 68, 68, 0.2)', padding: '12px', borderRadius: '8px', fontWeight: '600', fontSize: '14px', cursor: 'pointer', marginTop: '8px' }}>
            🚪 Keluar dari Akun
          </button>
        </form>
      )}
    </div>
  );
}
