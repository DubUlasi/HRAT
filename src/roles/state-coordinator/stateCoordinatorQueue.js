import { SUB_STATUS } from '../../constants/complaintStatus';

// The state-office detour keeps subStatus at SENT_TO_STATE_OFFICE for its whole duration —
// which sub-step a complaint is actually on is read off the `stateOffice` fields themselves,
// same spirit as supervisorQueue.js reading `subStatus` for the main pipeline.
export function needsPersonnelAssignment(c, officeId) {
  return c.subStatus === SUB_STATUS.SENT_TO_STATE_OFFICE
    && c.stateOffice?.sentTo === officeId
    && !c.stateOffice?.assignedPersonnelId;
}

export function needsCoordinatorReview(c, officeId) {
  return c.subStatus === SUB_STATUS.SENT_TO_STATE_OFFICE
    && c.stateOffice?.sentTo === officeId
    && !!c.stateOffice?.submittedAt;
}
