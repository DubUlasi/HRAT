// Staff-roster equivalent of scopeComplaints.js — that file answers "which complaints can this
// user see," this one answers "which staff members can this user see, and which complaints is
// each of THEM working on." Kept as its own module (not folded into scopeComplaints.js) since
// the two are keyed in opposite directions: one filters complaints by viewer, this one filters
// people by viewer and complaints by person.
import {
  registryOfficers, departmentSupervisors, investigationOfficers, departmentDirectors,
  stateCoordinators, statePersonnel, executiveSecretaries, departments, offices,
} from '../data/mockOfficers';
import { SUB_STATUS } from '../constants/complaintStatus';

const TERMINAL_STATUSES = [SUB_STATUS.CLOSED, SUB_STATUS.WITHDRAWN];

export function isActiveCase(c) {
  return !TERMINAL_STATUSES.includes(c.subStatus);
}

const departmentName = (departmentId) => departments.find((d) => d.id === departmentId)?.name || null;
const officeName = (officeId) => offices.find((o) => o.id === officeId)?.name || null;

// Every personnel kind the app tracks: who they are, the label to show for it, how to find the
// complaints they're actually working on (mirrors the per-role predicates in
// scopeComplaints.js's isInScope, just keyed by the OFFICER being looked up instead of the
// viewer), and (when relevant) a human-readable department/office to display.
const PERSONNEL_KINDS = {
  'desk-officer': {
    label: 'Desk Officer',
    people: registryOfficers,
    matches: (c, p) => c.registryOfficerId === p.id || c.admissibilityOfficerId === p.id,
  },
  supervisor: {
    label: 'Department Supervisor',
    people: departmentSupervisors,
    matches: (c, p) => c.supervisorId === p.id,
    scopeLabel: (p) => departmentName(p.departmentId),
  },
  investigator: {
    label: 'Investigation Officer',
    people: investigationOfficers,
    matches: (c, p) => c.investigatorId === p.id,
    scopeLabel: (p) => departmentName(p.departmentId),
  },
  director: {
    label: 'Department Director',
    people: departmentDirectors,
    matches: (c, p) => c.department === p.departmentId,
    scopeLabel: (p) => departmentName(p.departmentId),
  },
  'state-coordinator': {
    label: 'State Coordinator',
    people: stateCoordinators,
    matches: (c, p) => c.stateOffice?.sentTo === p.officeId,
    scopeLabel: (p) => officeName(p.officeId),
  },
  'state-personnel': {
    label: 'State Personnel',
    people: statePersonnel,
    matches: (c, p) => c.stateOffice?.assignedPersonnelId === p.id,
    scopeLabel: (p) => officeName(p.officeId),
  },
  'executive-secretary': {
    label: 'Executive Secretary',
    people: executiveSecretaries,
    matches: () => true,
  },
};

// Every role that gets a Personnel page, registered once under Registry Head's own route (same
// sharing convention as Business Intelligence/Reports/Track Complaint/Repeat Violators — one
// canonical URL, granted to multiple roles, each rendering their own sidebar via
// ROLE_NAV_ITEMS[user.role]).
export const PERSONNEL_ROLES = ['registry-head', 'department-director', 'department-supervisor', 'executive-secretary', 'state-coordinator'];

// Which personnel kinds each role's own Personnel page shows. Director sees both tiers of their
// own department (Supervisor is a de facto Investigator manager); Supervisor sees only their own
// Investigators; Registry Head sees the (department-agnostic) Desk Officer pool; State
// Coordinator sees their own office's State Personnel (the office-scoped equivalent of Director/
// Supervisor's department scoping); Executive Secretary, being the one org-wide oversight role,
// gets the full directory across every kind.
export function getPersonnelKindsForRole(role) {
  switch (role) {
    case 'registry-head': return ['desk-officer'];
    case 'department-director': return ['supervisor', 'investigator'];
    case 'department-supervisor': return ['investigator'];
    case 'state-coordinator': return ['state-personnel'];
    case 'executive-secretary': return Object.keys(PERSONNEL_KINDS);
    default: return [];
  }
}

// Director/Supervisor only ever see their OWN department's staff — never another department's,
// even though both roles share the same PERSONNEL_KINDS entries as Executive Secretary's
// directory.
function isOwnDepartmentOnly(role) {
  return role === 'department-director' || role === 'department-supervisor';
}

// Same idea as isOwnDepartmentOnly, just office-scoped — a State Coordinator only ever sees the
// personnel at their own state office.
function isOwnOfficeOnly(role) {
  return role === 'state-coordinator';
}

export function getPersonnelRoster(user) {
  if (!user) return [];
  const kinds = getPersonnelKindsForRole(user.role);
  const rows = [];
  kinds.forEach((kind) => {
    const def = PERSONNEL_KINDS[kind];
    def.people.forEach((person) => {
      if (isOwnDepartmentOnly(user.role) && person.departmentId !== user.departmentId) return;
      if (isOwnOfficeOnly(user.role) && person.officeId !== user.officeId) return;
      rows.push({ ...person, kind, roleLabel: def.label, scopeLabel: def.scopeLabel?.(person) || null });
    });
  });
  return rows;
}

export function findPersonnelById(id) {
  for (const [kind, def] of Object.entries(PERSONNEL_KINDS)) {
    const person = def.people.find((p) => p.id === id);
    if (person) return { person, kind, roleLabel: def.label, scopeLabel: def.scopeLabel?.(person) || null, matches: def.matches };
  }
  return null;
}

export function getCasesForPersonnel(complaints, id) {
  const found = findPersonnelById(id);
  if (!found) return [];
  return complaints.filter((c) => found.matches(c, found.person));
}

// A role can only drill into the personnel it actually manages, same spirit as
// scopeComplaints.js's isInScope guarding a complaint's own detail route.
export function canViewPersonnel(id, user) {
  if (!user) return false;
  const found = findPersonnelById(id);
  if (!found) return false;
  if (!getPersonnelKindsForRole(user.role).includes(found.kind)) return false;
  if (isOwnDepartmentOnly(user.role)) return found.person.departmentId === user.departmentId;
  if (isOwnOfficeOnly(user.role)) return found.person.officeId === user.officeId;
  return true;
}
