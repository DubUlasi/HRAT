import { apiGet, apiPost, apiPut, apiDelete, apiUpload } from './client';

function buildQuery(params) {
  const search = new URLSearchParams();
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') search.set(key, value);
  });
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

// ── Draft-side wire format: enums are plain integers ──
// See ComplaintDraftStep/VictimSourceType/PopulationClassification/AllegedViolatorType/
// HandlingOfficeType/ViolatorIdentificationStatus/FilingPartyType — every one of these is sent
// and received as its integer value on every endpoint below. The two tracking-only endpoints at
// the bottom of this file (list/detail) are the one place the API instead serializes the same
// concepts as strings — kept in mind by whoever builds the Track/Detail pages against them.
export const COMPLAINT_DRAFT_STEP = { NONE: 0, CATEGORY: 1, INCIDENT: 2, VICTIMS: 3, VIOLATORS: 4, EVIDENCE: 5, REVIEW: 6 };
export const VICTIM_SOURCE_TYPE = { CURRENT_COMPLAINANT: 1, PROVIDED_PERSON: 2 };
export const POPULATION_CLASSIFICATION = { GENERAL: 1, KEY: 2 };
export const ALLEGED_VIOLATOR_TYPE = { UNKNOWN: 1, INDIVIDUAL: 2, ORGANISATION: 3, PUBLIC_OFFICER: 4 };
export const HANDLING_OFFICE_TYPE = { HEADQUARTERS: 1, STATE_OFFICE: 2 };
export const VIOLATOR_IDENTIFICATION_STATUS = { KNOWN: 1, UNIDENTIFIED: 2 };
export const FILING_PARTY_TYPE = { INDIVIDUAL: 1, GROUP_OR_COMMITTEE: 2 };

// ── Drafts ──

export function createComplaintDraft() {
  return apiPost('/complainants/complaint-drafts');
}

export function listComplaintDrafts() {
  return apiGet('/complainants/complaint-drafts');
}

export function getComplaintDraft(draftId) {
  return apiGet(`/complainants/complaint-drafts/${draftId}`);
}

export function abandonComplaintDraft(draftId, revision) {
  return apiDelete(`/complainants/complaint-drafts/${draftId}`, { revision });
}

export function getComplaintFilingProfile() {
  return apiGet('/complainants/complaint-drafts/filing-profile');
}

export function getComplaintFormOptions() {
  return apiGet('/complainants/complaint-form/options');
}

// ── Per-step saves — each takes { revision, ...fields } and returns the new revision via
// response.draft.revision. Callers are responsible for threading the updated revision into the
// next call; nothing here tracks it for you. ──

export function saveComplaintCategory(draftId, body) {
  return apiPut(`/complainants/complaint-drafts/${draftId}/category`, body);
}

export function saveComplaintIncident(draftId, body) {
  return apiPut(`/complainants/complaint-drafts/${draftId}/incident`, body);
}

export function saveComplaintVictims(draftId, body) {
  return apiPut(`/complainants/complaint-drafts/${draftId}/victims`, body);
}

export function saveComplaintViolators(draftId, body) {
  return apiPut(`/complainants/complaint-drafts/${draftId}/alleged-violators`, body);
}

export function savePreferredHandlingOffice(draftId, officeId, revision) {
  return apiPut(`/complainants/complaint-drafts/${draftId}/preferred-handling-office`, { officeId, revision });
}

// files: File[]. Revision travels in the `if-Match` header for this one endpoint, not the body —
// the only place in this API a required field arrives outside the request body.
export function uploadComplaintEvidence(draftId, files, revision) {
  const formData = new FormData();
  files.forEach((file) => formData.append('files', file));
  return apiUpload(`/complainants/complaint-drafts/${draftId}/evidence`, formData, { 'if-Match': String(revision) });
}

export function removeComplaintEvidence(draftId, evidenceId, revision) {
  return apiDelete(`/complainants/complaint-drafts/${draftId}/evidence/${evidenceId}`, { revision });
}

export function completeComplaintEvidence(draftId, revision) {
  return apiPost(`/complainants/complaint-drafts/${draftId}/evidence/complete`, { revision });
}

export function getComplaintReview(draftId) {
  return apiGet(`/complainants/complaint-drafts/${draftId}/review`);
}

export function submitComplaintDraft(draftId, revision) {
  return apiPost(`/complainants/complaint-drafts/${draftId}/submit`, { revision });
}

// ── Tracking (post-submission) — status/type/etc. come back as STRINGS here, unlike the
// integer enums used everywhere above during drafting. ──

export function getComplainantDashboard() {
  return apiGet('/complainants/dashboard');
}

export function listComplainantComplaints({ search, status, categoryId, populationType, page = 1, pageSize = 10 } = {}) {
  return apiGet(`/complainants${buildQuery({ search, status, categoryId, populationType, page, pageSize })}`);
}

export function getComplainantComplaint(complaintId) {
  return apiGet(`/complainants/${complaintId}`);
}

export function withdrawComplainantComplaint(complaintId, reason) {
  return apiPost(`/complainants/${complaintId}/withdrawal`, { reason });
}

// ── Support ──

export function getComplainantSupport() {
  return apiGet('/complainants/support');
}

export function submitSupportEnquiry(subject, message) {
  return apiPost('/complainants/support/enquiries', { subject, message });
}
