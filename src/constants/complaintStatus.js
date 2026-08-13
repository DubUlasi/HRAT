// Shared vocabulary for a complaint's position in the HRAT pipeline (see the NHRC user manual).
// STAGE_ORDER drives the horizontal StageTracker; SUB_STATUS drives the status badge + which
// action button a role should show for a given complaint.

export const STAGE_ORDER = [
  'case_created',
  'admissibility_check',
  'assigned_dept',
  'assigned_supervisor',
  'under_investigation',
  'executive_secretary',
  'governing_council',
];

export const STAGE_LABELS = {
  case_created: 'Case Created',
  admissibility_check: 'Admissibility Check',
  assigned_dept: 'Assigned to dept.',
  assigned_supervisor: 'Assigned to Supervisor',
  under_investigation: 'Under Investigation',
  executive_secretary: 'Executive Secretary',
  governing_council: 'Governing Council',
};

export const SUB_STATUS = {
  NEW: 'new',
  COMPLAINT_NUMBER_ASSIGNMENT: 'complaint_number_assignment',
  ADMISSIBILITY_CHECK: 'admissibility_check',
  PRELIMINARY_INVESTIGATION: 'preliminary_investigation', // legacy value, kept for old seed data only — new writes use DEPT_DIRECTOR_REVIEW instead
  SENT_TO_STATE_OFFICE: 'sent_to_state_office',
  DEPT_DIRECTOR_REVIEW: 'dept_director_review',
  DEPT_REJECTED: 'dept_rejected',
  ASSIGNED_TO_SUPERVISOR: 'assigned_to_supervisor',
  ASSIGNED_TO_INVESTIGATOR: 'assigned_to_investigator',
  INVESTIGATING: 'investigating',
  SUPERVISOR_REVIEW: 'supervisor_review',
  DIRECTOR_FINAL_REVIEW: 'director_final_review',
  DEPT_COMPLETE: 'dept_complete',
  READY_FOR_COUNCIL: 'ready_for_council',
  INADMISSIBLE: 'inadmissible',
  CLOSED: 'closed',
  WITHDRAWN: 'withdrawn',
};

export const SUB_STATUS_META = {
  [SUB_STATUS.NEW]: { label: 'New', color: 'info' },
  [SUB_STATUS.COMPLAINT_NUMBER_ASSIGNMENT]: { label: 'Complaint Number Assignment', color: 'info' },
  [SUB_STATUS.ADMISSIBILITY_CHECK]: { label: 'Admissibility Check', color: 'warning' },
  [SUB_STATUS.PRELIMINARY_INVESTIGATION]: { label: 'Preliminary Investigation', color: 'warning' },
  [SUB_STATUS.SENT_TO_STATE_OFFICE]: { label: 'Sent To State Office', color: 'info' },
  [SUB_STATUS.DEPT_DIRECTOR_REVIEW]: { label: 'Department Director Review', color: 'warning' },
  [SUB_STATUS.DEPT_REJECTED]: { label: 'Rejected By Department', color: 'danger' },
  [SUB_STATUS.ASSIGNED_TO_SUPERVISOR]: { label: 'Assigned To Supervisor', color: 'warning' },
  [SUB_STATUS.ASSIGNED_TO_INVESTIGATOR]: { label: 'Assigned To Investigator', color: 'warning' },
  [SUB_STATUS.INVESTIGATING]: { label: 'Investigating', color: 'warning' },
  [SUB_STATUS.SUPERVISOR_REVIEW]: { label: 'Supervisor Review', color: 'warning' },
  [SUB_STATUS.DIRECTOR_FINAL_REVIEW]: { label: 'Director Final Review', color: 'warning' },
  [SUB_STATUS.DEPT_COMPLETE]: { label: 'Department Complete', color: 'info' },
  [SUB_STATUS.READY_FOR_COUNCIL]: { label: 'Ready For Council', color: 'violet' },
  [SUB_STATUS.INADMISSIBLE]: { label: 'Inadmissible', color: 'danger' },
  [SUB_STATUS.CLOSED]: { label: 'Closed', color: 'success' },
  [SUB_STATUS.WITHDRAWN]: { label: 'Withdrawn', color: 'danger' },
};

export function getSubStatusMeta(subStatus) {
  return SUB_STATUS_META[subStatus] || { label: subStatus, color: 'info' };
}

export function stageProgressPercent(stageIndex) {
  if (stageIndex < 0) return 4; // a sliver of progress so a brand-new complaint's bar isn't empty
  return Math.round(((stageIndex + 1) / STAGE_ORDER.length) * 100);
}

// Single source of truth for "what's the decision/outcome so far" on a complaint — used
// anywhere a case's result needs to be summarized in one line (repeat-offender drawer/table,
// related-complaints panel), so that logic isn't duplicated per component.
export function getComplaintOutcomeSummary(complaint) {
  if (complaint.admissibility?.decision === 'INADMISSIBLE') {
    return `Ruled inadmissible${complaint.admissibility.explanation ? `, ${complaint.admissibility.explanation}` : ''}`;
  }
  if (complaint.subStatus === SUB_STATUS.CLOSED) {
    return complaint.investigation?.finding || 'Closed.';
  }
  if (complaint.subStatus === SUB_STATUS.WITHDRAWN) {
    return 'Withdrawn by complainant.';
  }
  return 'Still in progress.';
}

// Every action function that bounces a case backward (supervisorReview's !satisfied branch,
// directorFinalReview's send-back branch, directorReviewDepartment's rejected branch,
// councilReopenOrClose's REOPEN branch) phrases its pushActivity message with one of these
// words — checked here instead of adding a `type` field to every activity() call site, so the
// activity timeline can flag a step as "went backward" purely from the log it already has.
const BOUNCE_BACK_PATTERN = /sent back|rejected|reopened/i;

export function isBounceBackActivity(message) {
  return BOUNCE_BACK_PATTERN.test(message || '');
}

// The compact "Activity Timeline" widget on each role's complaint detail page only previews the
// most recent `limit` entries — but a bounce-back entry on its own doesn't say what got sent
// back, so whenever one falls inside the preview window, its immediate predecessor (the
// submission that triggered it) is pulled in too, even if that predecessor would otherwise fall
// outside the window. `sortedActivity` must already be sorted newest-first.
export function buildActivityTimeline(sortedActivity, limit = 5) {
  const base = sortedActivity.slice(0, limit);
  const included = new Map(base.map((entry) => [entry.id, entry]));
  base.forEach((entry) => {
    if (!isBounceBackActivity(entry.message)) return;
    const fullIndex = sortedActivity.findIndex((e) => e.id === entry.id);
    const predecessor = sortedActivity[fullIndex + 1];
    if (predecessor && !included.has(predecessor.id)) included.set(predecessor.id, predecessor);
  });
  return [...included.values()].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
}

const ATTACHMENT_PATTERN = /^Attached \d+ files?/i;

// attachDocuments() (ComplaintsContext.jsx) stamps freshly-attached files directly onto the
// activity entry as `entry.documents`, so that's checked first. Seed data (mockComplaints.js)
// predates that field and only has the free-text "Attached N file(s) at Stage" message, so as
// a fallback this matches that entry's timestamp against `complaint.documents[].uploadedAt` —
// the seed data always sets both to the exact same value for a given attachment.
export function getActivityDocuments(entry, complaint) {
  if (entry.documents) return entry.documents;
  if (!ATTACHMENT_PATTERN.test(entry.message || '')) return [];
  return (complaint?.documents || []).filter((doc) => doc.uploadedAt === entry.timestamp);
}
