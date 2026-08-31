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

// `officeId` scopes each person to one state office (matches `offices[].id` above, excluding
// 'hq' — the state office detour only ever routes to an actual state office), same pattern as
// departmentSupervisors/investigationOfficers being scoped by departmentId.
export const stateCoordinators = [
  { id: 'coord-aisha', name: 'Aisha Bello', email: 'aisha.bello@example.com', officeId: 'lagos' },
  { id: 'coord-ibrahim', name: 'Ibrahim Yusuf', email: 'ibrahim.yusuf@example.com', officeId: 'kano' },
  { id: 'coord-chiamaka', name: 'Chiamaka Eze', email: 'chiamaka.eze@example.com', officeId: 'enugu' },
  { id: 'coord-boma', name: 'Boma Wariboko', email: 'boma.wariboko@example.com', officeId: 'rivers' },
];

export const statePersonnel = [
  { id: 'sp-tunde', name: 'Tunde Adebisi', email: 'tunde.adebisi@example.com', officeId: 'lagos' },
  { id: 'sp-fatima', name: 'Fatima Sani', email: 'fatima.sani@example.com', officeId: 'kano' },
  { id: 'sp-emeka', name: 'Emeka Okafor', email: 'emeka.okafor@example.com', officeId: 'enugu' },
  { id: 'sp-preye', name: 'Preye Amachree', email: 'preye.amachree@example.com', officeId: 'rivers' },
];

export const departments = [
  { id: 'women-children', name: 'Women And Children' },
  { id: 'civil-political', name: 'Civil & Political Rights' },
  { id: 'eco-soc', name: 'Economic, Social & Cultural Rights' },
  { id: 'vulnerable-groups', name: 'Vulnerable Groups' },
];
