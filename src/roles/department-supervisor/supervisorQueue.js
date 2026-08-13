import { SUB_STATUS } from '../../constants/complaintStatus';

export function needsInvestigatorAssignment(c, officerId) {
  return c.supervisorId === officerId && c.subStatus === SUB_STATUS.ASSIGNED_TO_SUPERVISOR;
}

export function needsFindingsReview(c, officerId) {
  return c.supervisorId === officerId && c.subStatus === SUB_STATUS.SUPERVISOR_REVIEW;
}
