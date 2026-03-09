import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User as FirebaseUser } from 'firebase/auth';
import { User, UserRole } from '../types';
import { onAuthChange, getUserProfile, signIn, signUp, signOutUser } from '../services/authService';
import { isFirebaseConfigured } from '../services/firebase';
import { localSignIn, localSignUp, initDefaultAdmin, getLocalUserProfile } from '../services/localAuthService';

const LOCAL_SESSION_KEY = 'elite_academy_session';

interface AuthContextType {
  firebaseUser: FirebaseUser | null;
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  signInUser: (email: string, password: string) => Promise<void>;
  signUpUser: (email: string, password: string, displayName: string, role?: UserRole, extra?: { phone?: string; country?: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Restore session from localStorage for local auth
  useEffect(() => {
    if (!isFirebaseConfigured) {
      initDefaultAdmin().then(() => {
        const sessionUserId = localStorage.getItem(LOCAL_SESSION_KEY);
        // Also check legacy sessionStorage
        const legacyAuth = sessionStorage.getItem('elite_dashboard_auth');

        if (sessionUserId) {
          const profile = getLocalUserProfile(sessionUserId);
          if (profile && profile.isActive) {
            setUser(profile);
          } else {
            localStorage.removeItem(LOCAL_SESSION_KEY);
          }
        } else if (legacyAuth === 'true') {
          // Migrate legacy session to new system
          const profile = getLocalUserProfile('local-admin');
          if (profile) {
            setUser(profile);
            localStorage.setItem(LOCAL_SESSION_KEY, profile.id);
          }
          sessionStorage.removeItem('elite_dashboard_auth');
        }
        setLoading(false);
      });
      return;
    }

    const unsub = onAuthChange(async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        const profile = await getUserProfile(fbUser.uid);
        setUser(profile);
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsub;
  }, []);

  const signInUser = async (email: string, password: string) => {
    if (!isFirebaseConfigured) {
      const loggedInUser = await localSignIn(email, password);
      localStorage.setItem(LOCAL_SESSION_KEY, loggedInUser.id);
      setUser(loggedInUser);
      return;
    }
    await signIn(email, password);
  };

  const signUpUser = async (
    email: string,
    password: string,
    displayName: string,
    role: UserRole = 'student',
    extra?: { phone?: string; country?: string }
  ) => {
    if (!isFirebaseConfigured) {
      const newUser = await localSignUp(email, password, displayName, role, extra);
      localStorage.setItem(LOCAL_SESSION_KEY, newUser.id);
      setUser(newUser);
      return;
    }
    await signUp(email, password, displayName, role, extra);
  };

  const logout = async () => {
    if (!isFirebaseConfigured) {
      localStorage.removeItem(LOCAL_SESSION_KEY);
      sessionStorage.removeItem('elite_dashboard_auth');
      setUser(null);
      return;
    }
    await signOutUser();
    setUser(null);
  };

  // Refresh user profile from storage (useful after role/status changes)
  const refreshUser = () => {
    if (!isFirebaseConfigured && user) {
      const profile = getLocalUserProfile(user.id);
      if (profile && profile.isActive) {
        setUser(profile);
      } else if (profile && !profile.isActive) {
        // User was deactivated — force logout
        localStorage.removeItem(LOCAL_SESSION_KEY);
        setUser(null);
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        firebaseUser,
        user,
        userRole: user?.role ?? null,
        loading,
        isAuthenticated: !!user,
        signInUser,
        signUpUser,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
