// Thin fetch wrapper for the real HRAT backend (see .env's VITE_API_BASE_URL). No HTTP client
// library — plain fetch is enough for what's needed so far. `credentials: 'include'` on every
// call is load-bearing: auth is an HTTP-only secure session cookie, not a bearer token, so
// there's nothing for callers to attach themselves — the browser handles it once a cookie is
// set by a successful /auth/login.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Carries the parsed ProblemDetails body (when the API sends one) alongside the HTTP status, so
// callers can branch on `.status` (e.g. 400 -> show `.problem.detail` as a form error) instead
// of re-parsing the response themselves.
export class ApiError extends Error {
  constructor(status, problem) {
    super(problem?.title || problem?.detail || `Request failed (${status})`);
    this.status = status;
    this.problem = problem;
  }
}

async function request(path, { method = 'GET', body, headers } = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    credentials: 'include',
    headers: body ? { 'Content-Type': 'application/json', ...headers } : headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const problem = await res.json().catch(() => null);
    throw new ApiError(res.status, problem);
  }
  if (res.status === 204) return null;
  return res.json();
}

export const apiGet = (path) => request(path);
export const apiPost = (path, body) => request(path, { method: 'POST', body });
export const apiPut = (path, body) => request(path, { method: 'PUT', body });
export const apiDelete = (path, body) => request(path, { method: 'DELETE', body });

// Multipart upload (evidence files) — can't go through `request()`: a FormData body must not be
// JSON.stringify'd, and its Content-Type (with the multipart boundary) has to be set by the
// browser itself, not us, so `headers` here deliberately never includes one.
export async function apiUpload(path, formData, headers) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers,
    body: formData,
  });
  if (!res.ok) {
    const problem = await res.json().catch(() => null);
    throw new ApiError(res.status, problem);
  }
  return res.json();
}

// The export endpoints (registry complaints/actions/flagged/treated/new/repeat-violators) return
// a real XLSX binary, not JSON — `request()`'s `res.json()` would fail on it, so this is its own
// small sibling rather than a `request()` option.
export async function apiGetBlob(path) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
  });
  if (!res.ok) {
    const problem = await res.json().catch(() => null);
    throw new ApiError(res.status, problem);
  }
  return res.blob();
}

// Saves a blob (e.g. from apiGetBlob) to disk via a synthetic, immediately-revoked object URL —
// same mechanism exportUtils.js already uses for its client-built files, just fed a real
// server-provided blob instead of a client-built XML string.
export function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
