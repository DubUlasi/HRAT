import { SUB_STATUS } from '../../constants/complaintStatus';

// Shared queue-filtering logic for the Department Director's pages — a complaint newly
// assigned to the department (accept/reject not yet decided), one accepted but still needing a
// Supervisor/Investigator picked, and one back from the Supervisor for final sign-off.
export function needsDeptReview(c, departmentId) {
  // `== null` (not `=== null`) deliberately catches both `null` and legacy seed complaints that
  // predate the `departmentDecision` field entirely (`undefined`) — both mean "not decided yet".
  return c.department === departmentId && c.subStatus === SUB_STATUS.DEPT_DIRECTOR_REVIEW && c.departmentDecision?.accepted == null;
}

export function needsAssignment(c, departmentId) {
  return c.department === departmentId && c.subStatus === SUB_STATUS.DEPT_DIRECTOR_REVIEW && c.departmentDecision?.accepted === true;
}

export function needsFinalReview(c, departmentId) {
  return c.department === departmentId && c.subStatus === SUB_STATUS.DIRECTOR_FINAL_REVIEW;
}
