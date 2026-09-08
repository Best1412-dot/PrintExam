import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { InstructorDashboard } from './pages/instructor/InstructorDashboard';
import { ExamCreatePage } from './pages/instructor/ExamCreatePage';
import { ExamDetailPage } from './pages/instructor/ExamDetailPage';
import { AvQueuePage } from './pages/av-staff/AvQueuePage';
import { ExamReviewPage } from './pages/av-staff/ExamReviewPage';
import { ExamPrintPage } from './pages/av-staff/ExamPrintPage';
import { ExamPackPage } from './pages/av-staff/ExamPackPage';
import { CourseSchedulePage } from './pages/coordinator/CourseSchedulePage';
import { ReceiveExamPage } from './pages/coordinator/ReceiveExamPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { ReportsPage } from './pages/admin/ReportsPage';
import { AuditLogPage } from './pages/admin/AuditLogPage';
import { NotificationsPage } from './pages/shared/NotificationsPage';
import { NotFoundPage } from './pages/shared/NotFoundPage';
import { UserRole } from './types';

// Role-based root redirect helper
const RootRedirect: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-sm">
        กำลังโหลดระบบ...
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === UserRole.INSTRUCTOR) return <Navigate to="/instructor/dashboard" replace />;
  if (user.role === UserRole.AV_STAFF) return <Navigate to="/av-staff/queue" replace />;
  if (user.role === UserRole.COORDINATOR) return <Navigate to="/coordinator/courses" replace />;
  if (user.role === UserRole.ADMIN) return <Navigate to="/admin/reports" replace />;
  return <Navigate to="/admin/reports" replace />;
};

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white text-sm">
        กำลังโหลดข้อมูล...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <WebSocketProvider>
          <BrowserRouter>
            <Routes>
              {/* Public Login Route with 2FA */}
              <Route path="/login" element={<LoginPage />} />

              {/* Protected Routes within App Shell */}
              <Route
                path="/"
                element={
                  <ProtectedRoute>
                    <AppLayout />
                  </ProtectedRoute>
                }
              >
                <Route index element={<RootRedirect />} />

                {/* Instructor Routes */}
                <Route path="instructor/dashboard" element={<InstructorDashboard />} />
                <Route path="instructor/exams/new" element={<ExamCreatePage />} />
                <Route path="instructor/exams/:id" element={<ExamDetailPage />} />

                {/* Media/AV Staff Routes */}
                <Route path="av-staff/queue" element={<AvQueuePage />} />
                <Route path="av-staff/exams/:id/review" element={<ExamReviewPage />} />
                <Route path="av-staff/exams/:id/print" element={<ExamPrintPage />} />
                <Route path="av-staff/exams/:id/pack" element={<ExamPackPage />} />

                {/* Exam Coordinator Routes */}
                <Route path="coordinator/courses" element={<CourseSchedulePage />} />
                <Route path="coordinator/receive" element={<ReceiveExamPage />} />

                {/* Admin Routes */}
                <Route path="admin/users" element={<UserManagementPage />} />
                <Route path="admin/reports" element={<ReportsPage />} />
                <Route path="admin/audit-log" element={<AuditLogPage />} />

                {/* Shared */}
                <Route path="notifications" element={<NotificationsPage />} />
                <Route path="*" element={<NotFoundPage />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </WebSocketProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
