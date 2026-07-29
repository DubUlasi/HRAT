// Shared vocabulary for the Call Center feature — mirrors the pattern in complaintStatus.js
// (a *_META lookup + a getter with a safe fallback) so StatusBadge can drive its label/color
// from these the same way it already does for SUB_STATUS.

export const CALLER_TYPE_META = {
  new: { label: 'New Caller', color: 'info' },
  returning: { label: 'Returning Caller', color: 'success' },
};

export const CALL_OUTCOME_META = {
  new_complaint_started: { label: 'New Complaint Started', color: 'success' },
  info_only: { label: 'Info Only', color: 'info' },
  complaint_linked: { label: 'Linked To Complaint', color: 'warning' },
};

export function getCallerTypeMeta(callerType) {
  return CALLER_TYPE_META[callerType] || { label: callerType, color: 'info' };
}

export function getCallOutcomeMeta(outcome) {
  return CALL_OUTCOME_META[outcome] || { label: outcome, color: 'info' };
}
