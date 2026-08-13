import { SUB_STATUS } from '../../constants/complaintStatus';

const ACTIVE_STATUSES = [SUB_STATUS.ASSIGNED_TO_INVESTIGATOR, SUB_STATUS.INVESTIGATING];

export function isMyActiveCase(c, officerId) {
  return c.investigatorId === officerId && ACTIVE_STATUSES.includes(c.subStatus);
}
