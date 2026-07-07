import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { useState } from 'react';
import { HiOutlineMenu, HiOutlineX, HiOutlineLogout } from 'react-icons/hi';

const navConfig = {
  admin: [
    { section: 'Utama', items: [
      { to: '/admin/dashboard', iconName: 'dashboard', label: 'Dashboard' },
    ]},
    { section: 'Monitoring', items: [
      { to: '/admin/attendance', iconName: 'calendar_today', label: 'Presensi' },
      { to: '/admin/logbook-assignments', iconName: 'assignment', label: 'Penugasan Logbook' },
      { to: '/admin/logbook-monitoring', iconName: 'fact_check', label: 'Monitoring Logbook' },
      { to: '/admin/permissions', iconName: 'event_busy', label: 'Perijinan' },
    ]},
    { section: 'Data Master', items: [
      { to: '/admin/students', iconName: 'group', label: 'Mahasiswa' },
      { to: '/admin/teachers', iconName: 'school', label: 'Dosen' },
      { to: '/admin/guru-pamongs', iconName: 'badge', label: 'Guru Pamong' },
      { to: '/admin/companies', iconName: 'business', label: 'Instansi Mitra' },
      { to: '/admin/classes', iconName: 'diversity_3', label: 'Kelompok PPL' },
    ]},
    { section: 'Penilaian', items: [
      { to: '/admin/final-assessments', iconName: 'grade', label: 'Asesmen Akhir' },
      { to: '/admin/instruments', iconName: 'fact_check', label: 'Instrumen Penilaian' },
      { to: '/admin/grades', iconName: 'analytics', label: 'Rekap Nilai' },
    ]},
    { section: 'Lainnya', items: [
      { to: '/admin/settings', iconName: 'settings', label: 'Pengaturan' },
    ]},
  ],
  dkl: [
    { section: 'Utama', items: [
      { to: '/dkl/dashboard', iconName: 'dashboard', label: 'Dashboard' },
    ]},
    { section: 'Penugasan', items: [
      { to: '/dkl/logbook-assignments', iconName: 'assignment', label: 'Penugasan Logbook' },
      { to: '/dkl/logbook-monitoring', iconName: 'fact_check', label: 'Monitoring Logbook' },
      { to: '/dkl/final-assessments', iconName: 'grade', label: 'Asesmen Akhir' },
      { to: '/dkl/instruments', iconName: 'fact_check', label: 'Instrumen Penilaian' },
    ]},
    { section: 'Monitoring', items: [
      { to: '/dkl/attendance', iconName: 'calendar_today', label: 'Presensi' },
      { to: '/dkl/students', iconName: 'group', label: 'Mahasiswa' },
      { to: '/dkl/guru-pamongs', iconName: 'badge', label: 'Guru Pamong' },
      { to: '/dkl/permissions', iconName: 'event_busy', label: 'Perijinan' },
    ]},
    { section: 'Penilaian', items: [
      { to: '/dkl/grades', iconName: 'analytics', label: 'Rekap Nilai' },
    ]},
    { section: 'Lainnya', items: [
      { to: '/dkl/settings', iconName: 'settings', label: 'Pengaturan' },
    ]},
  ],
  dpl: [
    { section: 'Utama', items: [
      { to: '/dpl/dashboard', iconName: 'dashboard', label: 'Dashboard' },
    ]},
    { section: 'Monitoring', items: [
      { to: '/dpl/attendance', iconName: 'calendar_today', label: 'Presensi' },
      { to: '/dpl/logbook-monitoring', iconName: 'fact_check', label: 'Monitoring Logbook' },
      { to: '/dpl/students', iconName: 'group', label: 'Mahasiswa Bimbingan' },
      { to: '/dpl/permissions', iconName: 'event_busy', label: 'Perijinan' },
    ]},
    { section: 'Penilaian', items: [
      { to: '/dpl/grades', iconName: 'analytics', label: 'Penilaian' },
    ]},
    { section: 'Lainnya', items: [
      { to: '/dpl/settings', iconName: 'settings', label: 'Pengaturan' },
    ]},
  ],
  dps: [
    { section: 'Utama', items: [
      { to: '/dps/dashboard', iconName: 'dashboard', label: 'Dashboard' },
    ]},
    { section: 'Monitoring', items: [
      { to: '/dps/attendance', iconName: 'calendar_today', label: 'Presensi' },
      { to: '/dps/logbook-monitoring', iconName: 'fact_check', label: 'Monitoring Logbook' },
      { to: '/dps/students', iconName: 'group', label: 'Mahasiswa Bimbingan' },
    ]},
    { section: 'Lainnya', items: [
      { to: '/dps/settings', iconName: 'settings', label: 'Pengaturan' },
    ]},
  ],
  sekolah: [
    { section: 'Utama', items: [
      { to: '/sekolah/dashboard', iconName: 'dashboard', label: 'Dashboard' },
      { to: '/sekolah/attendance', iconName: 'calendar_today', label: 'Presensi' },
      { to: '/sekolah/logbook-monitoring', iconName: 'fact_check', label: 'Monitoring Logbook' },
    ]},
  ],
  guru_pamong: [
    { section: 'Utama', items: [
      { to: '/guru-pamong/dashboard', iconName: 'dashboard', label: 'Dashboard' },
    ]},
    { section: 'Monitoring', items: [
      { to: '/guru-pamong/attendance', iconName: 'calendar_today', label: 'Presensi' },
      { to: '/guru-pamong/students', iconName: 'group', label: 'Mahasiswa Bimbingan' },
    ]},
    { section: 'Penilaian', items: [
      { to: '/guru-pamong/grades', iconName: 'analytics', label: 'Penilaian' },
    ]},
    { section: 'Lainnya', items: [
      { to: '/guru-pamong/settings', iconName: 'settings', label: 'Pengaturan' },
    ]},
  ],
  ortu: [
    { section: 'Utama', items: [
      { to: '/ortu/attendance', iconName: 'calendar_today', label: 'Kehadiran' },
      { to: '/ortu/logbook', iconName: 'assignment', label: 'Logbook' },
    ]},
  ],
};

const roleDisplayNames = {
  admin: 'Administrator',
  dkl: 'Dosen Koordinator',
  dpl: 'Dosen Pembimbing',
  dps: 'Dosen Pamong Skripsi',
  mahasiswa: 'Mahasiswa',
  sekolah: 'Instansi Mitra',
  guru_pamong: 'Guru Pamong',
  ortu: 'Orang Tua',
};

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const sections = navConfig[user?.role] || [];

  return (
    <div className="min-h-screen bg-background font-body-md text-on-background">
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setSidebarOpen(true)}
        className="md:hidden fixed top-4 left-4 z-40 p-2 bg-primary text-on-primary rounded-lg shadow-md active:scale-95 transition-transform"
      >
        <HiOutlineMenu size={24} />
      </button>

      {/* Sidebar Overlay for Mobile */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SideNavBar Shell */}
      <aside className={`w-[280px] h-screen fixed left-0 top-0 bg-primary dark:bg-primary-container flex flex-col overflow-y-auto z-50 transition-transform duration-300 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 py-8 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center p-1 overflow-hidden">
              <img 
                className="w-full h-full object-contain" 
                alt="Logo UAD" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDLVqXgdRrjQuEwIhJQMmDrP46qcJiLdwosqGxIDRQ32_KfSzDmhH6dTV-i_ccfFs7VB1ZppvgqoP6EzXuQYB22kn87YQ0ulK5PiPBaffGdw_gskBLO1rlFrEzqz5LGCWWIfa6zoEE8WgQn3JJ-OoYEClYkwRetssY4wppZn1wOcWozjNRtW4XfxiImhf_5l0b8GdNvgQ3xDgtkiNDaU5zQ3dZgjtw7UFF8nJcJkU5ZLTnaB7WHLS1AOJSP9ZjaI5Qb3HSF7s7JWYc"
              />
            </div>
            <div>
              <h1 className="font-headline-md text-[18px] font-bold text-on-primary leading-tight">E-Teaching</h1>
              <p className="text-[10px] text-on-primary/60 tracking-wider uppercase font-semibold">Univ. Ahmad Dahlan</p>
            </div>
          </div>
          <button 
            className="md:hidden text-on-primary p-1 hover:bg-white/10 rounded-lg"
            onClick={() => setSidebarOpen(false)}
          >
            <HiOutlineX size={20} />
          </button>
        </div>

        <nav className="flex-1 px-0 mt-4">
          <div className="space-y-1">
            {sections.map((section) => (
              <div key={section.section} className="mb-4">
                <div className="px-6 text-[10px] text-on-primary/40 uppercase tracking-widest font-bold mb-2">
                  {section.section}
                </div>
                {section.items.map((item) => (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    onClick={() => setSidebarOpen(false)}
                    className={({ isActive }) => 
                      isActive 
                        ? "flex items-center gap-3 border-l-4 border-secondary-fixed bg-primary-container/20 text-secondary-fixed font-bold px-6 py-3 transition-transform active:scale-[0.98]"
                        : "flex items-center gap-3 text-on-primary/70 hover:text-on-primary px-6 py-3 hover:bg-primary-container/10 transition-colors duration-200 active:scale-[0.98] transition-transform"
                    }
                  >
                    <span className="material-symbols-outlined text-[20px]">{item.iconName}</span>
                    <span className="font-body-md text-body-md">{item.label}</span>
                  </NavLink>
                ))}
              </div>
            ))}
          </div>
        </nav>

        <div className="p-6 mt-auto border-t border-white/10">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center gap-3 text-on-primary/70 hover:text-on-primary px-6 py-3 hover:bg-primary-container/10 rounded-lg transition-colors duration-200"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            <span className="font-body-md text-body-md">Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="ml-0 md:ml-[280px] min-h-screen">
        {/* TopNavBar Shell */}
        <header className="h-16 w-full md:w-[calc(100%-280px)] fixed top-0 right-0 bg-surface-container-lowest dark:bg-surface-dim border-b border-outline-variant flex justify-between items-center px-gutter z-40">
          <div className="flex items-center gap-4 pl-12 md:pl-0">
            <div className="relative group hidden sm:block">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant pointer-events-none">search</span>
              <input 
                className="pl-10 pr-4 py-2 w-64 bg-surface-container-low border-none rounded-lg text-body-sm focus:ring-2 focus:ring-primary transition-all focus:outline-none" 
                placeholder="Cari data..." 
                type="text"
              />
            </div>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex items-center gap-4 border-r border-outline-variant pr-6">
              <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors relative cursor-pointer active:opacity-80">
                <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
                <span className="absolute top-2 right-2 w-2 h-2 bg-error rounded-full"></span>
              </button>
              <button className="p-2 hover:bg-surface-container-low rounded-full transition-colors cursor-pointer active:opacity-80">
                <span className="material-symbols-outlined text-on-surface-variant">calendar_month</span>
              </button>
            </div>
            <div className="flex items-center gap-3 group">
              <div className="text-right">
                <p className="font-label-md text-label-md text-primary font-bold leading-tight">{user?.name}</p>
                <p className="text-[10px] text-on-surface-variant uppercase font-bold">{roleDisplayNames[user?.role] || user?.role}</p>
              </div>
              <div className="w-10 h-10 rounded-full border-2 border-primary-fixed overflow-hidden flex items-center justify-center bg-primary/10 text-primary font-bold uppercase">
                {user?.name?.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Canvas & Child Route rendering */}
        <div className="pt-20 pb-12 px-gutter min-h-screen">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
