import { useAuth } from '../contexts/AuthContext';
import { hasPermission, hasAnyPermission, Permission, canAssignRole } from '../utils/permissions';

export function usePermissions() {
  const { user } = useAuth();
  const role = user?.role ?? null;

  return {
    can: (permission: Permission) => hasPermission(role, permission),
    canAny: (permissions: Permission[]) => hasAnyPermission(role, permissions),
    canAssign: (targetRole: string) => canAssignRole(role, targetRole),
    role,
    isAdmin: role === 'admin' || role === 'super_admin',
    isSuperAdmin: role === 'super_admin',
    isContentCreator: role === 'content_creator',
    isModerator: role === 'moderator',
    isInstructor: role === 'instructor',
    isStudent: role === 'student',
    hasAnyAdminAccess: role === 'super_admin' || role === 'admin' || role === 'content_creator' || role === 'moderator',
  };
}
