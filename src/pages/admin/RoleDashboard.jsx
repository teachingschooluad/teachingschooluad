import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api';
import useAuthStore from '../../stores/authStore';
import AdSenseBanner from '../../components/AdSenseBanner';
import TeacherMonitoring from './TeacherMonitoring';

export default function RoleDashboard() {
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [recentLogbooks, setRecentLogbooks] = useState([]);

  const isDpl = user?.role === 'dpl';
  const isDps = user?.role === 'dps';
  const isGuruPamong = user?.role === 'guru_pamong';
  
  let roleLabel = 'Instansi Mitra';
  if (isDpl) roleLabel = 'Dosen Pembimbing';
  else if (isDps) roleLabel = 'Dosen Pamong Skripsi (DPS)';
  else if (isGuruPamong) roleLabel = 'Guru Pamong';

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const today = new Date();
      const month = today.getMonth() + 1;
      const year = today.getFullYear();
      const todayStr = today.toISOString().slice(0, 10);

      // 1. Fetch students assigned to this user
      const studentsRes = await api.get('/master/students?per_page=9999');
      const allStudents = studentsRes.data.data?.data || studentsRes.data.data || [];
      const totalSiswa = allStudents.length;
      const studentIds = new Set(allStudents.map(s => s.id));

      // 2. Fetch logbooks
      const logbooksRes = await api.get('/logbooks?per_page=9999');
      const rawLogbooks = logbooksRes.data.data?.data || logbooksRes.data.data || [];
      const allLogbooks = Array.isArray(rawLogbooks) ? rawLogbooks : [];
      const myLogbooks = allLogbooks.filter(j => studentIds.has(j.user_id));

      let logbookApproved = 0;
      let logbookPending = 0;
      myLogbooks.forEach(j => {
        if (j.status === 'approved') {
          logbookApproved++;
        } else if (j.status === 'pending') {
          logbookPending++;
        }
      });

      // 3. Fetch attendance
      const attendanceRes = await api.get(`/attendances/monthly?month=${month}&year=${year}&per_page=9999`);
      const attendanceData = attendanceRes.data.data;
      const grid = attendanceData?.grid || [];
      const dayOfMonth = today.getDate();

      let todayHadir = 0;
      let todayBelumPresensi = 0;
      let todayIjin = 0;

      grid.forEach(row => {
        if (!studentIds.has(row.student.id)) return;
        const dayInfo = row.days?.[dayOfMonth];
        if (!dayInfo) {
          todayBelumPresensi++;
          return;
        }
        const status = dayInfo.status;
        if (status === 'H') todayHadir++;
        else if (status === 'S' || status === 'I') todayIjin++;
        else todayBelumPresensi++;
      });

      const gridStudentIds = new Set(grid.map(r => r.student.id));
      allStudents.forEach(s => {
        if (!gridStudentIds.has(s.id)) {
          todayBelumPresensi++;
        }
      });

      // 4. Fetch permissions
      const permissionsRes = await api.get(`/permissions?month=${month}&year=${year}&per_page=9999`);
      const permData = permissionsRes.data.data?.data || permissionsRes.data.data || [];
      const permList = Array.isArray(permData) ? permData : [];
      const todayPermissions = permList.filter(p => p.date === todayStr && studentIds.has(p.user_id));

      const permStudentIds = new Set(todayPermissions.map(p => p.user_id));
      let additionalIjin = 0;
      permStudentIds.forEach(pid => {
        const inGrid = grid.find(r => r.student.id === pid);
        if (inGrid) {
          const dayInfo = inGrid.days?.[dayOfMonth];
          if (dayInfo && (dayInfo.status === 'S' || dayInfo.status === 'I')) return;
        }
        additionalIjin++;
      });
      todayIjin += additionalIjin;

      // Get recent 5 pending logbooks
      const pendingLogbooks = myLogbooks
        .filter(j => j.status === 'pending')
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      setStats({
        totalSiswa,
        logbookApproved,
        logbookPending,
        todayHadir,
        todayBelumPresensi,
        todayIjin,
      });
      setRecentLogbooks(pendingLogbooks);
    } catch (err) {
      console.error('Dashboard load error:', err);
      setStats(null);
    } finally {
      setLoading(false);
    }
  };

  const statCards = stats ? [
    { icon: 'group', value: stats.totalSiswa, label: (isDpl || isDps || isGuruPamong) ? 'Mahasiswa Bimbingan' : 'Mahasiswa PPL', color: '#002753', bg: 'bg-primary/10' },
    { icon: 'verified', value: stats.logbookApproved, label: 'Logbook Disetujui', color: '#22c55e', bg: 'bg-green-50' },
    { icon: 'pending_actions', value: stats.logbookPending, label: 'Logbook Pending', color: '#ba1a1a', bg: 'bg-error-container' },
    { icon: 'calendar_today', value: stats.todayHadir, label: 'Hadir Hari Ini', color: '#3b82f6', bg: 'bg-blue-50' },
  ] : [];

  return (
    <div className="space-y-gutter">
      {/* Welcome Header */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="font-headline-lg text-headline-lg text-primary">Dashboard {roleLabel}</h2>
          <p className="text-on-surface-variant font-body-md mt-1">Selamat datang kembali, {user?.name}. Pantau kemajuan mahasiswa PPL Anda.</p>
        </div>
      </div>

      <AdSenseBanner />

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 bg-surface-container-low border border-outline-variant rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !stats ? (
        <div className="bg-white border border-outline-variant rounded-xl p-8 text-center shadow-sm">
          <span className="material-symbols-outlined text-[48px] text-error mb-2">warning</span>
          <h3 className="font-bold text-body-md">Gagal memuat data</h3>
          <p className="text-label-sm text-on-surface-variant">Silakan coba refresh halaman.</p>
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter">
            {statCards.map((card, i) => (
              <motion.div
                key={i}
                className="bg-white border border-outline-variant p-6 rounded-xl relative overflow-hidden group shadow-sm"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
              >
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-4">
                    <div className={`w-12 h-12 ${card.bg} rounded-lg flex items-center justify-center`}>
                      <span className="material-symbols-outlined text-[28px]" style={{ color: card.color }}>{card.icon}</span>
                    </div>
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

          {/* Pending Logbooks */}
          {recentLogbooks.length > 0 && !isDps && (
            <motion.div
              className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <div className="p-6 border-b border-outline-variant flex justify-between items-center bg-surface-container-low/30">
                <h3 className="font-headline-md text-body-lg text-primary font-bold">⏳ Logbook Menunggu Penilaian</h3>
                <span className="bg-yellow-100 text-yellow-700 font-bold text-[11px] px-2.5 py-0.5 rounded-full">
                  {recentLogbooks.length} Terbaru
                </span>
              </div>
              <div className="divide-y divide-outline-variant">
                {recentLogbooks.map((j) => (
                  <div key={j.id} className="p-4 px-6 flex justify-between items-center gap-4 hover:bg-surface-container-low transition-colors">
                    <div className="min-w-0 flex-1">
                      <div className="font-bold text-body-sm text-primary truncate">
                        {j.assignment?.title || 'Logbook Penugasan'}
                      </div>
                      <div className="text-[12px] text-on-surface-variant mt-1">
                        {j.user?.name || 'Mahasiswa'} • {new Date(j.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                      </div>
                    </div>
                    <span className="bg-yellow-50 text-yellow-700 border border-yellow-200 px-2 py-0.5 rounded text-[11px] font-bold uppercase">
                      Pending
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* DPL Rank Card */}
          {isDpl && (
            <TeacherMonitoring compact={true} highlightGuruId={user?.id} />
          )}

          {/* Info Card */}
          <motion.div
            className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="font-headline-md text-body-lg text-primary font-bold mb-2">🎉 E-Teaching School UAD Aktif</h3>
            <p className="text-on-surface-variant font-body-sm leading-relaxed">
              {isDpl
                ? 'Anda login sebagai Dosen Pembimbing Lapangan. Gunakan menu di sebelah kiri untuk memantau presensi, logbook, dan data mahasiswa bimbingan Anda secara real-time.'
                : isDps
                ? 'Anda login sebagai Dosen Pamong Skripsi (DPS). Gunakan menu di sebelah kiri untuk memantau presensi, logbook, dan data mahasiswa bimbingan Anda secara real-time.'
                : isGuruPamong
                ? 'Anda login sebagai Guru Pamong. Gunakan menu di sebelah kiri untuk memantau presensi, mengisi instrumen penilaian akhir, dan memantau mahasiswa bimbingan Anda secara real-time.'
                : 'Anda login sebagai Instansi Mitra. Gunakan menu di sebelah kiri untuk memantau presensi dan logbook mahasiswa yang melakukan PPL di tempat Anda.'
              }
            </p>
          </motion.div>
        </>
      )}
    </div>
  );
}
