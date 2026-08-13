// Registry Head and Executive Secretary see every complaint (no ownership filter — matches
// their own "All Complaints" pages and the fact that both roles already work across the whole
// pipeline). Every other role only ever sees complaints actually assigned to them: Desk
// Officer by registry/admissibility assignment, Director by department, Supervisor/Investigator
// by their own officerId. These are the exact same predicates each role's own "All Complaints"
// list page already filters by — kept here once so Track Complaint (shared across every role)
// and each role's own complaint detail page can't be used to view a case outside that scope.
function isInScope(complaint, user) {
  if (!complaint || !user) return false;
  switch (user.role) {
    case 'desk-officer':
      return complaint.registryOfficerId === user.officerId || complaint.admissibilityOfficerId === user.officerId;
    case 'department-director':
      return complaint.department === user.departmentId;
    case 'department-supervisor':
      return complaint.supervisorId === user.officerId;
    case 'department-investigator':
      return complaint.investigatorId === user.officerId;
    default:
      return true;
  }
}

export function scopeComplaintsForUser(complaints, user) {
  if (!user) return [];
  return complaints.filter((c) => isInScope(c, user));
}

export function userCanViewComplaint(complaint, user) {
  return isInScope(complaint, user);
}

// Only these roles get a dedicated Repeat Violators page/drill-down — Desk Officer/Supervisor/
// Investigator only ever see the repeat-violator flag inline on a complaint's own detail page,
// per the explicit scoping decision (mirrored by the /registry-head/repeat-offenders routes in
// App.jsx and the "View Full History" button in RelatedComplaintsPanel).
export const REPEAT_VIOLATOR_ROLES = ['registry-head', 'department-director', 'executive-secretary'];
