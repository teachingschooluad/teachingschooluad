import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import api from '../../lib/api';

const MONTHS = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];

export default function TeacherMonitoring({ compact = false, highlightGuruId = null }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    fetchData();
  }, [month, year]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await api.get('/dashboard/dosen-monitoring', { params: { month, year } });
      if (res.data.success) setData(res.data.data);
    } catch (err) {
      console.error('Teacher monitoring error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getBadgeStyle = (persen) => {
    if (persen >= 80) return 'bg-green-50 text-green-700 border border-green-200';
    if (persen >= 50) return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
    return 'bg-red-50 text-red-700 border border-red-200';
  };

  const getProgressBg = (persen) => {
    if (persen >= 80) return 'bg-green-500';
    if (persen >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getRankEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  // Compact mode for Dosen Dashboard: show only their rank summary
  if (compact && highlightGuruId && data) {
    const myRank = data.rankings.find(r => r.guru_id === highlightGuruId);
    if (!myRank) return null;

    return (
      <motion.div
        className="bg-white border border-outline-variant rounded-xl p-6 shadow-sm"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className="flex justify-between items-center pb-4 border-b border-outline-variant mb-4">
          <h3 className="font-headline-md text-body-lg text-primary font-bold">🏆 Peringkat Keaktifan Anda</h3>
          <span className="text-label-sm text-on-surface-variant bg-surface-container px-2 py-1 rounded">
            {MONTHS[month - 1]} {year}
          </span>
        </div>
        <div>
          <div className="flex items-center gap-6 mb-4">
            <div className="text-[32px] font-extrabold text-primary min-w-[60px] text-center">
              {getRankEmoji(myRank.rank)}
            </div>
            <div className="flex-1">
              <div className="text-body-sm font-bold text-primary mb-1">
                Peringkat {myRank.rank} dari {data.rankings.length} Dosen Pembimbing
              </div>
              <div className="w-full bg-surface-container-low rounded-full h-3 overflow-hidden mb-2">
                <div 
                  className={`h-full ${getProgressBg(myRank.persen_keaktifan)} transition-all duration-500`}
                  style={{ width: `${Math.min(myRank.persen_keaktifan, 100)}%` }}
                />
              </div>
              <div className="flex justify-between items-center text-label-sm text-on-surface-variant">
                <span>{myRank.actual_journals}/{myRank.expected_journals} logbook terisi</span>
                <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${getBadgeStyle(myRank.persen_keaktifan)}`}>
                  {myRank.persen_keaktifan}%
                </span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-outline-variant text-center">
            <div>
              <div className="text-[20px] font-bold text-green-600">{myRank.jurnal_verified}</div>
              <div className="text-[11px] text-on-surface-variant font-medium">Disetujui</div>
            </div>
            <div>
              <div className="text-[20px] font-bold text-yellow-600">{myRank.jurnal_pending}</div>
              <div className="text-[11px] text-on-surface-variant font-medium">Menunggu</div>
            </div>
            <div>
              <div className="text-[20px] font-bold text-primary">{myRank.siswa_aktif}/{myRank.total_siswa}</div>
              <div className="text-[11px] text-on-surface-variant font-medium">Mahasiswa Aktif</div>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // Full mode for Admin Dashboard
  return (
    <motion.div
      className="bg-white border border-outline-variant rounded-xl overflow-hidden shadow-sm"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header controls */}
      <div className="p-6 border-b border-outline-variant flex justify-between items-center flex-wrap gap-4 bg-white">
        <h3 className="font-headline-md text-body-lg text-primary font-bold">🏆 Monitoring Keaktifan Dosen Pembimbing</h3>
        <div className="flex gap-2">
          <select 
            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-body-sm focus:ring-1 focus:ring-primary outline-none"
            value={month} 
            onChange={e => setMonth(Number(e.target.value))}
          >
            {MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
          </select>
          <select 
            className="bg-surface-container-low border border-outline-variant rounded-lg px-3 py-1.5 text-body-sm focus:ring-1 focus:ring-primary outline-none"
            value={year} 
            onChange={e => setYear(Number(e.target.value))}
          >
            {[2025, 2026, 2027].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-on-surface-variant animate-pulse font-medium">
          Memuat data keaktifan dosen...
        </div>
      ) : !data?.rankings?.length ? (
        <div className="p-12 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[48px] mb-2 text-outline">school</span>
          <h3 className="font-bold text-body-md">Belum ada data dosen</h3>
          <p className="text-label-sm">Tidak ada Dosen Pembimbing yang terdaftar.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-surface-container border-b border-outline-variant text-[12px] text-on-surface-variant uppercase tracking-wider font-semibold">
                <th className="py-4 px-6 text-center w-20">Rank</th>
                <th className="py-4 px-6">Nama Dosen</th>
                <th className="py-4 px-6 text-center">Bimbingan</th>
                <th className="py-4 px-6 text-center">⏳ Pending</th>
                <th className="py-4 px-6 text-center">✅ Disetujui</th>
                <th className="py-4 px-6 text-center">Mahasiswa Aktif</th>
                <th className="py-4 px-6 min-w-[200px] text-center">% Keaktifan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant">
              {data.rankings.map((r) => (
                <tr 
                  key={r.guru_id} 
                  className={`hover:bg-surface-container-low transition-colors ${highlightGuruId === r.guru_id ? 'bg-primary/5 font-semibold' : ''}`}
                >
                  <td className="py-4 px-6 text-center font-bold text-body-lg">
                    {getRankEmoji(r.rank)}
                  </td>
                  <td className="py-4 px-6 text-primary font-bold">
                    {r.guru_name}
                    {highlightGuruId === r.guru_id && (
                      <span className="ml-2 text-[10px] bg-primary text-on-primary px-2 py-0.5 rounded">Anda</span>
                    )}
                  </td>
                  <td className="py-4 px-6 text-center text-on-surface-variant font-medium">{r.total_siswa} Mahasiswa</td>
                  <td className="py-4 px-6 text-center font-bold text-yellow-600">
                    {r.jurnal_pending}
                  </td>
                  <td className="py-4 px-6 text-center font-bold text-green-600">
                    {r.jurnal_verified}
                  </td>
                  <td className="py-4 px-6 text-center text-on-surface-variant">
                    {r.siswa_aktif}/{r.total_siswa}
                  </td>
                  <td className="py-4 px-6">
                    <div className="flex items-center gap-3 justify-center">
                      <div className="w-28 bg-surface-container-low rounded-full h-2 overflow-hidden hidden sm:block">
                        <div 
                          className={`h-full ${getProgressBg(r.persen_keaktifan)}`} 
                          style={{ width: `${Math.min(r.persen_keaktifan, 100)}%` }}
                        />
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] ${getBadgeStyle(r.persen_keaktifan)}`}>
                        {r.persen_keaktifan}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
}
