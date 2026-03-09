import { User, UserRole } from '../types';

const STORAGE_KEY = 'elite_academy_user_accounts';

interface UserAccount {
  id: string;
  email: string;
  displayName: string;
  passwordHash: string;
  role: UserRole;
  phone?: string;
  country?: string;
  isActive: boolean;
  createdAt: number;
  updatedAt: number;
  lastLogin?: number;
}

function getAccounts(): UserAccount[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch { /* ignore */ }
  return [];
}

function saveAccounts(accounts: UserAccount[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

// Simple hash using SubtleCrypto (SHA-256)
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + '_elite_salt_2026');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Initialize with default super_admin if no accounts exist
export function ensureDefaultAdmin(): void {
  const accounts = getAccounts();
  if (accounts.length === 0) {
    // Create default admin account synchronously-style using the known hash
    // For "Elite@2026" with salt "_elite_salt_2026"
    // We'll create it on first use via async init
    return;
  }
}

export async function initDefaultAdmin(): Promise<void> {
  const accounts = getAccounts();
  const hasAdmin = accounts.some(a => a.role === 'super_admin' || a.email === 'admin@elitelearning.com');
  if (!hasAdmin) {
    const legacyPassword = import.meta.env.VITE_ADMIN_PASSWORD || 'Elite@2026';
    const hash = await hashPassword(legacyPassword);
    const adminAccount: UserAccount = {
      id: 'local-admin',
      email: 'admin@elitelearning.com',
      displayName: 'Admin',
      passwordHash: hash,
      role: 'super_admin',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    saveAccounts([...accounts, adminAccount]);
  }
}

export async function localSignIn(emailOrUsername: string, password: string): Promise<User> {
  await initDefaultAdmin();
  const accounts = getAccounts();
  const hash = await hashPassword(password);

  // Support login by email or by "admin" username (legacy compat)
  const account = accounts.find(a =>
    (a.email.toLowerCase() === emailOrUsername.toLowerCase() ||
     (emailOrUsername === 'admin' && a.id === 'local-admin')) &&
    a.passwordHash === hash
  );

  if (!account) {
    throw new Error('Invalid credentials');
  }

  if (!account.isActive) {
    throw new Error('Account is deactivated. Contact an administrator.');
  }

  // Update last login
  account.lastLogin = Date.now();
  saveAccounts(accounts);

  return accountToUser(account);
}

export async function localSignUp(
  email: string,
  password: string,
  displayName: string,
  role: UserRole = 'student',
  extra?: { phone?: string; country?: string }
): Promise<User> {
  await initDefaultAdmin();
  const accounts = getAccounts();

  // Check if email already exists
  if (accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) {
    const err = new Error('This email is already registered');
    (err as any).code = 'auth/email-already-in-use';
    throw err;
  }

  const hash = await hashPassword(password);
  const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const account: UserAccount = {
    id,
    email,
    displayName,
    passwordHash: hash,
    role,
    phone: extra?.phone,
    country: extra?.country,
    isActive: true,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastLogin: Date.now(),
  };

  saveAccounts([...accounts, account]);
  return accountToUser(account);
}

// Create a user account from the admin panel (with password)
export async function createUserAccount(
  email: string,
  password: string,
  displayName: string,
  role: UserRole,
  isActive: boolean = true,
  extra?: { phone?: string; country?: string }
): Promise<User> {
  const accounts = getAccounts();

  if (accounts.some(a => a.email.toLowerCase() === email.toLowerCase())) {
    throw new Error('A user with this email already exists');
  }

  const hash = await hashPassword(password);
  const id = `user_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

  const account: UserAccount = {
    id,
    email,
    displayName,
    passwordHash: hash,
    role,
    phone: extra?.phone,
    country: extra?.country,
    isActive,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  saveAccounts([...accounts, account]);
  return accountToUser(account);
}

// Update user account (role, active status, etc.) — syncs with auth
export async function updateUserAccount(id: string, data: {
  role?: UserRole;
  isActive?: boolean;
  displayName?: string;
  email?: string;
  phone?: string;
  country?: string;
}): Promise<void> {
  const accounts = getAccounts();
  const idx = accounts.findIndex(a => a.id === id);
  if (idx === -1) return; // User might not have an auth account (legacy)

  if (data.email && data.email !== accounts[idx].email) {
    // Check email uniqueness
    if (accounts.some((a, i) => i !== idx && a.email.toLowerCase() === data.email!.toLowerCase())) {
      throw new Error('A user with this email already exists');
    }
  }

  accounts[idx] = { ...accounts[idx], ...data, updatedAt: Date.now() };
  saveAccounts(accounts);
}

// Reset a user's password (admin action)
export async function resetUserPassword(id: string, newPassword: string): Promise<void> {
  const accounts = getAccounts();
  const idx = accounts.findIndex(a => a.id === id);
  if (idx === -1) throw new Error('User not found');

  accounts[idx].passwordHash = await hashPassword(newPassword);
  accounts[idx].updatedAt = Date.now();
  saveAccounts(accounts);
}

// Delete a user account
export function deleteUserAccount(id: string): void {
  const accounts = getAccounts();
  saveAccounts(accounts.filter(a => a.id !== id));
}

// Get a user profile by ID from local accounts
export function getLocalUserProfile(id: string): User | null {
  const accounts = getAccounts();
  const account = accounts.find(a => a.id === id);
  return account ? accountToUser(account) : null;
}

// Get all local user accounts (without password hashes)
export function getAllLocalUsers(): User[] {
  return getAccounts().map(accountToUser);
}

function accountToUser(account: UserAccount): User {
  return {
    id: account.id,
    email: account.email,
    displayName: account.displayName,
    role: account.role,
    phone: account.phone,
    country: account.country,
    isActive: account.isActive,
    createdAt: account.createdAt,
    updatedAt: account.updatedAt,
    lastLogin: account.lastLogin,
  };
}
