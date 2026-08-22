import { SUB_STATUS } from '../constants/complaintStatus';
import { needsHeadAction, needsNumberAssignment, needsAdmissibilityAssignment } from './complaint-registry-head/registryHeadQueue';
import { needsDeskOfficerAction } from './complaint-registry-desk-officer/deskOfficerQueue';
import { needsDeptReview, needsAssignment, needsFinalReview } from './department-director/directorQueue';
import { needsInvestigatorAssignment, needsFindingsReview } from './department-supervisor/supervisorQueue';
import { isMyActiveCase } from './department-investigator/investigatorQueue';

// Sidebar count badges — one small map of nav path -> count per role, reusing each role's own
// existing queue predicates (registryHeadQueue.js / deskOfficerQueue.js / directorQueue.js /
// supervisorQueue.js / investigatorQueue.js) so the sidebar number always agrees with whatever
// that same predicate already drives on the dashboard/queue page itself — never a second,
// slightly-different count computed from scratch here.
export function getNavBadgeCounts(user, complaints, complaintNumberAuto) {
  if (!user || !complaints) return {};
  const officerId = user.officerId;
  const departmentId = user.departmentId;

  switch (user.role) {
    case 'registry-head':
      return {
        '/registry-head/complaints/needs-action': complaints.filter(needsHeadAction).length,
        '/registry-head/complaints/new': complaints.filter(complaintNumberAuto ? needsAdmissibilityAssignment : needsNumberAssignment).length,
      };

    case 'desk-officer':
      return {
        '/desk-officer/queue': complaints.filter((c) => needsDeskOfficerAction(c, officerId)).length,
      };

    case 'department-director':
      return {
        '/department-director/new': complaints.filter((c) => needsDeptReview(c, departmentId) || needsAssignment(c, departmentId)).length,
        '/department-director/final-review': complaints.filter((c) => needsFinalReview(c, departmentId)).length,
      };

    case 'department-supervisor':
      return {
        '/department-supervisor/to-assign': complaints.filter((c) => needsInvestigatorAssignment(c, officerId)).length,
        '/department-supervisor/review': complaints.filter((c) => needsFindingsReview(c, officerId)).length,
      };

    case 'department-investigator':
      return {
        '/department-investigator/cases': complaints.filter((c) => isMyActiveCase(c, officerId)).length,
      };

    case 'executive-secretary':
      return {
        '/executive-secretary/council': complaints.filter(
          (c) => c.subStatus === SUB_STATUS.READY_FOR_COUNCIL || c.subStatus === SUB_STATUS.INADMISSIBLE
        ).length,
        '/executive-secretary/escalated': complaints.filter((c) => c.esEscalation?.escalated && !c.esEscalation.resolved).length,
      };

    default:
      return {};
  }
}
