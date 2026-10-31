import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { ConfirmProvider } from './context/ConfirmContext';
import { AppShell } from './components/layout/AppShell';
import { RoleGuard } from './components/layout/RoleGuard';

// Public Pages
import { Login } from './pages/public/Login';
import { Forbidden403 } from './pages/public/Forbidden403';
import { NotFound404 } from './pages/public/NotFound404';

// Teacher Pages
import { TeacherDashboard } from './pages/teacher/TeacherDashboard';
import { ClassList } from './pages/teacher/ClassList';
import { ClassDetail } from './pages/teacher/ClassDetail';
import { StudentList } from './pages/teacher/StudentList';
import { StudentImport } from './pages/teacher/StudentImport';
import { Student360Profile } from './pages/teacher/Student360Profile';
import { AttendancePage } from './pages/teacher/AttendancePage';
import { SchedulePage } from './pages/teacher/SchedulePage';
import { TeachingHub } from './pages/teacher/TeachingHub';
import { AssignmentsPage } from './pages/teacher/AssignmentsPage';
import { GradebookPage } from './pages/teacher/GradebookPage';
import { ClassTools } from './pages/teacher/ClassTools';
import { AlertsPage } from './pages/teacher/AlertsPage';
import { AnnouncementsPage } from './pages/teacher/AnnouncementsPage';
import { ReportsPage } from './pages/teacher/ReportsPage';

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StudentAssignments } from './pages/student/StudentAssignments';
import { StudentGrades } from './pages/student/StudentGrades';
import { StudentBadges } from './pages/student/StudentBadges';

// Parent Pages
import { ParentDashboard } from './pages/parent/ParentDashboard';
import { ParentFeedback } from './pages/parent/ParentFeedback';

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AuditLogsPage } from './pages/admin/AuditLogsPage';
import { UserManagement } from './pages/admin/UserManagement';
import { SystemSettings } from './pages/admin/SystemSettings';

const RootRedirect: React.FC = () => {
  const { currentRole } = useAuth();
  if (currentRole === 'teacher') return <Navigate to="/teacher/dashboard" replace />;
  if (currentRole === 'student') return <Navigate to="/student/dashboard" replace />;
  if (currentRole === 'guardian') return <Navigate to="/parent/dashboard" replace />;
  if (currentRole === 'admin') return <Navigate to="/admin/dashboard" replace />;
  return <Navigate to="/login" replace />;
};

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <ConfirmProvider>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/403" element={<Forbidden403 />} />

              {/* Main Shell Layout */}
              <Route element={<AppShell />}>
                {/* TEACHER ROUTES (teacher & admin allowed) */}
                <Route
                  path="/teacher/dashboard"
                  element={
                    <RoleGuard allowedRoles={['teacher', 'admin']}>
                      <TeacherDashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/teacher/classes"
                  element={<Navigate to="/teacher/dashboard" replace />}
                />
                <Route
                  path="/teacher/classes/:id"
                  element={
                    <RoleGuard allowedRoles={['teacher', 'admin']}>
                      <ClassDetail />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/teacher/students"
                  element={
                    <RoleGuard allowedRoles={['teacher', 'admin']}>
                      <StudentList />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/teacher/students/import"
                  element={
                    <RoleGuard allowedRoles={['teacher', 'admin']}>
                      <StudentImport />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/teacher/students/:id"
                  element={
                    <RoleGuard allowedRoles={['teacher', 'admin']}>
                      <Student360Profile />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/teacher/attendance"
                  element={
                    <RoleGuard allowedRoles={['teacher', 'admin']}>
                      <AttendancePage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/teacher/schedule"
                  element={
                    <RoleGuard allowedRoles={['teacher', 'admin']}>
                      <SchedulePage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/teacher/teaching"
                  element={
                    <RoleGuard allowedRoles={['teacher', 'admin']}>
                      <TeachingHub />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/teacher/teaching/:tab"
                  element={
                    <RoleGuard allowedRoles={['teacher', 'admin']}>
                      <TeachingHub />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/teacher/assignments"
                  element={<Navigate to="/teacher/teaching/assignments" replace />}
                />
                <Route
                  path="/teacher/grades"
                  element={
                    <RoleGuard allowedRoles={['teacher', 'admin']}>
                      <GradebookPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/teacher/tools"
                  element={
                    <RoleGuard allowedRoles={['teacher', 'admin']}>
                      <ClassTools />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/teacher/tools/:toolName"
                  element={
                    <RoleGuard allowedRoles={['teacher', 'admin']}>
                      <ClassTools />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/teacher/alerts"
                  element={
                    <RoleGuard allowedRoles={['teacher', 'admin']}>
                      <AlertsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/teacher/announcements"
                  element={
                    <RoleGuard allowedRoles={['teacher', 'admin']}>
                      <AnnouncementsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/teacher/reports"
                  element={
                    <RoleGuard allowedRoles={['teacher', 'admin']}>
                      <ReportsPage />
                    </RoleGuard>
                  }
                />

                {/* STUDENT ROUTES (student & admin allowed) */}
                <Route
                  path="/student/dashboard"
                  element={
                    <RoleGuard allowedRoles={['student', 'admin']}>
                      <StudentDashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/student/schedule"
                  element={
                    <RoleGuard allowedRoles={['student', 'admin']}>
                      <SchedulePage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/student/assignments"
                  element={
                    <RoleGuard allowedRoles={['student', 'admin']}>
                      <StudentAssignments />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/student/grades"
                  element={
                    <RoleGuard allowedRoles={['student', 'admin']}>
                      <StudentGrades />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/student/attendance"
                  element={
                    <RoleGuard allowedRoles={['student', 'admin']}>
                      <Student360Profile />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/student/badges"
                  element={
                    <RoleGuard allowedRoles={['student', 'admin']}>
                      <StudentBadges />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/student/announcements"
                  element={
                    <RoleGuard allowedRoles={['student', 'admin']}>
                      <AnnouncementsPage />
                    </RoleGuard>
                  }
                />

                {/* PARENT ROUTES (guardian & admin allowed) */}
                <Route
                  path="/parent/dashboard"
                  element={
                    <RoleGuard allowedRoles={['guardian', 'admin']}>
                      <ParentDashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/parent/profile"
                  element={
                    <RoleGuard allowedRoles={['guardian', 'admin']}>
                      <Student360Profile />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/parent/grades"
                  element={
                    <RoleGuard allowedRoles={['guardian', 'admin']}>
                      <StudentGrades />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/parent/attendance"
                  element={
                    <RoleGuard allowedRoles={['guardian', 'admin']}>
                      <Student360Profile />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/parent/assignments"
                  element={
                    <RoleGuard allowedRoles={['guardian', 'admin']}>
                      <StudentAssignments />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/parent/messages"
                  element={
                    <RoleGuard allowedRoles={['guardian', 'admin']}>
                      <ParentFeedback />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/parent/announcements"
                  element={
                    <RoleGuard allowedRoles={['guardian', 'admin']}>
                      <AnnouncementsPage />
                    </RoleGuard>
                  }
                />

                {/* ADMIN ROUTES (admin only) */}
                <Route
                  path="/admin/dashboard"
                  element={
                    <RoleGuard allowedRoles={['admin']}>
                      <AdminDashboard />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/classes"
                  element={
                    <RoleGuard allowedRoles={['admin']}>
                      <ClassList />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/students"
                  element={
                    <RoleGuard allowedRoles={['admin']}>
                      <StudentList />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/users"
                  element={
                    <RoleGuard allowedRoles={['admin']}>
                      <UserManagement />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/audit-logs"
                  element={
                    <RoleGuard allowedRoles={['admin']}>
                      <AuditLogsPage />
                    </RoleGuard>
                  }
                />
                <Route
                  path="/admin/settings"
                  element={
                    <RoleGuard allowedRoles={['admin']}>
                      <SystemSettings />
                    </RoleGuard>
                  }
                />
              </Route>

              {/* 404 Catch-All */}
              <Route path="*" element={<NotFound404 />} />
            </Routes>
          </ConfirmProvider>
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
