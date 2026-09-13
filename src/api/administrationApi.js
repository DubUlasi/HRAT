import { apiGet } from './client';

// Public (no auth) — the NHRC role catalogue, for future account-assignment workflows per its
// own description. Returns { roles: [{code, displayName, description}] }, keyed by the same
// role-slug codes the frontend already uses as identifiers (see the role-slug rename note in
// memory) — used today just to enrich SuperAdminRolesPage.jsx's cards with a real description;
// the page's own grouping/local labels/capability grants stay the source of truth for everything
// else, since this endpoint carries none of that.
export function listRoles() {
  return apiGet('/administration/roles');
}
