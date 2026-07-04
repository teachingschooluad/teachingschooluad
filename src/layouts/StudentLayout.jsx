import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import useAuthStore from '../stores/authStore';
import { HiOutlineHome, HiOutlineFingerPrint, HiOutlineDocumentText, HiOutlineClock, HiOutlineCog, HiOutlineLogout, HiOutlineClipboardCheck, HiOutlineChartBar } from 'react-icons/hi';

export default function StudentLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="student-layout">
      {/* Header */}
      <header className="student-header">
        <div className="student-header-left">
          <div className="student-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
          <span className="student-brand" style={{ fontSize: '16px' }}>E-Teaching School UAD</span>
        </div>
        <div className="student-header-right">
          <NavLink to="/mahasiswa/settings" className="student-header-btn" title="Pengaturan">
            <HiOutlineCog size={22} />
          </NavLink>
          <button onClick={handleLogout} className="student-header-btn" title="Logout">
            <HiOutlineLogout size={22} />
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="student-main">
        <Outlet />
      </main>

      {/* Bottom Nav */}
      <nav className="student-bottom-nav">
        <NavLink to="/mahasiswa/dashboard" className={({ isActive }) => `student-nav-item ${isActive ? 'active' : ''}`}>
          <HiOutlineHome size={22} />
          <span>Dashboard</span>
        </NavLink>
        <NavLink to="/mahasiswa/attendance" className={({ isActive }) => `student-nav-item ${isActive ? 'active' : ''}`}>
          <HiOutlineFingerPrint size={22} />
          <span>Presensi</span>
        </NavLink>
        <NavLink to="/mahasiswa/logbooks" className={({ isActive }) => `student-nav-item ${isActive ? 'active' : ''}`}>
          <HiOutlineDocumentText size={22} />
          <span>Logbook</span>
        </NavLink>
        <NavLink to="/mahasiswa/assessments" className={({ isActive }) => `student-nav-item ${isActive ? 'active' : ''}`}>
          <HiOutlineClipboardCheck size={22} />
          <span>Asesmen</span>
        </NavLink>
        <NavLink to="/mahasiswa/grades" className={({ isActive }) => `student-nav-item ${isActive ? 'active' : ''}`}>
          <HiOutlineChartBar size={22} />
          <span>Nilai</span>
        </NavLink>
      </nav>
    </div>
  );
}
