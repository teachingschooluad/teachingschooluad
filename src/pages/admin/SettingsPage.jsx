import React, { useState, useEffect } from 'react';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    jp_divisor: 30,
    bobot_asesmen_akhir: 50,
    bobot_logbook: 30,
    bobot_kehadiran: 20,
    periode_mulai: '2026-06-01',
    periode_selesai: '2026-12-31',
    bobot_instrumen_dpl: 50,
    bobot_instrumen_guru_pamong: 50,
    show_instrument_scores: false
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/master/settings');
      if (res.data.success) {
        setSettings({
          jp_divisor: res.data.data.jp_divisor,
          bobot_asesmen_akhir: res.data.data.bobot_asesmen_akhir,
          bobot_logbook: res.data.data.bobot_logbook,
          bobot_kehadiran: res.data.data.bobot_kehadiran,
          periode_mulai: res.data.data.periode_mulai,
          periode_selesai: res.data.data.periode_selesai,
          bobot_instrumen_dpl: res.data.data.bobot_instrumen_dpl,
          bobot_instrumen_guru_pamong: res.data.data.bobot_instrumen_guru_pamong,
          show_instrument_scores: res.data.data.show_instrument_scores
        });
      }
    } catch (err) {
      console.error(err);
      toast.error('Gagal mengambil pengaturan');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const totalBobot = Number(settings.bobot_asesmen_akhir) + Number(settings.bobot_logbook) + Number(settings.bobot_kehadiran);
    if (totalBobot !== 100) {
      toast.error(`Total bobot penilaian harus 100% (Saat ini: ${totalBobot}%)`);
      return;
    }

    const totalSubBobot = Number(settings.bobot_instrumen_dpl) + Number(settings.bobot_instrumen_guru_pamong);
    if (totalSubBobot !== 100) {
      toast.error(`Total sub-bobot instrumen (DPL + Guru Pamong) harus 100% (Saat ini: ${totalSubBobot}%)`);
      return;
    }

    setSaving(true);
    try {
      const res = await api.put('/master/settings', settings);
      if (res.data.success) {
        toast.success('Pengaturan berhasil disimpan!');
        fetchSettings();
      }
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Gagal menyimpan pengaturan');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '40px' }}>Memuat pengaturan...</div>;

  return (
    <div>
      <div className="main-header">
        <h1 className="page-title">⚙️ Pengaturan Aplikasi E-Teaching School UAD</h1>
      </div>

      <div className="card" style={{ maxWidth: '650px', marginTop: '20px' }}>
        <div className="card-header">
          <h3 style={{ fontWeight: 700 }}>Konfigurasi PPL & Penilaian</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* JP Divisor */}
            <div className="form-group">
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                Pembagi Jam Pelajaran (JP)
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="number"
                  className="form-input"
                  style={{ width: '120px' }}
                  value={settings.jp_divisor}
                  onChange={(e) => setSettings({ ...settings, jp_divisor: Number(e.target.value) })}
                  min="1"
                  required
                />
                <span>menit = 1 JP</span>
              </div>
              <small style={{ display: 'block', color: 'var(--text-secondary)', marginTop: '6px' }}>
                Digunakan untuk menghitung jumlah JP yang didapat mahasiswa berdasarkan durasi presensi mereka.
              </small>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9' }} />

            {/* Weights Assessment */}
            <div>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
                Bobot Nilai Akhir (%)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Asesmen Akhir (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settings.bobot_asesmen_akhir}
                    onChange={(e) => setSettings({ ...settings, bobot_asesmen_akhir: Number(e.target.value) })}
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Logbook (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settings.bobot_logbook}
                    onChange={(e) => setSettings({ ...settings, bobot_logbook: Number(e.target.value) })}
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Kehadiran (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settings.bobot_kehadiran}
                    onChange={(e) => setSettings({ ...settings, bobot_kehadiran: Number(e.target.value) })}
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
              <small style={{ display: 'block', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Total jumlah ketiga bobot di atas harus <strong>100%</strong>.
              </small>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9' }} />

            {/* Sub-weights and Visibility */}
            <div>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
                Sub-Bobot Instrumen & Visibilitas (%)
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px', marginBottom: '12px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Sub-Bobot DPL (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settings.bobot_instrumen_dpl}
                    onChange={(e) => setSettings({ ...settings, bobot_instrumen_dpl: Number(e.target.value) })}
                    min="0"
                    max="100"
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Sub-Bobot Guru Pamong (%)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={settings.bobot_instrumen_guru_pamong}
                    onChange={(e) => setSettings({ ...settings, bobot_instrumen_guru_pamong: Number(e.target.value) })}
                    min="0"
                    max="100"
                    required
                  />
                </div>
              </div>
              <small style={{ display: 'block', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                Membagi proporsi nilai asesmen akhir antara instrumen penilaian DPL dan Guru Pamong (Total harus 100%).
              </small>

              <div className="form-group" style={{ marginTop: '16px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={settings.show_instrument_scores}
                    onChange={(e) => setSettings({ ...settings, show_instrument_scores: e.target.checked })}
                  />
                  <span style={{ fontWeight: '600', fontSize: '13px' }}>Buka Skor Instrumen Penilaian untuk Mahasiswa</span>
                </label>
                <small style={{ display: 'block', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  Jika diaktifkan, mahasiswa dapat melihat rincian skor dari instrumen penilaian DPL dan Guru Pamong mereka.
                </small>
              </div>
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid #f1f5f9' }} />

            {/* PPL Period */}
            <div>
              <label style={{ display: 'block', marginBottom: '12px', fontWeight: 'bold' }}>
                Periode Pelaksanaan PPL
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Tanggal Mulai</label>
                  <input
                    type="date"
                    className="form-input"
                    value={settings.periode_mulai}
                    onChange={(e) => setSettings({ ...settings, periode_mulai: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group" style={{ margin: 0 }}>
                  <label style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>Tanggal Selesai</label>
                  <input
                    type="date"
                    className="form-input"
                    value={settings.periode_selesai}
                    onChange={(e) => setSettings({ ...settings, periode_selesai: e.target.value })}
                    required
                  />
                </div>
              </div>
              <small style={{ display: 'block', color: 'var(--text-secondary)', marginTop: '8px' }}>
                Digunakan untuk menghitung jumlah hari aktif PPL (selain akhir pekan) dalam perhitungan persentase kehadiran mahasiswa.
              </small>
            </div>

            <div style={{ marginTop: '12px' }}>
              <button 
                type="submit" 
                className="btn btn-primary"
                disabled={saving}
              >
                {saving ? 'Menyimpan...' : '💾 Simpan Konfigurasi'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
