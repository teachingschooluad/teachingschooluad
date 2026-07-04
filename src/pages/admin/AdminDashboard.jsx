import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import useAuthStore from '../../stores/authStore';
import TeacherMonitoring from './TeacherMonitoring';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

export default function AdminDashboard() {
  const { user } = useAuthStore();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/admin').then(res => {
      setStats(res.data.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const statCards = stats ? [
    { icon: 'group', value: stats.total_siswa, label: 'Total Mahasiswa', color: '#002753', bg: 'bg-primary/10', trend: '+12', trendColor: 'text-green-600', trendBg: 'bg-green-50' },
    { icon: 'school', value: stats.total_guru, label: 'Dosen Pembimbing', color: '#775a00', bg: 'bg-secondary/10', trend: 'Stabil', trendColor: 'text-green-600', trendBg: 'bg-green-50' },
    { icon: 'pending_actions', value: stats.today_jurnal, label: 'Logbook Hari Ini', color: '#ba1a1a', bg: 'bg-error-container', trend: 'Review', trendColor: 'text-error', trendBg: 'bg-error-container/50' },
    { icon: 'verified', value: stats.today_hadir, label: 'Hadir Hari Ini', color: '#22c55e', bg: 'bg-green-50', trend: '98%', trendColor: 'text-green-600', trendBg: 'bg-green-50' },
  ] : [];

  // Real chart data from API
  const chartData = stats?.weekly_trend || [];
  const minHadir = chartData.length > 0 ? Math.max(0, Math.floor(Math.min(...chartData.map(d => d.Hadir)) / 10) * 10) : 0;
  const maxHadir = 100;

  // Custom tooltip
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="bg-white border border-outline-variant rounded-lg p-3 shadow-lg text-body-sm">
          <p className="font-bold text-primary mb-1">{label} — {d.date}</p>
          <p className="text-green-600">Hadir: <strong>{d.hadir_count}</strong> ({d.Hadir}%)</p>
          <p className="text-yellow-600">Sakit: <strong>{d.sakit}</strong></p>
          <p className="text-blue-600">Izin: <strong>{d.ijin}</strong></p>
          <p className="text-on-surface-variant">Total Mahasiswa: {d.total}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-gutter">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
        <div>
          <nav className="flex items-center gap-2 text-on-surface-variant text-label-sm mb-2">
            <span>Dashboard</span>
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            <span className="text-primary font-bold">Ringkasan</span>
          </nav>
          <h2 className="font-headline-lg text-headline-lg text-primary">Ringkasan Dashboard</h2>
          <p className="text-on-surface-variant font-body-md mt-1">Selamat datang kembali, {user?.name}. Pantau kemajuan PPL hari ini.</p>
        </div>
        <button className="bg-primary text-on-primary px-6 py-3 rounded-xl font-label-md text-label-md flex items-center gap-2 hover:opacity-90 transition-all shadow-sm active:scale-95">
          <span className="material-symbols-outlined text-[18px]">download</span>
          <span>Unduh Laporan</span>
        </button>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-surface-container-low border border-outline-variant rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {statCards.map((card, i) => (
            <motion.div
              key={i}
              className="bg-white border border-outline-variant p-6 rounded-xl relative overflow-hidden group shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <div className={`w-12 h-12 ${card.bg} rounded-lg flex items-center justify-center`}>
                    <span className="material-symbols-outlined text-[28px]" style={{ color: card.color }}>{card.icon}</span>
                  </div>
                  <span className={`${card.trendColor} font-label-sm flex items-center gap-0.5 ${card.trendBg} px-2 py-1 rounded`}>
                    <span className="material-symbols-outlined text-[14px]">trending_up</span> {card.trend}
                  </span>
                </div>
                <p className="text-on-surface-variant font-label-md mb-1">{card.label}</p>
                <p className="font-display-lg text-[32px] text-primary font-extrabold tracking-tight">{card.value}</p>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:scale-110 transition-transform duration-500 pointer-events-none">
                <span className="material-symbols-outlined text-[120px]">{card.icon}</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Dashboard Body Chart & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter">
        {/* Trend Chart */}
        <div className="lg:col-span-2 bg-white border border-outline-variant rounded-xl p-8 shadow-sm">
          <div className="flex justify-between items-center mb-8 flex-wrap gap-4">
            <div>
              <h3 className="font-headline-md text-[20px] text-primary font-bold">Tren Kehadiran Mingguan</h3>
              <p className="text-on-surface-variant font-body-sm">
                {chartData.length > 0
                  ? `${chartData[0].date} — ${chartData[chartData.length - 1].date}`
                  : 'Belum ada data minggu ini'}
              </p>
            </div>
            <div className="flex items-center gap-3 text-label-sm text-on-surface-variant">
              <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#003d7a] inline-block"></span> % Kehadiran</span>
            </div>
          </div>
          <div className="w-full h-80">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorHadir" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#003d7a" stopOpacity={0.2}/>
                      <stop offset="95%" stopColor="#003d7a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="name" stroke="#737781" fontSize={12} tickLine={false} />
                  <YAxis stroke="#737781" fontSize={12} tickLine={false} domain={[minHadir, maxHadir]} unit="%" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Hadir" stroke="#003d7a" strokeWidth={3} fillOpacity={1} fill="url(#colorHadir)" dot={{ r: 5, fill: '#003d7a', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 7 }} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-on-surface-variant">
                <div className="text-center">
                  <span className="material-symbols-outlined text-[48px] opacity-30">bar_chart</span>
                  <p className="mt-2 font-body-md">Belum ada data kehadiran minggu ini</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dynamic Sidebar info */}
        <div className="bg-white border border-outline-variant rounded-xl p-8 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-headline-md text-[20px] text-primary font-bold mb-4">Informasi Sistem</h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-primary p-2 bg-primary/10 rounded-lg">info</span>
                <div>
                  <p className="font-bold text-body-sm text-primary">Status PPL Aktif</p>
                  <p className="text-[12px] text-on-surface-variant">Periode Pelaksanaan: 2026</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-secondary p-2 bg-secondary/10 rounded-lg">domain</span>
                <div>
                  <p className="font-bold text-body-sm text-primary">Instansi Mitra</p>
                  <p className="text-[12px] text-on-surface-variant">{stats?.total_perusahaan || 0} Instansi terintegrasi</p>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-8 pt-6 border-t border-outline-variant text-[12px] text-on-surface-variant">
            Sistem E-Teaching School UAD memfasilitasi monitoring kehadiran, perizinan, dan penilaian logbook PPL secara real-time.
          </div>
        </div>
      </div>

      {/* Teacher Monitoring Component */}
      <TeacherMonitoring />
    </div>
  );
}
