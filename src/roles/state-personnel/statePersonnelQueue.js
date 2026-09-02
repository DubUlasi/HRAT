import { SUB_STATUS } from '../../constants/complaintStatus';

// Mirrors the Desk Officer's own two-step pattern (process the number, then handle the actual
// case) — a state-office complaint only reaches "needs your findings" once it actually has a
// complaint number. With auto-numbering on it already has one by the time it's assigned; with
// auto off, numbering is this officer's own first task (see processComplaintNumberAssignment,
// reused as-is from ComplaintsContext.jsx — it's role-agnostic).
export function needsNumberProcessing(c, officerId) {
  return c.subStatus === SUB_STATUS.SENT_TO_STATE_OFFICE
    && c.stateOffice?.assignedPersonnelId === officerId
    && !c.complaintNumber;
}

export function needsPersonnelWork(c, officerId) {
  return c.subStatus === SUB_STATUS.SENT_TO_STATE_OFFICE
    && c.stateOffice?.assignedPersonnelId === officerId
    && !c.stateOffice?.submittedAt
    && !!c.complaintNumber;
}

export function awaitingCoordinatorReview(c, officerId) {
  return c.subStatus === SUB_STATUS.SENT_TO_STATE_OFFICE
    && c.stateOffice?.assignedPersonnelId === officerId
    && !!c.stateOffice?.submittedAt;
}
