import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './stores/authStore';
import AppLayout from './layouts/AppLayout';
import StudentLayout from './layouts/StudentLayout';
import LoginPage from './pages/LoginPage';
import AdminDashboard from './pages/admin/AdminDashboard';
import AttendanceGrid from './pages/admin/AttendanceGrid';

// Master Data
import StudentsPage from './pages/admin/master/StudentsPage';
import TeachersPage from './pages/admin/master/TeachersPage';
import GuruPamongsPage from './pages/admin/master/GuruPamongsPage';
import CompaniesPage from './pages/admin/master/CompaniesPage';
import ClassesPage from './pages/admin/master/ClassesPage';
import SettingsPage from './pages/admin/SettingsPage';

// Logbook & Assessment Pages
import LogbookAssignmentsPage from './pages/admin/LogbookAssignmentsPage';
import LogbookMonitoringPage from './pages/admin/LogbookMonitoringPage';
import FinalAssessmentPage from './pages/admin/FinalAssessmentPage';
import GradeRecapPage from './pages/admin/GradeRecapPage';
import InstrumentManagePage from './pages/admin/InstrumentManagePage';
import InstrumentFillPage from './pages/admin/InstrumentFillPage';

// Student Pages
import StudentDashboard from './pages/student/StudentDashboard';
import StudentAttendance from './pages/student/StudentAttendance';
import StudentHistory from './pages/student/StudentHistory';
import StudentSettings from './pages/student/StudentSettings';
import MahasiswaLogbook from './pages/student/MahasiswaLogbook';
import MahasiswaAsesmen from './pages/student/MahasiswaAsesmen';
import MahasiswaNilai from './pages/student/MahasiswaNilai';

// Other Pages
import PermissionsPage from './pages/admin/PermissionsPage';
import ParentTrackingPage from './pages/public/ParentTrackingPage';
import PrivacyPolicy from './pages/public/PrivacyPolicy';
import RoleDashboard from './pages/admin/RoleDashboard';
import RoleSettingsPage from './pages/admin/RoleSettingsPage';

function ProtectedRoute({ children, roles }) {
  const { user, token } = useAuthStore();
  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) return <Navigate to="/login" replace />;
  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{
        style: { background: '#1e293b', color: '#f1f5f9', border: '1px solid rgba(255,255,255,0.08)' }
      }} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Admin */}
        <Route path="/admin" element={<ProtectedRoute roles={['admin']}><AppLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="attendance" element={<AttendanceGrid />} />
          <Route path="logbook-assignments" element={<LogbookAssignmentsPage />} />
          <Route path="logbook-monitoring" element={<LogbookMonitoringPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="teachers" element={<TeachersPage />} />
          <Route path="guru-pamongs" element={<GuruPamongsPage />} />
          <Route path="companies" element={<CompaniesPage />} />
          <Route path="classes" element={<ClassesPage />} />
          <Route path="permissions" element={<PermissionsPage />} />
          <Route path="final-assessments" element={<FinalAssessmentPage />} />
          <Route path="instruments" element={<InstrumentManagePage />} />
          <Route path="instruments/:instrumentId/fill/:studentId" element={<InstrumentFillPage />} />
          <Route path="grades" element={<GradeRecapPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Dosen Koordinator Lapangan (DKL) */}
        <Route path="/dkl" element={<ProtectedRoute roles={['dkl']}><AppLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="attendance" element={<AttendanceGrid />} />
          <Route path="logbook-assignments" element={<LogbookAssignmentsPage />} />
          <Route path="logbook-monitoring" element={<LogbookMonitoringPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="guru-pamongs" element={<GuruPamongsPage />} />
          <Route path="permissions" element={<PermissionsPage />} />
          <Route path="final-assessments" element={<FinalAssessmentPage />} />
          <Route path="instruments" element={<InstrumentManagePage />} />
          <Route path="instruments/:instrumentId/fill/:studentId" element={<InstrumentFillPage />} />
          <Route path="grades" element={<GradeRecapPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>

        {/* Dosen Pembimbing Lapangan (DPL) */}
        <Route path="/dpl" element={<ProtectedRoute roles={['dpl']}><AppLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<RoleDashboard />} />
          <Route path="attendance" element={<AttendanceGrid />} />
          <Route path="logbook-monitoring" element={<LogbookMonitoringPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="permissions" element={<PermissionsPage />} />
          <Route path="instruments/:instrumentId/fill/:studentId" element={<InstrumentFillPage />} />
          <Route path="grades" element={<GradeRecapPage />} />
          <Route path="settings" element={<RoleSettingsPage />} />
        </Route>

        {/* Dosen Pamong Skripsi (DPS) */}
        <Route path="/dps" element={<ProtectedRoute roles={['dps']}><AppLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<RoleDashboard />} />
          <Route path="attendance" element={<AttendanceGrid />} />
          <Route path="logbook-monitoring" element={<LogbookMonitoringPage />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="settings" element={<RoleSettingsPage />} />
        </Route>

        {/* Instansi Mitra (Sekolah/Company) */}
        <Route path="/sekolah" element={<ProtectedRoute roles={['sekolah']}><AppLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<RoleDashboard />} />
          <Route path="attendance" element={<AttendanceGrid />} />
          <Route path="logbook-monitoring" element={<LogbookMonitoringPage />} />
        </Route>

        {/* Guru Pamong (NEW) */}
        <Route path="/guru-pamong" element={<ProtectedRoute roles={['guru_pamong']}><AppLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<RoleDashboard />} />
          <Route path="attendance" element={<AttendanceGrid />} />
          <Route path="students" element={<StudentsPage />} />
          <Route path="instruments/:instrumentId/fill/:studentId" element={<InstrumentFillPage />} />
          <Route path="grades" element={<GradeRecapPage />} />
          <Route path="settings" element={<RoleSettingsPage />} />
        </Route>

        {/* Student (PWA — Mobile-First with Bottom Nav) */}
        <Route path="/mahasiswa" element={<ProtectedRoute roles={['mahasiswa']}><StudentLayout /></ProtectedRoute>}>
          <Route path="dashboard" element={<StudentDashboard />} />
          <Route path="attendance" element={<StudentAttendance />} />
          <Route path="logbooks" element={<MahasiswaLogbook />} />
          <Route path="assessments" element={<MahasiswaAsesmen />} />
          <Route path="grades" element={<MahasiswaNilai />} />
          <Route path="history" element={<StudentHistory />} />
          <Route path="settings" style={{ padding: 0 }} element={<StudentSettings />} />
        </Route>

        {/* Orang Tua (Public/Linked view) */}
        <Route path="/ortu" element={<ParentTrackingPage />} />

        {/* Public Information */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      </Routes>
    </BrowserRouter>
  );
}
