import { UserRole } from '../types';

// All available permissions organized by module
export const PERMISSION_MODULES = {
  users: { label: 'User Management', permissions: ['users.view', 'users.create', 'users.edit', 'users.delete', 'users.deactivate'] },
  courses: { label: 'Course Management', permissions: ['courses.view', 'courses.create', 'courses.edit', 'courses.delete', 'courses.publish'] },
  students: { label: 'Student Management', permissions: ['students.view', 'students.create', 'students.edit', 'students.delete', 'students.enroll'] },
  instructors: { label: 'Instructor Management', permissions: ['instructors.view', 'instructors.create', 'instructors.edit', 'instructors.delete'] },
  enrollments: { label: 'Enrollment Management', permissions: ['enrollments.view', 'enrollments.edit', 'enrollments.delete'] },
  content: { label: 'Content Management', permissions: ['content.create', 'content.edit', 'content.publish', 'content.delete'] },
  communication: { label: 'Communication', permissions: ['contacts.view', 'contacts.edit', 'contacts.delete', 'announcements.create', 'announcements.edit', 'ads.view', 'ads.create', 'ads.edit', 'ads.delete'] },
  financial: { label: 'Financial', permissions: ['payments.view', 'payments.manage', 'payments.refund', 'financials.view', 'financials.edit', 'financial_reports.view'] },
  analytics: { label: 'Analytics', permissions: ['analytics.view', 'analytics.export'] },
  system: { label: 'System', permissions: ['settings.view', 'settings.edit', 'roles.view', 'roles.manage', 'permissions.manage', 'audit.view', 'integrations.manage'] },
  liveSessions: { label: 'Live Sessions', permissions: ['sessions.view', 'sessions.create', 'sessions.start', 'sessions.delete'] },
  recordings: { label: 'Recordings', permissions: ['recordings.view', 'recordings.upload', 'recordings.delete'] },
  quizzes: { label: 'Quizzes', permissions: ['quizzes.view', 'quizzes.create', 'quizzes.edit', 'quizzes.delete', 'quizzes.grade'] },
  capstones: { label: 'Capstones', permissions: ['capstones.view', 'capstones.create', 'capstones.edit', 'capstones.delete', 'capstones.grade'] },
  progress: { label: 'Progress', permissions: ['progress.view_all', 'progress.view_own'] },
} as const;

// Derive Permission type from PERMISSION_MODULES
export type Permission = typeof PERMISSION_MODULES[keyof typeof PERMISSION_MODULES]['permissions'][number];

// Get all available permissions as flat array
export function getAllPermissions(): Permission[] {
  return Object.values(PERMISSION_MODULES).flatMap(m => [...m.permissions]) as Permission[];
}

// Default role-permission mappings (built-in)
const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: getAllPermissions(),
  admin: [
    // User Management (all except users.delete)
    'users.view', 'users.create', 'users.edit', 'users.deactivate',
    // Course Management
    'courses.view', 'courses.create', 'courses.edit', 'courses.delete', 'courses.publish',
    // Student Management
    'students.view', 'students.create', 'students.edit', 'students.delete', 'students.enroll',
    // Instructor Management
    'instructors.view', 'instructors.create', 'instructors.edit', 'instructors.delete',
    // Enrollment Management
    'enrollments.view', 'enrollments.edit', 'enrollments.delete',
    // Content Management
    'content.create', 'content.edit', 'content.publish', 'content.delete',
    // Communication
    'contacts.view', 'contacts.edit', 'contacts.delete',
    'announcements.create', 'announcements.edit',
    'ads.view', 'ads.create', 'ads.edit', 'ads.delete',
    // Financial
    'payments.view', 'payments.manage', 'payments.refund',
    'financials.view', 'financials.edit', 'financial_reports.view',
    // Analytics
    'analytics.view', 'analytics.export',
    // System (except roles.manage, permissions.manage, integrations.manage)
    'settings.view', 'settings.edit',
    'roles.view',
    'audit.view',
    // Live Sessions
    'sessions.view', 'sessions.create', 'sessions.start', 'sessions.delete',
    // Recordings
    'recordings.view', 'recordings.upload', 'recordings.delete',
    // Quizzes
    'quizzes.view', 'quizzes.create', 'quizzes.edit', 'quizzes.delete', 'quizzes.grade',
    // Capstones
    'capstones.view', 'capstones.create', 'capstones.edit', 'capstones.delete', 'capstones.grade',
    // Progress
    'progress.view_all',
  ],
  content_creator: [
    'courses.view', 'courses.create', 'courses.edit', 'courses.publish',
    'content.create', 'content.edit', 'content.publish', 'content.delete',
    'announcements.create', 'announcements.edit',
    'ads.view', 'ads.create', 'ads.edit', 'ads.delete',
    'analytics.view',
    // Recordings
    'recordings.view', 'recordings.upload',
    // Quizzes
    'quizzes.view', 'quizzes.create', 'quizzes.edit',
  ],
  moderator: [
    'contacts.view', 'contacts.edit',
    'students.view', 'students.edit',
    'enrollments.view',
    'courses.view',
    'content.edit',
    'analytics.view',
  ],
  instructor: [
    'courses.view', 'courses.edit',
    'students.view',
    'enrollments.view',
    'analytics.view',
    // Live Sessions
    'sessions.view', 'sessions.create', 'sessions.start', 'sessions.delete',
    // Recordings
    'recordings.view', 'recordings.upload', 'recordings.delete',
    // Quizzes
    'quizzes.view', 'quizzes.create', 'quizzes.edit', 'quizzes.delete', 'quizzes.grade',
    // Capstones
    'capstones.view', 'capstones.create', 'capstones.edit', 'capstones.delete', 'capstones.grade',
    // Progress
    'progress.view_all',
  ],
  student: [
    // Students can view courses, sessions, recordings, quizzes, capstones, and their own progress
    'courses.view',
    'sessions.view',
    'recordings.view',
    'quizzes.view',
    'capstones.view',
    'progress.view_own',
  ],
};

// Storage key for custom role-permission overrides
const RBAC_STORAGE_KEY = 'elite_academy_rbac_config';

// Interface for stored RBAC config
export interface RBACConfig {
  roles: Record<string, { label: string; permissions: Permission[]; isCustom?: boolean; createdAt?: number }>;
}

// Load custom RBAC config from localStorage
function loadRBACConfig(): RBACConfig | null {
  try {
    const stored = localStorage.getItem(RBAC_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return null;
}

// Save RBAC config to localStorage
export function saveRBACConfig(config: RBACConfig): void {
  localStorage.setItem(RBAC_STORAGE_KEY, JSON.stringify(config));
}

// Get the effective permissions for a role (custom overrides take precedence)
export function getRolePermissions(role: string): Permission[] {
  const custom = loadRBACConfig();
  if (custom?.roles[role]) return custom.roles[role].permissions;
  return DEFAULT_ROLE_PERMISSIONS[role as UserRole] ?? [];
}

// Get all roles (built-in + custom)
export function getAllRoles(): Record<string, { label: string; permissions: Permission[]; isCustom?: boolean; isBuiltIn?: boolean }> {
  const builtIn: Record<string, { label: string; permissions: Permission[]; isBuiltIn: boolean }> = {
    super_admin: { label: 'Super Admin', permissions: DEFAULT_ROLE_PERMISSIONS.super_admin, isBuiltIn: true },
    admin: { label: 'Admin', permissions: DEFAULT_ROLE_PERMISSIONS.admin, isBuiltIn: true },
    content_creator: { label: 'Content Creator', permissions: DEFAULT_ROLE_PERMISSIONS.content_creator, isBuiltIn: true },
    moderator: { label: 'Moderator', permissions: DEFAULT_ROLE_PERMISSIONS.moderator, isBuiltIn: true },
    instructor: { label: 'Instructor', permissions: DEFAULT_ROLE_PERMISSIONS.instructor, isBuiltIn: true },
    student: { label: 'Student', permissions: DEFAULT_ROLE_PERMISSIONS.student, isBuiltIn: true },
  };

  const custom = loadRBACConfig();
  if (custom) {
    // Merge custom overrides
    for (const [key, val] of Object.entries(custom.roles)) {
      if (builtIn[key]) {
        builtIn[key].permissions = val.permissions; // override built-in permissions
      } else {
        builtIn[key] = { label: val.label, permissions: val.permissions, isBuiltIn: false }; // custom role
      }
    }
  }

  return builtIn;
}

// Core permission check
export function hasPermission(role: UserRole | string | null, permission: Permission): boolean {
  if (!role) return false;
  // super_admin always has all permissions (cannot be restricted)
  if (role === 'super_admin') return true;
  const perms = getRolePermissions(role);
  return perms.includes(permission);
}

export function hasAnyPermission(role: UserRole | string | null, permissions: Permission[]): boolean {
  return permissions.some(p => hasPermission(role, p));
}

export function getPermissions(role: UserRole | string | null): Permission[] {
  if (!role) return [];
  if (role === 'super_admin') return getAllPermissions();
  return getRolePermissions(role);
}

// RBAC management functions (for admin UI)
export function updateRolePermissions(roleKey: string, permissions: Permission[]): void {
  const config = loadRBACConfig() || { roles: {} };
  const existing = config.roles[roleKey] || { label: roleKey, permissions: [] };
  config.roles[roleKey] = { ...existing, permissions };
  saveRBACConfig(config);
}

export function createCustomRole(key: string, label: string, permissions: Permission[]): void {
  const config = loadRBACConfig() || { roles: {} };
  config.roles[key] = { label, permissions, isCustom: true, createdAt: Date.now() };
  saveRBACConfig(config);
}

export function deleteCustomRole(key: string): boolean {
  const config = loadRBACConfig();
  if (!config?.roles[key]?.isCustom) return false; // can't delete built-in
  delete config.roles[key];
  saveRBACConfig(config);
  return true;
}

// Privilege escalation prevention
export function canAssignRole(assignerRole: UserRole | string | null, targetRole: string): boolean {
  if (!assignerRole) return false;
  if (assignerRole === 'super_admin') return true;
  // Non-super_admin cannot assign super_admin role
  if (targetRole === 'super_admin') return false;
  // Must have roles.manage permission
  return hasPermission(assignerRole, 'roles.manage');
}

export function canEditUserPermissions(editorRole: UserRole | string | null): boolean {
  if (!editorRole) return false;
  return hasPermission(editorRole, 'permissions.manage');
}
