import React, { useState, useEffect, useCallback } from 'react';
import { useLanguage } from '../LanguageContext';
import {
  PERMISSION_MODULES,
  Permission,
  getAllRoles,
  getAllPermissions,
  updateRolePermissions,
  createCustomRole,
  deleteCustomRole,
} from '../../utils/permissions';
import toast from 'react-hot-toast';

type RoleEntry = { label: string; permissions: Permission[]; isCustom?: boolean; isBuiltIn?: boolean };

function formatPermission(perm: string): string {
  const parts = perm.split('.');
  const action = parts[parts.length - 1];
  const resource = parts.slice(0, -1).join(' ');
  return `${action.charAt(0).toUpperCase() + action.slice(1).replace(/_/g, ' ')} ${resource}`;
}

const ROLE_KEY_REGEX = /^[a-z][a-z0-9_]*$/;

const ChevronIcon: React.FC<{ open: boolean }> = ({ open }) => (
  <svg
    className={`w-4 h-4 text-slate-400 transition-transform ${open ? 'rotate-90' : ''}`}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

interface PermissionEditorProps {
  permissions: Permission[];
  onChange: (perms: Permission[]) => void;
  disabled?: boolean;
  disabledLabel?: string;
}

const PermissionEditor: React.FC<PermissionEditorProps> = ({ permissions, onChange, disabled, disabledLabel }) => {
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});

  const toggleModule = (key: string) => {
    setExpandedModules(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const isPermChecked = (perm: string) => permissions.includes(perm as Permission);

  const togglePerm = (perm: string) => {
    if (disabled) return;
    const p = perm as Permission;
    if (permissions.includes(p)) {
      onChange(permissions.filter(x => x !== p));
    } else {
      onChange([...permissions, p]);
    }
  };

  const toggleAllInModule = (modulePerms: readonly string[]) => {
    if (disabled) return;
    const allSelected = modulePerms.every(p => permissions.includes(p as Permission));
    if (allSelected) {
      onChange(permissions.filter(p => !modulePerms.includes(p)));
    } else {
      const merged = new Set([...permissions, ...modulePerms.map(p => p as Permission)]);
      onChange([...merged]);
    }
  };

  return (
    <div className="space-y-2">
      {Object.entries(PERMISSION_MODULES).map(([key, mod]) => {
        const isOpen = expandedModules[key] ?? false;
        const selectedCount = mod.permissions.filter(p => permissions.includes(p as Permission)).length;
        const allSelected = selectedCount === mod.permissions.length;

        return (
          <div key={key} className="border border-slate-100 rounded-xl overflow-hidden">
            <button
              type="button"
              onClick={() => toggleModule(key)}
              className="w-full flex items-center justify-between px-4 py-3 bg-slate-50/50 hover:bg-slate-50 transition-colors"
            >
              <div className="flex items-center gap-2">
                <ChevronIcon open={isOpen} />
                <span className="text-sm font-bold text-slate-800">{mod.label}</span>
                <span className="text-[10px] font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                  {selectedCount}/{mod.permissions.length}
                </span>
              </div>
              {!disabled && (
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    toggleAllInModule(mod.permissions);
                  }}
                  className="text-[10px] font-black uppercase tracking-wider text-teal-600 hover:text-teal-700 transition-colors"
                >
                  {allSelected ? 'Deselect All' : 'Select All'}
                </button>
              )}
            </button>
            {isOpen && (
              <div className="px-4 py-3 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-slate-100">
                {mod.permissions.map(perm => (
                  <label
                    key={perm}
                    className={`flex items-center gap-2.5 py-1 ${disabled ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <input
                      type="checkbox"
                      checked={isPermChecked(perm)}
                      onChange={() => togglePerm(perm)}
                      disabled={disabled}
                      className="w-4 h-4 rounded border-slate-300 text-teal-600 focus:ring-teal-500 disabled:opacity-50"
                    />
                    <span className={`text-xs font-bold ${disabled ? 'text-slate-400' : 'text-slate-600'}`}>
                      {formatPermission(perm)}
                      {disabled && disabledLabel && (
                        <span className="text-[10px] text-slate-300 ms-1">{disabledLabel}</span>
                      )}
                    </span>
                  </label>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const RoleManagement: React.FC = () => {
  const { t } = useLanguage();
  const [roles, setRoles] = useState<Record<string, RoleEntry>>(getAllRoles());
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [editingPermissions, setEditingPermissions] = useState<Permission[]>([]);
  const [createMode, setCreateMode] = useState(false);
  const [newRoleKey, setNewRoleKey] = useState('');
  const [newRoleLabel, setNewRoleLabel] = useState('');
  const [newRolePermissions, setNewRolePermissions] = useState<Permission[]>([]);
  const [saving, setSaving] = useState(false);
  const [keyError, setKeyError] = useState('');

  const refreshRoles = useCallback(() => {
    setRoles(getAllRoles());
  }, []);

  // Sync editingPermissions when a role is selected
  useEffect(() => {
    if (selectedRole && roles[selectedRole]) {
      setEditingPermissions([...roles[selectedRole].permissions]);
    }
  }, [selectedRole, roles]);

  const handleSelectRole = (key: string) => {
    setCreateMode(false);
    setSelectedRole(key);
  };

  const handleSavePermissions = () => {
    if (!selectedRole || selectedRole === 'super_admin') return;
    setSaving(true);
    try {
      updateRolePermissions(selectedRole, editingPermissions);
      refreshRoles();
      toast.success(t.dashboard?.permissions_saved || 'Permissions updated successfully');
    } catch {
      toast.error(t.dashboard?.permissions_error || 'Failed to update permissions');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRole = (key: string) => {
    if (!confirm(t.dashboard?.confirm_delete_role || `Are you sure you want to delete the role "${key}"?`)) return;
    const success = deleteCustomRole(key);
    if (success) {
      refreshRoles();
      if (selectedRole === key) {
        setSelectedRole(null);
        setEditingPermissions([]);
      }
      toast.success(t.dashboard?.role_deleted || 'Role deleted successfully');
    } else {
      toast.error(t.dashboard?.role_delete_error || 'Cannot delete built-in roles');
    }
  };

  const validateNewRoleKey = (key: string) => {
    if (!key) {
      setKeyError('');
      return;
    }
    if (!ROLE_KEY_REGEX.test(key)) {
      setKeyError('Must be lowercase letters, numbers, and underscores only. Must start with a letter.');
      return;
    }
    if (roles[key]) {
      setKeyError('A role with this key already exists.');
      return;
    }
    setKeyError('');
  };

  const handleCreateRole = () => {
    if (!newRoleKey || !newRoleLabel) {
      toast.error(t.dashboard?.role_fields_required || 'Role key and label are required');
      return;
    }
    if (!ROLE_KEY_REGEX.test(newRoleKey)) {
      toast.error(t.dashboard?.role_key_invalid || 'Role key must be lowercase letters, numbers, and underscores only');
      return;
    }
    if (roles[newRoleKey]) {
      toast.error(t.dashboard?.role_exists || 'A role with this key already exists');
      return;
    }

    setSaving(true);
    try {
      createCustomRole(newRoleKey, newRoleLabel, newRolePermissions);
      refreshRoles();
      setCreateMode(false);
      setNewRoleKey('');
      setNewRoleLabel('');
      setNewRolePermissions([]);
      setSelectedRole(newRoleKey);
      toast.success(t.dashboard?.role_created || 'Custom role created successfully');
    } catch {
      toast.error(t.dashboard?.role_create_error || 'Failed to create role');
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    'w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 focus:border-teal-500 focus:bg-white outline-none transition-all text-slate-900 font-bold text-sm';
  const labelClass = 'block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1.5';

  const selectedRoleData = selectedRole ? roles[selectedRole] : null;
  const isSuperAdmin = selectedRole === 'super_admin';
  const allPermissions = getAllPermissions();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-black text-slate-900">
          {t.dashboard?.role_management || 'Role Management'}
        </h3>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Left panel: Role list */}
        <div className="w-full lg:w-80 flex-shrink-0 space-y-3">
          {Object.entries(roles).map(([key, role]) => {
            const isSelected = selectedRole === key && !createMode;
            return (
              <button
                key={key}
                type="button"
                onClick={() => handleSelectRole(key)}
                className={`w-full text-start bg-white rounded-2xl border p-4 transition-all hover:shadow-sm ${
                  isSelected ? 'border-teal-500 ring-2 ring-teal-500/20' : 'border-slate-100'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-black text-slate-900">{role.label}</span>
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      role.isBuiltIn !== false
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {role.isBuiltIn !== false ? 'Built-in' : 'Custom'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400">
                    {key === 'super_admin'
                      ? `${allPermissions.length} permissions (all)`
                      : `${role.permissions.length} permission${role.permissions.length !== 1 ? 's' : ''}`}
                  </span>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-teal-500" />
                  )}
                </div>
              </button>
            );
          })}

          {/* Create New Role Button */}
          <button
            type="button"
            onClick={() => {
              setSelectedRole(null);
              setCreateMode(true);
              setNewRoleKey('');
              setNewRoleLabel('');
              setNewRolePermissions([]);
              setKeyError('');
            }}
            className={`w-full text-center rounded-2xl border-2 border-dashed p-4 transition-all hover:border-teal-400 hover:bg-teal-50/30 ${
              createMode ? 'border-teal-500 bg-teal-50/30' : 'border-slate-200'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-sm font-bold text-teal-600">
                {t.dashboard?.create_role || 'Create New Role'}
              </span>
            </div>
          </button>
        </div>

        {/* Right panel: Permission editor or Create form */}
        <div className="flex-1 min-w-0">
          {/* Create Mode */}
          {createMode && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-5">
              <h4 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-3">
                {t.dashboard?.create_custom_role || 'Create Custom Role'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelClass}>
                    {t.dashboard?.role_key || 'Role Key'}
                  </label>
                  <input
                    value={newRoleKey}
                    onChange={e => {
                      const val = e.target.value.toLowerCase().replace(/\s/g, '_');
                      setNewRoleKey(val);
                      validateNewRoleKey(val);
                    }}
                    placeholder="e.g. content_reviewer"
                    className={`${inputClass} ${keyError ? 'border-red-300 focus:border-red-500' : ''}`}
                  />
                  {keyError && (
                    <p className="text-[10px] text-red-500 font-bold mt-1">{keyError}</p>
                  )}
                  <p className="text-[10px] text-slate-400 mt-1">
                    Lowercase letters, numbers, and underscores only
                  </p>
                </div>
                <div>
                  <label className={labelClass}>
                    {t.dashboard?.role_label || 'Display Name'}
                  </label>
                  <input
                    value={newRoleLabel}
                    onChange={e => setNewRoleLabel(e.target.value)}
                    placeholder="e.g. Content Reviewer"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className={labelClass}>
                  {t.dashboard?.select_permissions || 'Permissions'}
                </label>
                <PermissionEditor
                  permissions={newRolePermissions}
                  onChange={setNewRolePermissions}
                />
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCreateMode(false)}
                  className="px-5 py-2.5 text-sm font-bold text-slate-500 hover:text-slate-700 transition-colors"
                >
                  {t.dashboard?.cancel || 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleCreateRole}
                  disabled={saving || !newRoleKey || !newRoleLabel || !!keyError}
                  className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all flex items-center gap-2 disabled:opacity-60"
                >
                  {saving && (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  )}
                  {saving
                    ? (t.dashboard?.creating || 'Creating...')
                    : (t.dashboard?.create_role || 'Create Role')}
                </button>
              </div>
            </div>
          )}

          {/* Edit Mode */}
          {selectedRoleData && !createMode && (
            <div className="bg-white rounded-2xl border border-slate-100 p-5 sm:p-6 space-y-5">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div>
                  <h4 className="text-sm font-black text-slate-900">
                    {selectedRoleData.label}
                  </h4>
                  <span className="text-[10px] font-bold text-slate-400">{selectedRole}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${
                      selectedRoleData.isBuiltIn !== false
                        ? 'bg-blue-50 text-blue-600'
                        : 'bg-amber-50 text-amber-600'
                    }`}
                  >
                    {selectedRoleData.isBuiltIn !== false ? 'Built-in' : 'Custom'}
                  </span>
                </div>
              </div>

              {isSuperAdmin && (
                <div className="bg-purple-50 border border-purple-100 rounded-xl px-4 py-3">
                  <p className="text-xs font-bold text-purple-700">
                    {t.dashboard?.super_admin_note ||
                      'Super Admin always has all permissions. These cannot be modified.'}
                  </p>
                </div>
              )}

              <div>
                <label className={labelClass}>
                  {t.dashboard?.permissions_label || 'Permissions'}{' '}
                  <span className="text-slate-300">
                    ({isSuperAdmin ? allPermissions.length : editingPermissions.length}/{allPermissions.length})
                  </span>
                </label>
                <PermissionEditor
                  permissions={isSuperAdmin ? allPermissions : editingPermissions}
                  onChange={setEditingPermissions}
                  disabled={isSuperAdmin}
                  disabledLabel={isSuperAdmin ? '(Always granted)' : undefined}
                />
              </div>

              {!isSuperAdmin && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <div>
                    {selectedRoleData.isBuiltIn === false && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRole(selectedRole!)}
                        className="px-5 py-2.5 text-sm font-bold text-red-500 hover:text-red-700 hover:bg-red-50 rounded-xl transition-all"
                      >
                        {t.dashboard?.delete_role || 'Delete Role'}
                      </button>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSavePermissions}
                    disabled={saving}
                    className="px-6 py-2.5 bg-teal-600 text-white rounded-xl font-bold text-sm hover:bg-teal-700 transition-all flex items-center gap-2 disabled:opacity-60"
                  >
                    {saving && (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    )}
                    {saving
                      ? (t.dashboard?.saving || 'Saving...')
                      : (t.dashboard?.save || 'Save Changes')}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Empty state */}
          {!selectedRole && !createMode && (
            <div className="bg-white rounded-2xl border border-slate-100 p-12 flex flex-col items-center justify-center text-center">
              <svg
                className="w-12 h-12 text-slate-200 mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              <p className="text-sm font-bold text-slate-400">
                {t.dashboard?.select_role_prompt || 'Select a role to view and edit its permissions'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RoleManagement;
