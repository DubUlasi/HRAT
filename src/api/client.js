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
