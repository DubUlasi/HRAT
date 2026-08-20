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
  // `users` is the mutable, in-memory roster (profile edits/password changes write here) —
  // seeded from the static mockUsers import but, like ComplaintsContext's own `complaints`
  // state, not itself persisted, so it resets to the seed data on a full page reload (same
  // "resets on refresh" tradeoff already accepted everywhere else in this mock app). The
  // logged-in `user` snapshot below IS persisted, so staying logged in across a refresh still
  // reflects any edits made this session — it's only a fresh login after a reload that would see
  // the reset roster.
  const [users, setUsers] = useState(mockUsers);
  const [user, setUser] = useState(loadStoredUser);

  const login = useCallback((email, password) => {
    const match = users.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
    );
    if (!match) return null;
    setUser(match);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
    return match;
  }, [users]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Shared by updateProfile/changePassword/resetPassword — keeps the roster and, when it's the
  // currently signed-in person, the live session (and its localStorage snapshot) in sync in one
  // place instead of three call sites each doing their own setUser/localStorage dance.
  const updateUser = useCallback((userId, patch) => {
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...patch } : u)));
    setUser((prev) => {
      if (!prev || prev.id !== userId) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const updateProfile = useCallback((patch) => {
    if (!user) return;
    updateUser(user.id, patch);
  }, [user, updateUser]);

  const changePassword = useCallback((currentPassword, newPassword) => {
    if (!user) return { ok: false, error: 'You need to be signed in to change your password.' };
    if (user.password !== currentPassword) return { ok: false, error: 'Current password is incorrect.' };
    updateUser(user.id, { password: newPassword });
    return { ok: true };
  }, [user, updateUser]);

  const findUserByEmail = useCallback(
    (email) => users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase()) || null,
    [users]
  );

  // There's no real backend here to send an email from, so rather than a dead-end "check your
  // inbox" message this looks the account up directly and lets the password be reset once
  // found — same end result as clicking a reset link, without a link that could never actually
  // be delivered.
  const resetPassword = useCallback((email, newPassword) => {
    const match = findUserByEmail(email);
    if (!match) return { ok: false, error: 'No account found with that email address.' };
    updateUser(match.id, { password: newPassword });
    return { ok: true };
  }, [findUserByEmail, updateUser]);

  const value = useMemo(() => ({
    user,
    isAuthenticated: !!user,
    login,
    logout,
    updateProfile,
    changePassword,
    findUserByEmail,
    resetPassword,
  }), [user, login, logout, updateProfile, changePassword, findUserByEmail, resetPassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
