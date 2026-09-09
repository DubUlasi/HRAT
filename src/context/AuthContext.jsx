import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { mockUsers } from '../data/mockUsers';
import { ApiError } from '../api/client';
import { fetchCurrentUser, loginRequest, signUpRequest, normalizeApiUser } from '../api/authApi';

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

// Real auth now exists for Complainant (and any staff account actually provisioned on the real
// API) via an HTTP-only session cookie — see src/api/authApi.js. The other 10 roles have no
// backend yet, so they keep working exactly as before on the mock roster below; `login()` tries
// the real API first and only falls back to the mock check on genuine invalid-credentials (a
// network/server error is NOT swallowed here, so a real backend outage surfaces instead of
// silently masquerading as "wrong password").
export function AuthProvider({ children }) {
  // `users` is the mutable, in-memory MOCK roster (profile edits/password changes for a
  // mock-path account write here) — seeded from the static mockUsers import but, like
  // ComplaintsContext's own `complaints` state, not itself persisted, so it resets to the seed
  // data on a full page reload (same "resets on refresh" tradeoff already accepted everywhere
  // else in this mock app).
  const [users, setUsers] = useState(mockUsers);
  // Starts null/loading rather than synchronously reading localStorage — a real session lives in
  // an HTTP-only cookie the app can't read directly, so the only way to know if one exists is to
  // ask /auth/me and wait for the answer. `authLoading` gates RequireRole so it doesn't bounce a
  // real returning user to /login before that answer comes back.
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    // A mock-path session (no server cookie behind it) restores instantly from localStorage;
    // only fall through to asking the real API when there's no mock session to resume.
    const storedMockUser = loadStoredUser();
    if (storedMockUser) {
      setUser(storedMockUser);
      setAuthLoading(false);
      return;
    }
    fetchCurrentUser()
      .then((result) => setUser(normalizeApiUser(result)))
      .catch(() => setUser(null))
      .finally(() => setAuthLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    try {
      const result = await loginRequest(email, password);
      const normalized = normalizeApiUser(result);
      setUser(normalized);
      return normalized;
    } catch (err) {
      if (err instanceof ApiError && (err.status === 400 || err.status === 401)) {
        const match = users.find(
          (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
        );
        if (!match) return null;
        setUser(match);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(match));
        return match;
      }
      throw err;
    }
  }, [users]);

  // No sign-up-and-immediately-set-mock-role path here — sign-up only ever exists against the
  // real API (it always grants exactly the `complainant` role, per the endpoint's own contract).
  const signUp = useCallback(async (data) => {
    const result = await signUpRequest(data);
    const normalized = normalizeApiUser(result);
    setUser(normalized);
    return normalized;
  }, []);

  const logout = useCallback(() => {
    // No logout/session-invalidation endpoint exists on the real API yet (checked the full
    // spec — Authentication only has google/me/login) — an HTTP-only cookie can't be cleared
    // from here either, so a real account's server-side session outlives this until the cookie
    // itself expires. This clears everything the frontend CAN clear; flagged to the backend dev
    // as follow-up, not something fixable from this side.
    setUser(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // Shared by updateProfile/changePassword/resetPassword — keeps the mock roster and, when it's
  // the currently signed-in person, the live session (and its localStorage snapshot) in sync in
  // one place instead of three call sites each doing their own setUser/localStorage dance. None
  // of the three have a real backend endpoint yet, so this only ever actually does anything for
  // a mock-path account (checked via roster membership) — for a real API user it's a harmless
  // no-op rather than silently writing them into the mock-session localStorage key, which would
  // wrongly make the next page load treat them as a mock session instead of asking /auth/me.
  const updateUser = useCallback((userId, patch) => {
    const isMockAccount = users.some((u) => u.id === userId);
    if (!isMockAccount) return;
    setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, ...patch } : u)));
    setUser((prev) => {
      if (!prev || prev.id !== userId) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, [users]);

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
    authLoading,
    login,
    signUp,
    logout,
    updateProfile,
    changePassword,
    findUserByEmail,
    resetPassword,
  }), [user, authLoading, login, signUp, logout, updateProfile, changePassword, findUserByEmail, resetPassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}
