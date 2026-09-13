import { apiGet, apiPost } from './client';

// The API returns { id, email, displayName, roles: [string] } — the rest of the app reads
// user.name and user.role (singular) everywhere, so every real API user is normalized to that
// shape right at the boundary and nothing downstream needs to know the difference from a mock
// account. Real accounts have no officerId/departmentId (staff-only concepts); scopeComplaints.js's
// own `complainant` case already only matches on email/phone, so that's not a gap.
export function normalizeApiUser(apiUser) {
  return {
    ...apiUser,
    name: apiUser.displayName,
    role: apiUser.roles?.[0],
  };
}

export function fetchCurrentUser() {
  return apiGet('/auth/me');
}

// The Swagger spec documents this body as { email, password }, but the live API actually
// validates a field called `identifier` (confirmed by testing directly — sending `email` gets
// rejected with "'identifier' must not be empty", sending `identifier` works and accepts either
// an email or a phone number). Flagged back to the backend dev as a docs bug; this sends what
// the real endpoint actually needs so login isn't blocked waiting on that fix.
export function loginRequest(identifier, password) {
  return apiPost('/auth/login', { identifier, password });
}

// The endpoint assigns only the `complainant` role and signs the account in immediately (per
// its own spec description) — no separate login call needed right after this succeeds.
export function signUpRequest({ firstName, lastName, email, phoneNumber, gender, password, confirmPassword }) {
  return apiPost('/complainants/sign-up', { firstName, lastName, email, phoneNumber, gender, password, confirmPassword });
}

// ── Password reset (real accounts only — see ForgotPasswordPage.jsx for the dual-path split
// against the mock roster) ──

// Deliberately returns the same response whether or not the email belongs to a real account
// (anti-enumeration, per the endpoint's own description) — there's no signal here to branch on,
// the caller just always advances to the code-entry step.
export function requestPasswordReset(email) {
  return apiPost('/auth/password-reset/request', { email });
}

// Returns { resetToken, expiresInMinutes } on success — the token is short-lived/single-use and
// must be threaded into completePasswordReset.
export function verifyPasswordResetCode(email, code) {
  return apiPost('/auth/password-reset/verify', { email, code });
}

// Real password policy (enforced server-side, worth validating client-side too so the error
// isn't a surprise): at least 12 characters, upper+lower+digit+special.
export function completePasswordReset(resetToken, newPassword, confirmNewPassword) {
  return apiPost('/auth/password-reset/complete', { resetToken, newPassword, confirmNewPassword });
}
