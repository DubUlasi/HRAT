import { SUB_STATUS } from '../../constants/complaintStatus';

// Shared "needs the Registry Head's action right now" predicates — mirrors the exact cases
// RegistryHeadComplaintDetailPage's renderActionButton() switch handles, so the dashboard's
// stats/queue and the detail page's action button always agree on what's actually waiting on
// the Head (same pattern as directorQueue.js / supervisorQueue.js / investigatorQueue.js).
export function needsNumberAssignment(c) {
  return c.subStatus === SUB_STATUS.NEW;
}

export function needsAdmissibilityAssignment(c) {
  return c.subStatus === SUB_STATUS.COMPLAINT_NUMBER_ASSIGNMENT && !!c.complaintNumber;
}

export function needsAdmissibilityConfirmation(c) {
  return c.subStatus === SUB_STATUS.ADMISSIBILITY_CHECK && !!c.admissibility?.decision;
}

export function needsDepartmentAssignment(c) {
  const isPendingDeptStage = c.subStatus === SUB_STATUS.PRELIMINARY_INVESTIGATION || c.subStatus === SUB_STATUS.DEPT_DIRECTOR_REVIEW;
  return (isPendingDeptStage && !c.department) || c.subStatus === SUB_STATUS.DEPT_REJECTED;
}

export function needsSendToCouncil(c) {
  return c.subStatus === SUB_STATUS.DEPT_COMPLETE;
}

export function needsHeadAction(c) {
  return (
    needsNumberAssignment(c) ||
    needsAdmissibilityAssignment(c) ||
    needsAdmissibilityConfirmation(c) ||
    needsDepartmentAssignment(c) ||
    needsSendToCouncil(c)
  );
}

// One-line reason shown in the dashboard's action queue — keeps that list self-explanatory
// without the reader having to know what each subStatus means.
export function headActionReason(c) {
  if (needsNumberAssignment(c)) return 'Needs a complaint number assigned';
  if (needsAdmissibilityAssignment(c)) return 'Needs an admissibility officer assigned';
  if (needsAdmissibilityConfirmation(c)) return "Needs your confirmation of the officer's decision";
  if (needsDepartmentAssignment(c)) return c.subStatus === SUB_STATUS.DEPT_REJECTED ? 'Department rejected, needs re-assignment' : 'Needs a department assigned';
  if (needsSendToCouncil(c)) return 'Department work complete, ready to send to council';
  return null;
}
