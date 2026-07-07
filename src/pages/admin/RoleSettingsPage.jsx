import { useState } from 'react';
import useAuthStore from '../../stores/authStore';
import api from '../../lib/api';
import toast from 'react-hot-toast';

const roleDisplayNames = {
  dpl: 'Dosen Pembimbing Lapangan',
  guru_pamong: 'Guru Pamong',
  dps: 'Dosen Pamong Skripsi',
  dkl: 'Dosen Koordinator Lapangan',
  sekolah: 'Instansi Mitra',
};

export default function RoleSettingsPage() {
  const { user, fetchMe } = useAuthStore();
  
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    username: user?.username || '',
  });
  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    new_password_confirmation: '',
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    try {
      const res = await api.post('/auth/update-profile', profileForm);
      if (res.data.success) {
        toast.success('Profil berhasil diperbarui!');
        // Update local user data
        await fetchMe();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal memperbarui profil');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordForm.new_password !== passwordForm.new_password_confirmation) {
      toast.error('Konfirmasi password baru tidak cocok');
      return;
    }
    if (passwordForm.new_password.length < 6) {
      toast.error('Password baru minimal 6 karakter');
      return;
    }
    setSavingPassword(true);
    try {
      await api.put('/auth/password', passwordForm);
      toast.success('Password berhasil diubah!');
      setPasswordForm({ current_password: '', new_password: '', new_password_confirmation: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.current_password?.[0] || 'Gagal mengubah password');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <div>
      <div className="main-header">
        <h1 className="page-title">⚙️ Pengaturan Akun</h1>
        <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Kelola profil dan keamanan akun {roleDisplayNames[user?.role] || user?.role} Anda.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {/* Profile Card */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontWeight: 700 }}>👤 Profil</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handleProfileSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Nama Lengkap</label>
                <input
                  className="form-input"
                  value={profileForm.name}
                  onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                  required
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Username</label>
                <input
                  className="form-input"
                  value={profileForm.username}
                  onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                  required
                  placeholder="Username login"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Role</label>
                <input
                  className="form-input"
                  value={roleDisplayNames[user?.role] || user?.role}
                  disabled
                  style={{ background: '#f1f5f9', cursor: 'not-allowed' }}
                />
                <small style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                  Role tidak dapat diubah. Hubungi admin jika ada kesalahan.
                </small>
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingProfile}>
                {savingProfile ? 'Menyimpan...' : '💾 Simpan Profil'}
              </button>
            </form>
          </div>
        </div>

        {/* Password Card */}
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontWeight: 700 }}>🔒 Ubah Password</h3>
          </div>
          <div className="card-body">
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Password Lama</label>
                <input
                  className="form-input"
                  type="password"
                  value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  required
                  placeholder="Masukkan password lama"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Password Baru</label>
                <input
                  className="form-input"
                  type="password"
                  value={passwordForm.new_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password: e.target.value })}
                  required
                  minLength={6}
                  placeholder="Minimal 6 karakter"
                />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Konfirmasi Password Baru</label>
                <input
                  className="form-input"
                  type="password"
                  value={passwordForm.new_password_confirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, new_password_confirmation: e.target.value })}
                  required
                  placeholder="Ulangi password baru"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={savingPassword}>
                {savingPassword ? 'Mengubah...' : '🔑 Ubah Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
