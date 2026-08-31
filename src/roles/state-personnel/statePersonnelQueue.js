import { SUB_STATUS } from '../../constants/complaintStatus';

export function needsPersonnelWork(c, officerId) {
  return c.subStatus === SUB_STATUS.SENT_TO_STATE_OFFICE
    && c.stateOffice?.assignedPersonnelId === officerId
    && !c.stateOffice?.submittedAt;
}

export function awaitingCoordinatorReview(c, officerId) {
  return c.subStatus === SUB_STATUS.SENT_TO_STATE_OFFICE
    && c.stateOffice?.assignedPersonnelId === officerId
    && !!c.stateOffice?.submittedAt;
}
