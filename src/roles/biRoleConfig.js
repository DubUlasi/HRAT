// Single source of truth for "what's relevant to this role" on the Business Intelligence and
// Reports pages — both pages read from this so they can never drift on the same question.
import { departmentSupervisors, investigationOfficers } from '../data/mockOfficers';

const TREND_BY_ROLE = {
  'registry-head': { title: 'Complaints Filed, Year-over-Year Trend' },
  'executive-secretary': { title: 'Complaints Filed, Year-over-Year Trend' },
  'ict-head': { title: 'Complaints Filed, Year-over-Year Trend' },
  'desk-officer': { title: 'My Caseload, Year-over-Year Trend' },
  'department-director': { title: "My Department's Complaints, Year-over-Year Trend" },
  'department-supervisor': { title: 'My Assigned Cases, Year-over-Year Trend' },
  'department-investigator': { title: 'My Investigations, Year-over-Year Trend' },
};

export function getBiRoleConfig(user) {
  const role = user?.role;
  const departmentId = user?.departmentId;

  // ICT Head gets the same full org-wide view as Registry Head/Executive Secretary — it can
  // view everything, it just can't act on any of it (see rolePermissions.js).
  const isOversight = role === 'registry-head' || role === 'executive-secretary' || role === 'ict-head';
  const isIndividualHandler = ['desk-officer', 'department-director', 'department-supervisor', 'department-investigator'].includes(role);

  let teams = [];
  if (role === 'department-director') {
    teams = [
      { label: 'Supervisor Performance', entities: departmentSupervisors.filter((s) => s.departmentId === departmentId), keyField: 'supervisorId' },
      { label: 'Investigator Performance', entities: investigationOfficers.filter((i) => i.departmentId === departmentId), keyField: 'investigatorId' },
    ];
  } else if (role === 'department-supervisor') {
    teams = [
      { label: 'Investigator Performance', entities: investigationOfficers.filter((i) => i.departmentId === departmentId), keyField: 'investigatorId' },
    ];
  }

  return {
    role,
    showActiveOfficesStat: isOversight || role === 'department-director',
    showAdmissibilityStats: isOversight || role === 'desk-officer',
    showHandledSinceStat: isIndividualHandler,
    showStageTimings: isOversight || role === 'desk-officer' || role === 'department-director',
    showOrgPerformance: isOversight,
    showEsStats: role === 'executive-secretary',
    showRegistryHeadQueueStats: role === 'registry-head',
    teams,
    trend: TREND_BY_ROLE[role] || TREND_BY_ROLE['registry-head'],
  };
}
