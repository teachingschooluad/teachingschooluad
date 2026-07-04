import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import useAuthStore from '../stores/authStore';
import toast from 'react-hot-toast';

const roleRoutes = {
  admin: '/admin/dashboard',
  dkl: '/dkl/dashboard',
  dpl: '/dpl/dashboard',
  mahasiswa: '/mahasiswa/dashboard',
  sekolah: '/sekolah/dashboard',
  guru_pamong: '/guru-pamong/dashboard',
  ortu: '/ortu/attendance',
};

export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, loading, error } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user = await login(username, password);
      toast.success(`Selamat datang, ${user.name}!`);
      navigate(roleRoutes[user.role] || '/');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="login-container">
      <div className="login-bg" />
      <motion.div
        className="login-card"
        initial={{ opacity: 0, y: 30, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
      >
        <div className="login-logo">
          <img src="/uad_logo_symbol.png" alt="Universitas Ahmad Dahlan" />
          <h1>E-Teaching School UAD</h1>
          <p>Sistem Pengenalan Praktik Lapangan</p>
          <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Universitas Ahmad Dahlan</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              id="login-username"
              className="form-input"
              type="text"
              placeholder="Masukkan username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              id="login-password"
              className="form-input"
              type="password"
              placeholder="Masukkan password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div style={{ color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' }}>
              {error}
            </div>
          )}
          <motion.button
            id="login-submit"
            className="btn btn-primary"
            type="submit"
            disabled={loading}
            style={{ width: '100%', justifyContent: 'center', padding: '12px', fontSize: '15px' }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {loading ? 'Masuk...' : 'Masuk'}
          </motion.button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '12px', color: 'var(--text-muted)' }}>
          ePPL UAD &copy; 2026 — Universitas Ahmad Dahlan
        </div>
      </motion.div>
    </div>
  );
}
