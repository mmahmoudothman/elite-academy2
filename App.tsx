import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './components/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ui/ErrorBoundary';
import ToastProvider from './components/ui/Toast';
import ProtectedRoute from './components/auth/ProtectedRoute';
import LoadingSpinner from './components/ui/LoadingSpinner';

const LandingPage = lazy(() => import('./pages/LandingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const ContactPage = lazy(() => import('./pages/ContactPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const StudentDashboardPage = lazy(() => import('./pages/StudentDashboardPage'));
const InstructorDashboardPage = lazy(() => import('./pages/InstructorDashboardPage'));

const PageFallback = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <LoadingSpinner size="lg" />
  </div>
);

const DashboardRedirect: React.FC = () => {
  const { userRole, loading } = useAuth();

  if (loading || !userRole) {
    return <PageFallback />;
  }

  if (userRole === 'student') {
    return <Navigate to="/student" replace />;
  }

  if (userRole === 'instructor') {
    return <Navigate to="/instructor" replace />;
  }

  // All other roles (super_admin, admin, content_creator, moderator) get the admin dashboard
  return <DashboardPage />;
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <LanguageProvider>
          <ToastProvider />
          <Suspense fallback={<PageFallback />}>
            <Routes>
              <Route path="/" element={<ErrorBoundary><LandingPage /></ErrorBoundary>} />
              <Route path="/login" element={<ErrorBoundary><LoginPage /></ErrorBoundary>} />
              <Route path="/register" element={<ErrorBoundary><RegisterPage /></ErrorBoundary>} />
              <Route path="/contact" element={<ErrorBoundary><ContactPage /></ErrorBoundary>} />
              <Route path="/profile" element={<ErrorBoundary><ProfilePage /></ErrorBoundary>} />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['super_admin', 'admin', 'instructor', 'student']}>
                    <ErrorBoundary><DashboardRedirect /></ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/student/*"
                element={
                  <ProtectedRoute allowedRoles={['student', 'instructor', 'admin', 'super_admin']}>
                    <ErrorBoundary><StudentDashboardPage /></ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route
                path="/instructor/*"
                element={
                  <ProtectedRoute allowedRoles={['instructor', 'admin', 'super_admin']}>
                    <ErrorBoundary><InstructorDashboardPage /></ErrorBoundary>
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
        </LanguageProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
