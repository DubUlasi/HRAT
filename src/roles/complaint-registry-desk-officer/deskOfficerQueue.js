import { SUB_STATUS } from '../../constants/complaintStatus';

// Shared "needs the Desk Officer's action right now" predicates — was duplicated identically
// across DeskOfficerQueuePage/DeskOfficerDashboardPage/DeskOfficerComplaintDetailPage; pulled
// out here (same pattern as directorQueue.js / supervisorQueue.js / investigatorQueue.js /
// registryHeadQueue.js) so the dashboard, queue page, detail page, and sidebar badge count all
// agree on exactly what's waiting on this officer.
export function needsNumber(c, officerId) {
  return c.registryOfficerId === officerId && c.subStatus === SUB_STATUS.COMPLAINT_NUMBER_ASSIGNMENT && !c.complaintNumber;
}

export function needsAdmissibilityDecision(c, officerId) {
  return (
    c.admissibilityOfficerId === officerId &&
    c.subStatus === SUB_STATUS.ADMISSIBILITY_CHECK &&
    (!c.admissibility.decision || (c.admissibility.headConfirmed && c.admissibility.headAgree === false))
  );
}

export function needsDeskOfficerAction(c, officerId) {
  return needsNumber(c, officerId) || needsAdmissibilityDecision(c, officerId);
}
