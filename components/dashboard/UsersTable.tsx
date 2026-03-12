import React, { useState, useMemo } from 'react';
import { User, UserRole } from '../../types';
import { useLanguage } from '../LanguageContext';

interface UsersTableProps {
  users: User[];
  onToggleActive?: (user: User) => void;
  onChangeRole?: (id: string, role: UserRole) => void;
  onCreateUser?: (data: Omit<User, 'id'> & { password: string }) => void;
  onDeleteUser?: (user: User) => void;
  onResetPassword?: (userId: string, newPassword: string) => void;
}

const ROLE_COLORS: Record<UserRole, string> = {
  super_admin: 'bg-purple-100 text-purple-700',
  admin: 'bg-blue-100 text-blue-700',
  content_creator: 'bg-cyan-100 text-cyan-700',
  moderator: 'bg-orange-100 text-orange-700',
  instructor: 'bg-amber-100 text-amber-700',
  student: 'bg-slate-100 text-slate-500',
};

const ROLES: UserRole[] = ['super_admin', 'admin', 'content_creator', 'moderator', 'instructor', 'student'];

const UsersTable: React.FC<UsersTableProps> = ({ users, onToggleActive, onChangeRole, onCreateUser, onDeleteUser, onResetPassword }) => {
  const { t, language } = useLanguage();
  const d = t.dashboard;
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(0);
  const pageSize = 10;

  // Create user form state
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newRole, setNewRole] = useState<UserRole>('student');
  const [newIsActive, setNewIsActive] = useState(true);
  const [createError, setCreateError] = useState('');

  // Delete confirmation state
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Reset password state
  const [resetPasswordId, setResetPasswordId] = useState<string | null>(null);
  const [resetPasswordValue, setResetPasswordValue] = useState('');

  const roleLabels: Record<UserRole, string> = {
    super_admin: d.role_super_admin, admin: d.role_admin, content_creator: d.role_content_creator,
    moderator: d.role_moderator, instructor: d.role_instructor, student: d.role_student,
  };

  const formatRole = (role: UserRole) => roleLabels[role] || role;

  const handleCreateUser = () => {
    if (!newDisplayName.trim() || !newEmail.trim() || !newPassword.trim() || !onCreateUser) return;
    if (newPassword.length < 6) {
      setCreateError(d.password_min);
      return;
    }
    setCreateError('');
    const now = Date.now();
    onCreateUser({
      email: newEmail.trim(),
      displayName: newDisplayName.trim(),
      role: newRole,
      isActive: newIsActive,
      createdAt: now,
      updatedAt: now,
      password: newPassword,
    });
    setNewDisplayName('');
    setNewEmail('');
    setNewPassword('');
    setNewRole('student');
    setNewIsActive(true);
    setShowCreateForm(false);
  };

  const handleDeleteUser = (user: User) => {
    if (!onDeleteUser) return;
    onDeleteUser(user);
    setDeleteConfirmId(null);
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return users.filter(u => {
      const matchSearch =
        u.displayName.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q);
      const matchRole = !roleFilter || u.role === roleFilter;
      const matchStatus =
        !statusFilter ||
        (statusFilter === 'active' && u.isActive) ||
        (statusFilter === 'inactive' && !u.isActive);
      return matchSearch && matchRole && matchStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const paged = filtered.slice(page * pageSize, (page + 1) * pageSize);
  const totalPages = Math.ceil(filtered.length / pageSize);

  const dateLocale = language === 'ar' ? 'ar-EG' : 'en-US';

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      {/* Header with search */}
      <div className="p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-100">
        <h3 className="text-lg font-black text-slate-900">{d.users_tab}</h3>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <input
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(0); }}
            placeholder={d.search_users}
            className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
          />
          {onCreateUser && (
            <button
              onClick={() => setShowCreateForm(v => !v)}
              className="flex-shrink-0 bg-teal-600 hover:bg-teal-700 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="hidden sm:inline">{d.create_user}</span>
            </button>
          )}
        </div>
      </div>

      {/* Create User Form */}
      {showCreateForm && onCreateUser && (
        <div className="p-4 sm:p-6 border-b border-slate-100 bg-teal-50/30">
          <h4 className="text-sm font-black text-slate-800 mb-3">{d.create_user}</h4>
          {createError && (
            <div className="mb-3 flex items-center gap-2 text-xs font-bold text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
              </svg>
              {createError}
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.display_name}</label>
              <input
                type="text"
                value={newDisplayName}
                onChange={e => setNewDisplayName(e.target.value)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.email}</label>
              <input
                type="email"
                value={newEmail}
                onChange={e => setNewEmail(e.target.value)}
                placeholder="email@example.com"
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.password}</label>
              <input
                type="password"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                placeholder={d.password_min}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.col_role}</label>
              <select
                value={newRole}
                onChange={e => setNewRole(e.target.value as UserRole)}
                className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                {ROLES.map(r => (
                  <option key={r} value={r}>{formatRole(r)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{d.status}</label>
              <button
                type="button"
                onClick={() => setNewIsActive(v => !v)}
                className={`w-full flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-bold border transition-colors ${
                  newIsActive
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                    : 'bg-slate-50 border-slate-200 text-slate-500'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${newIsActive ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                {newIsActive ? d.active : d.inactive}
              </button>
            </div>
          </div>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleCreateUser}
              disabled={!newDisplayName.trim() || !newEmail.trim() || !newPassword.trim()}
              className="bg-teal-600 hover:bg-teal-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold px-5 py-2 rounded-lg transition-colors"
            >
              {d.create}
            </button>
            <button
              onClick={() => setShowCreateForm(false)}
              className="text-sm font-bold text-slate-500 hover:text-slate-700 px-4 py-2 transition-colors"
            >
              {d.cancel}
            </button>
          </div>
        </div>
      )}

      {/* Filter Bar */}
      <div className="px-4 sm:px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-3">
        <select
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(0); }}
          className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">{d.all_roles}</option>
          {ROLES.map(r => (
            <option key={r} value={r}>{formatRole(r)}</option>
          ))}
        </select>
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(0); }}
          className="text-xs font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-teal-500"
        >
          <option value="">{d.all_status}</option>
          <option value="active">{d.active}</option>
          <option value="inactive">{d.inactive}</option>
        </select>

        <span className="text-xs font-bold text-slate-400 ms-auto">
          {d.showing} {filtered.length} {d.of} {users.length} {d.users_label}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr className="text-start">
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {d.col_name}
              </th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">
                {d.email}
              </th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {d.col_role}
              </th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {d.col_status}
              </th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                {d.joined}
              </th>
              <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden md:table-cell">
                {d.last_login}
              </th>
              {(onToggleActive || onChangeRole || onDeleteUser) && (
                <th className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
                  {d.col_actions}
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {paged.map(user => (
              <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-teal-50 rounded-full flex items-center justify-center text-teal-600 font-bold text-xs flex-shrink-0">
                      {user.displayName.charAt(0).toUpperCase()}
                    </div>
                    <span className="font-bold text-sm text-slate-900 truncate max-w-[150px]">
                      {user.displayName}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 truncate max-w-[180px] hidden sm:table-cell">
                  {user.email}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${ROLE_COLORS[user.role]}`}>
                    {formatRole(user.role)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-bold px-2 py-1 rounded-lg ${user.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                    {user.isActive ? d.active : d.inactive}
                  </span>
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: '2-digit' })}
                </td>
                <td className="px-4 py-3 text-xs text-slate-500 whitespace-nowrap hidden md:table-cell">
                  {user.lastLogin
                    ? new Date(user.lastLogin).toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: '2-digit' })
                    : d.never_logged_in}
                </td>
                {(onToggleActive || onChangeRole || onDeleteUser) && (
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {onToggleActive && (
                        <button
                          onClick={() => onToggleActive(user)}
                          className="text-slate-400 hover:text-slate-600 transition-colors"
                          title={user.isActive ? d.deactivate_user : d.activate_user}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d={user.isActive
                                ? 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636'
                                : 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z'}
                            />
                          </svg>
                        </button>
                      )}
                      {onChangeRole && (
                        <select
                          value={user.role}
                          onChange={e => onChangeRole(user.id, e.target.value as UserRole)}
                          className="text-[10px] font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
                        >
                          {ROLES.map(r => (
                            <option key={r} value={r}>{formatRole(r)}</option>
                          ))}
                        </select>
                      )}
                      {onResetPassword && (
                        resetPasswordId === user.id ? (
                          <div className="flex items-center gap-1">
                            <input
                              type="password"
                              value={resetPasswordValue}
                              onChange={e => setResetPasswordValue(e.target.value)}
                              placeholder={d.new_password}
                              className="w-24 text-[10px] font-bold bg-white border border-slate-200 rounded-lg px-2 py-1 focus:outline-none focus:ring-2 focus:ring-teal-500"
                              autoFocus
                            />
                            <button
                              onClick={() => {
                                if (resetPasswordValue.length >= 6) {
                                  onResetPassword(user.id, resetPasswordValue);
                                  setResetPasswordId(null);
                                  setResetPasswordValue('');
                                }
                              }}
                              disabled={resetPasswordValue.length < 6}
                              className="text-[10px] font-bold bg-teal-600 text-white px-2 py-1 rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-40"
                            >
                              {d.set_password}
                            </button>
                            <button
                              onClick={() => { setResetPasswordId(null); setResetPasswordValue(''); }}
                              className="text-[10px] font-bold text-slate-500 px-1 py-1 hover:text-slate-700 transition-colors"
                            >
                              X
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setResetPasswordId(user.id)}
                            className="text-slate-400 hover:text-teal-600 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                            </svg>
                          </button>
                        )
                      )}
                      {onDeleteUser && (
                        deleteConfirmId === user.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteUser(user)}
                              className="text-[10px] font-bold bg-red-600 text-white px-2 py-1 rounded-lg hover:bg-red-700 transition-colors"
                            >
                              {d.confirm}
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="text-[10px] font-bold text-slate-500 px-2 py-1 hover:text-slate-700 transition-colors"
                            >
                              {d.cancel}
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(user.id)}
                            className="text-slate-400 hover:text-red-500 transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        )
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">
            {d.showing} {page * pageSize + 1}-{Math.min((page + 1) * pageSize, filtered.length)} / {filtered.length}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-all"
            >
              {d.prev}
            </button>
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1}
              className="px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-200 disabled:opacity-40 hover:bg-slate-50 transition-all"
            >
              {d.next_page}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersTable;
