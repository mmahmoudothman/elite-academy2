import {
  getAuth,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
  type Auth,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db, isFirebaseConfigured } from './firebase';
import { User, UserRole } from '../types';

let auth: Auth | null = null;

function getAuthInstance(): Auth {
  if (!auth) {
    if (!isFirebaseConfigured) {
      throw new Error('Firebase is not configured');
    }
    auth = getAuth();
  }
  return auth;
}

export { getAuthInstance as getAuthSafe };

export async function signIn(email: string, password: string): Promise<FirebaseUser> {
  const a = getAuthInstance();
  const result = await signInWithEmailAndPassword(a, email, password);
  await setDoc(doc(db, 'users', result.user.uid), { lastLogin: Date.now() }, { merge: true });
  return result.user;
}

export async function signUp(
  email: string,
  password: string,
  displayName: string,
  role: UserRole = 'student',
  extra?: { phone?: string; country?: string }
): Promise<FirebaseUser> {
  const a = getAuthInstance();
  const result = await createUserWithEmailAndPassword(a, email, password);
  await updateProfile(result.user, { displayName });

  const userData: Omit<User, 'id'> = {
    email,
    displayName,
    role,
    phone: extra?.phone || '',
    country: extra?.country || '',
    avatar: '',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    lastLogin: Date.now(),
    isActive: true,
  };

  await setDoc(doc(db, 'users', result.user.uid), userData);
  return result.user;
}

export async function signOutUser(): Promise<void> {
  const a = getAuthInstance();
  await firebaseSignOut(a);
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  if (!isFirebaseConfigured) {
    // No Firebase — immediately call back with null and return a no-op unsubscribe
    callback(null);
    return () => {};
  }
  const a = getAuthInstance();
  return onAuthStateChanged(a, callback);
}

export async function getUserProfile(uid: string): Promise<User | null> {
  const snap = await getDoc(doc(db, 'users', uid));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as User;
}

export async function updateUserProfile(uid: string, data: Partial<User>): Promise<void> {
  await setDoc(doc(db, 'users', uid), { ...data, updatedAt: Date.now() }, { merge: true });
}
