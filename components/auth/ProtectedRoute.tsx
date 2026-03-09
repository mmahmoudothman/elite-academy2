import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';
import { hasPermission, Permission } from '../../utils/permissions';
import LoadingSpinner from '../ui/LoadingSpinner';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requiredRole?: UserRole;
  requiredPermission?: Permission;
}

const ROLE_HIERARCHY: Record<UserRole, number> = {
  super_admin: 6,
  admin: 5,
  content_creator: 4,
  moderator: 3,
  instructor: 2,
  student: 1,
};

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requiredRole,
  requiredPermission,
}) => {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Check allowedRoles (legacy)
  if (allowedRoles && userRole && !allowedRoles.includes(userRole)) {
    return <NotAuthorized />;
  }

  // Check requiredRole (hierarchy-based)
  if (requiredRole && userRole) {
    const userLevel = ROLE_HIERARCHY[userRole] ?? 0;
    const requiredLevel = ROLE_HIERARCHY[requiredRole] ?? 0;
    if (userLevel < requiredLevel) {
      return <NotAuthorized />;
    }
  }

  // Check requiredPermission
  if (requiredPermission && !hasPermission(userRole, requiredPermission)) {
    return <NotAuthorized />;
  }

  return <>{children}</>;
};

const NotAuthorized: React.FC = () => (
  <div className="min-h-screen flex items-center justify-center bg-slate-50">
    <div className="text-center max-w-md mx-auto px-6">
      <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
        </svg>
      </div>
      <h1 className="text-2xl font-bold text-slate-800 mb-2">Not Authorized</h1>
      <p className="text-slate-500 mb-6">
        You do not have permission to access this page. Please contact an administrator if you believe this is an error.
      </p>
      <a
        href="/"
        className="inline-block px-6 py-3 bg-teal-600 text-white rounded-xl font-semibold hover:bg-teal-700 transition-colors"
      >
        Go to Home
      </a>
    </div>
  </div>
);

export default ProtectedRoute;
