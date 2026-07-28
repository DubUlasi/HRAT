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
  PRELIMINARY_INVESTIGATION: 'preliminary_investigation',
  ASSIGNED_TO_SUPERVISOR: 'assigned_to_supervisor',
  ASSIGNED_TO_INVESTIGATOR: 'assigned_to_investigator',
  INVESTIGATING: 'investigating',
  INADMISSIBLE: 'inadmissible',
  CLOSED: 'closed',
  WITHDRAWN: 'withdrawn',
};

export const SUB_STATUS_META = {
  [SUB_STATUS.NEW]: { label: 'New', color: 'info' },
  [SUB_STATUS.COMPLAINT_NUMBER_ASSIGNMENT]: { label: 'Complaint Number Assignment', color: 'info' },
  [SUB_STATUS.ADMISSIBILITY_CHECK]: { label: 'Admissibility Check', color: 'warning' },
  [SUB_STATUS.PRELIMINARY_INVESTIGATION]: { label: 'Preliminary Investigation', color: 'warning' },
  [SUB_STATUS.ASSIGNED_TO_SUPERVISOR]: { label: 'Assigned To Supervisor', color: 'warning' },
  [SUB_STATUS.ASSIGNED_TO_INVESTIGATOR]: { label: 'Assigned To Investigator', color: 'warning' },
  [SUB_STATUS.INVESTIGATING]: { label: 'Investigating', color: 'warning' },
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
