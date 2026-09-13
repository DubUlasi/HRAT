import { apiGet, apiGetBlob, apiPost } from './client';

function buildQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

// Every list/export endpoint shares the same four filters (search, status, categoryId,
// populationType) plus page/pageSize for lists — kept as one params object shape throughout
// this file rather than positional args, since most of these calls carry 4-6 optional values.

export function getRegistryDashboard() {
  return apiGet('/registry/dashboard');
}

export function getRegistryComplaintFilterOptions() {
  return apiGet('/registry/complaints/filter-options');
}

// ── List variants behind the "All / New / Treated / Needs Action" filter tabs ──

export function listRegistryComplaints(params) {
  return apiGet(`/registry/complaints${buildQuery(params)}`);
}

export function listNewRegistryComplaints(params) {
  return apiGet(`/registry/complaints/new${buildQuery(params)}`);
}

export function listTreatedRegistryComplaints(params) {
  return apiGet(`/registry/complaints/treated${buildQuery(params)}`);
}

// "Needs Action" — the actual work-queue endpoint (distinct shape: actionId/actionType/
// requiredAction/instructions/receivedAt/isClaimedByCurrentUser on top of the usual fields).
export function listRegistryActions(params) {
  return apiGet(`/registry/actions${buildQuery(params)}`);
}

// ── XLSX exports — same filters as their list counterpart, minus page/pageSize (exports are
// never paginated). Each returns a real Blob; pair with client.js's downloadBlob(). ──

export function exportRegistryComplaints(params) {
  return apiGetBlob(`/registry/complaints/export${buildQuery(params)}`);
}

export function exportNewRegistryComplaints(params) {
  return apiGetBlob(`/registry/complaints/new/export${buildQuery(params)}`);
}

export function exportTreatedRegistryComplaints(params) {
  return apiGetBlob(`/registry/complaints/treated/export${buildQuery(params)}`);
}

export function exportRegistryActions(params) {
  return apiGetBlob(`/registry/actions/export${buildQuery(params)}`);
}

export function exportFlaggedRegistryComplaints(params) {
  return apiGetBlob(`/registry/complaints/flagged/export${buildQuery(params)}`);
}

export function exportRepeatViolators(params) {
  return apiGetBlob(`/registry/repeat-violators/export${buildQuery(params)}`);
}

// ── Flagged complaints ──

export function listFlaggedRegistryComplaints(params) {
  return apiGet(`/registry/complaints/flagged${buildQuery(params)}`);
}

// Not wired to any UI yet — no single-complaint page exists to trigger these from (see the
// Phase 3 plan). Built now so they're ready once a real complaint detail page exists.
export function flagRegistryComplaint(complaintId, reason) {
  return apiPost(`/registry/complaints/${complaintId}/flags`, { reason });
}

export function clearRegistryComplaintFlag(complaintId, reason) {
  return apiPost(`/registry/complaints/${complaintId}/flag-clearance`, { reason });
}

// ── Repeat violators ──

export function listRepeatViolators(params) {
  return apiGet(`/registry/repeat-violators${buildQuery(params)}`);
}

export function confirmRepeatViolator(allegedViolatorIds, displayName) {
  return apiPost('/registry/repeat-violators/confirm', { allegedViolatorIds, displayName });
}
