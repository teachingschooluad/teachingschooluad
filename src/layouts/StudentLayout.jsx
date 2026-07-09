import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { useState } from 'react';
import {
  HiOutlineHome,
  HiOutlineFingerPrint,
  HiOutlineDocumentText,
  HiOutlineClock,
  HiOutlineCog,
  HiOutlineLogout,
  HiOutlineClipboardCheck,
  HiOutlineChartBar,
  HiOutlineMenu,
  HiOutlineX,
  HiOutlineBell,
} from 'react-icons/hi';

const navItems = [
  { to: '/mahasiswa/dashboard', icon: HiOutlineHome, label: 'Dashboard' },
  { to: '/mahasiswa/attendance', icon: HiOutlineFingerPrint, label: 'Presensi' },
  { to: '/mahasiswa/logbooks', icon: HiOutlineDocumentText, label: 'Logbook' },
  { to: '/mahasiswa/grades', icon: HiOutlineChartBar, label: 'Nilai' },
];

export default function StudentLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="student-layout-responsive">
      {/* ===== SIDEBAR (Desktop + Mobile Drawer) ===== */}
      {sidebarOpen && (
        <div
          className="student-sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`student-sidebar ${sidebarOpen ? 'open' : ''}`}>
        {/* Sidebar Header */}
        <div className="student-sidebar-header">
          <div className="student-sidebar-brand">
            <div className="student-sidebar-logo-wrap">
              <img src="/uad_logo_symbol.png" alt="Logo UAD" />
            </div>
            <div>
              <h1>E-Teaching</h1>
              <p>Univ. Ahmad Dahlan</p>
            </div>
          </div>
          <button
            className="student-sidebar-close"
            onClick={() => setSidebarOpen(false)}
          >
            <HiOutlineX size={20} />
          </button>
        </div>

        {/* Sidebar Nav */}
        <nav className="student-sidebar-nav">
          <div className="student-sidebar-section-label">Menu Utama</div>
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `student-sidebar-link ${isActive ? 'active' : ''}`
              }
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          ))}

          <div className="student-sidebar-section-label" style={{ marginTop: '16px' }}>Lainnya</div>
          <NavLink
            to="/mahasiswa/settings"
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `student-sidebar-link ${isActive ? 'active' : ''}`
            }
          >
            <HiOutlineCog size={20} />
            <span>Pengaturan</span>
          </NavLink>
        </nav>

        {/* Sidebar Footer */}
        <div className="student-sidebar-footer">
          <button onClick={handleLogout} className="student-sidebar-logout">
            <HiOutlineLogout size={20} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* ===== MAIN AREA ===== */}
      <div className="student-main-area">
        {/* Desktop Top Bar */}
        <header className="student-topbar">
          <div className="student-topbar-left">
            <button
              className="student-topbar-menu-btn"
              onClick={() => setSidebarOpen(true)}
            >
              <HiOutlineMenu size={24} />
            </button>
            {/* Mobile brand */}
            <div className="student-mobile-brand">
              <div className="student-avatar-sm">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
              <span>E-Teaching School UAD</span>
            </div>
          </div>
          <div className="student-topbar-right">
            <button className="student-topbar-icon-btn" title="Notifikasi">
              <HiOutlineBell size={20} />
              <span className="student-notif-dot" />
            </button>
            <NavLink to="/mahasiswa/settings" className="student-topbar-icon-btn" title="Pengaturan">
              <HiOutlineCog size={20} />
            </NavLink>
            <div className="student-topbar-user">
              <div className="student-topbar-user-info">
                <p className="student-topbar-user-name">{user?.name}</p>
                <p className="student-topbar-user-role">Mahasiswa</p>
              </div>
              <div className="student-topbar-avatar">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            </div>
            <button onClick={handleLogout} className="student-topbar-icon-btn student-topbar-logout-btn" title="Logout">
              <HiOutlineLogout size={20} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="student-content">
          <Outlet />
        </main>
      </div>

      {/* ===== BOTTOM NAV (Mobile only) ===== */}
      <nav className="student-bottom-nav">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `student-nav-item ${isActive ? 'active' : ''}`
            }
          >
            <item.icon size={22} />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}
