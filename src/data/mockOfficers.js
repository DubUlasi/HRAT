// Seeded staff directory used to populate "assign to ___" dropdowns across every role.
// A real backend would expose this via a users/staff endpoint scoped by role.

export const registryOfficers = [
  { id: 'off-mike', name: 'Mike Peter', email: 'mike@example.com' },
  { id: 'off-sam', name: 'Sam Peter', email: 'sampete@example.com' },
];

export const departmentSupervisors = [
  { id: 'sup-williams', name: 'Williams Peter', email: 'will@example.com' },
  { id: 'sup-mark', name: 'Mark Peter', email: 'mark@example.com' },
];

export const investigationOfficers = [
  { id: 'inv-henry', name: 'Henry Peter', email: 'henry@example.com' },
];

export const departmentDirectors = [
  { id: 'dir-matthew', name: 'Matthew Peter', email: 'matthew@example.com' },
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
