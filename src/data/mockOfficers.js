// Seeded staff directory used to populate "assign to ___" dropdowns across every role.
// A real backend would expose this via a users/staff endpoint scoped by role.

export const registryOfficers = [
  { id: 'off-mike', name: 'Mike Peter', email: 'mike@example.com' },
  { id: 'off-sam', name: 'Sam Peter', email: 'sampete@example.com' },
];

// `departmentId` scopes each person to one department (matches `departments[].id` below), so a
// department's Director/Supervisor/Investigator dashboards can filter "my department's people"
// instead of assigning from the whole flat roster.
export const departmentSupervisors = [
  { id: 'sup-williams', name: 'Williams Peter', email: 'will@example.com', departmentId: 'civil-political' },
  { id: 'sup-mark', name: 'Mark Peter', email: 'mark@example.com', departmentId: 'vulnerable-groups' },
  { id: 'sup-patricia', name: 'Patricia Peter', email: 'patricia@example.com', departmentId: 'eco-soc' },
  { id: 'sup-daniel', name: 'Daniel Peter', email: 'daniel@example.com', departmentId: 'women-children' },
];

export const investigationOfficers = [
  { id: 'inv-henry', name: 'Henry Peter', email: 'henry@example.com', departmentId: 'civil-political' },
  { id: 'inv-victoria', name: 'Victoria Peter', email: 'victoria@example.com', departmentId: 'vulnerable-groups' },
  { id: 'inv-samuel', name: 'Samuel Peter', email: 'samuel@example.com', departmentId: 'eco-soc' },
  { id: 'inv-blessing', name: 'Blessing Peter', email: 'blessing@example.com', departmentId: 'women-children' },
];

export const departmentDirectors = [
  { id: 'dir-matthew', name: 'Matthew Peter', email: 'matthew@example.com', departmentId: 'civil-political' },
];

// One Executive Secretary — sees every complaint, no department scoping.
export const executiveSecretaries = [
  { id: 'es-grace', name: 'Grace Nnadi', email: 'grace.nnadi@example.com' },
];

export const offices = [
  { id: 'hq', name: 'NHRC HQ, Maitama, Abuja' },
  { id: 'lagos', name: 'Lagos State Office' },
  { id: 'kano', name: 'Kano State Office' },
  { id: 'enugu', name: 'Enugu State Office' },
  { id: 'rivers', name: 'Rivers State Office' },
];

export const departments = [
  { id: 'women-children', name: 'Women And Children' },
  { id: 'civil-political', name: 'Civil & Political Rights' },
  { id: 'eco-soc', name: 'Economic, Social & Cultural Rights' },
  { id: 'vulnerable-groups', name: 'Vulnerable Groups' },
];
