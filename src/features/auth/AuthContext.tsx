import { createContext, useContext, useMemo, useState } from 'react';

import type { AuthRole, AuthUser } from './types';

interface AuthContextValue {
  user: AuthUser | null;
  loginAs: (role: AuthRole) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const STORAGE_KEY = 'school-portal-auth';

const defaultAdmin: AuthUser = { id: 'u-admin', name: 'G. Milla', role: 'Admin' };

const loadFromStorage = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
};

const saveToStorage = (user: AuthUser | null) => {
  try {
    if (!user) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore
  }
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(() => loadFromStorage() ?? defaultAdmin);

  const loginAs = (role: AuthRole) => {
    const next: AuthUser =
      role === 'Admin'
        ? defaultAdmin
        : role === 'Teacher'
          ? { id: 'u-teacher', name: 'Robin Buckley', role: 'Teacher' }
          : { id: 'u-staff', name: 'Sam Calder', role: 'Staff' };

    setUser(next);
    saveToStorage(next);
  };

  const logout = () => {
    setUser(null);
    saveToStorage(null);
  };

  const value = useMemo(() => ({ user, loginAs, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
