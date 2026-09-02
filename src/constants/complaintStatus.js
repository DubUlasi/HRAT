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
  [SUB_STATUS.ASSIGNED_TO_INVESTIGATOR]: { label: 'Assigned To Investigation Officer', color: 'warning' },
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

// The compact "Recent Activity" widget on each role's complaint detail page — a small, honest
// glance at what just happened, not an attempt to also be complete (that's what "View Full Log"
// / ActivityLogDrawer is for). Deliberately just the most recent `limit` entries, with no
// stitching in of bounce-back context or the case's origin: mixing "recent" and "complete" is
// what previously produced confusing gaps (a preview that jumped straight from the newest entry
// to "Complaint submitted" with ten entries silently missing in between). Keeping this purely
// recent, and the drawer purely complete, avoids that blur instead of patching around it.
export function buildActivityTimeline(sortedActivity, limit = 7) {
  return sortedActivity.slice(0, limit);
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

// Who can add or edit a comment on an investigation activity log entry is a function of where
// the case currently sits in the Investigation Officer → Supervisor → Director → Registry chain,
// not just who's looking at it — each role's window closes once they've handed the case off to
// the next one, and reopens if it bounces back to them.
//
// A Supervisor's window closes the moment they forward the case to the Director
// (DIRECTOR_FINAL_REVIEW) — sending it back to the investigator (ASSIGNED_TO_INVESTIGATOR) or a
// second review pass (SUPERVISOR_REVIEW) reopens it since it's still with the department.
const SUPERVISOR_COMMENT_STATUSES = [
  SUB_STATUS.ASSIGNED_TO_SUPERVISOR,
  SUB_STATUS.ASSIGNED_TO_INVESTIGATOR,
  SUB_STATUS.INVESTIGATING,
  SUB_STATUS.SUPERVISOR_REVIEW,
];

// A Director's window stays open through everything the Supervisor's does, plus their own final
// review, and only closes once they forward the case back to the Registry (DEPT_COMPLETE or
// later) — escalating to the ES doesn't change subStatus, so that stays open too.
const DIRECTOR_COMMENT_STATUSES = [
  ...SUPERVISOR_COMMENT_STATUSES,
  SUB_STATUS.DIRECTOR_FINAL_REVIEW,
];

export function canSupervisorCommentOnActivities(subStatus) {
  return SUPERVISOR_COMMENT_STATUSES.includes(subStatus);
}

export function canDirectorCommentOnActivities(subStatus) {
  return DIRECTOR_COMMENT_STATUSES.includes(subStatus);
}

// The state-office detour has no equivalent step-by-step subStatus chain — it stays at
// SENT_TO_STATE_OFFICE for its entire duration, with progress read off the `stateOffice` fields
// instead (see ComplaintsContext.jsx). So the State Coordinator's comment window isn't a status
// list like the two above, it's simply "while this complaint is still out at the state office" —
// open from the moment it's routed there, closed once returnFromStateOffice sends it back.
export function canStateCoordinatorCommentOnActivities(complaint) {
  return complaint?.subStatus === SUB_STATUS.SENT_TO_STATE_OFFICE && !complaint?.stateOffice?.returnedAt;
}
