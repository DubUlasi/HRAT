import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { mockUsers } from '../data/mockUsers';

const AuthContext = createContext(null);
const STORAGE_KEY = 'hrat-auth-user';

function loadStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

// Mock-only auth (no backend, no real security) — stands in for a session so every write
// elsewhere in the app (ComplaintsContext's activity-log `actor`, each role's "assigned to me"
// queue filters) can attribute actions to whichever demo account is currently logged in,
// instead of one hardcoded person.
export function AuthProvider({ children }) {
  const [user, setUser] = useState(loadStoredUser);

  const login = useCallback((email, password) => {
    const match = mockUsers.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!match) return null;
    setUser(match);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
    return match;
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout,
  }), [user, login, logout]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
