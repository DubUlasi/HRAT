// Seed roster for the User Management / Onboarding / Departments admin pages (ICT Head, ICT
// Personnel). Deliberately separate from mockUsers.js (the login roster) — onboarding someone
// here creates a real, persisted admin record, it does not grant a working login. One entry per
// existing staff member already seeded in mockOfficers.js/mockUsers.js, using the same
// `officerId`/role slugs so "assign existing staff into a department" reads as coherent.
export const mockManagedUsers = [
  { id: 'user-registry-head', name: 'Sam Peter', email: 'sampete@example.com', role: 'registry-head', departmentId: null, status: 'active', deactivationReason: null, joinedDate: '2019-03-11', lastLoginAt: '2026-08-18T09:12:00.000Z' },
  { id: 'user-desk-officer', name: 'Mike Peter', email: 'mike@example.com', role: 'desk-officer', departmentId: null, status: 'active', deactivationReason: null, joinedDate: '2020-06-02', lastLoginAt: '2026-08-19T14:40:00.000Z' },
  { id: 'user-department-director', name: 'Matthew Peter', email: 'matthew@example.com', role: 'department-director', departmentId: 'civil-political', status: 'active', deactivationReason: null, joinedDate: '2017-01-20', lastLoginAt: '2026-08-19T08:05:00.000Z' },
  { id: 'user-department-supervisor', name: 'Williams Peter', email: 'will@example.com', role: 'department-supervisor', departmentId: 'civil-political', status: 'active', deactivationReason: null, joinedDate: '2018-09-14', lastLoginAt: '2026-08-17T11:22:00.000Z' },
  { id: 'sup-mark', name: 'Mark Peter', email: 'mark@example.com', role: 'department-supervisor', departmentId: 'vulnerable-groups', status: 'active', deactivationReason: null, joinedDate: '2018-11-02', lastLoginAt: '2026-08-15T10:00:00.000Z' },
  { id: 'sup-patricia', name: 'Patricia Peter', email: 'patricia@example.com', role: 'department-supervisor', departmentId: 'eco-soc', status: 'active', deactivationReason: null, joinedDate: '2019-04-18', lastLoginAt: '2026-08-14T10:00:00.000Z' },
  { id: 'sup-daniel', name: 'Daniel Peter', email: 'daniel@example.com', role: 'department-supervisor', departmentId: 'women-children', status: 'active', deactivationReason: null, joinedDate: '2019-07-09', lastLoginAt: '2026-08-16T10:00:00.000Z' },
  { id: 'user-department-investigator', name: 'Henry Peter', email: 'henry@example.com', role: 'department-investigator', departmentId: 'civil-political', status: 'active', deactivationReason: null, joinedDate: '2021-02-08', lastLoginAt: '2026-08-19T16:30:00.000Z' },
  { id: 'inv-victoria', name: 'Victoria Peter', email: 'victoria@example.com', role: 'department-investigator', departmentId: 'vulnerable-groups', status: 'active', deactivationReason: null, joinedDate: '2021-05-11', lastLoginAt: '2026-08-13T10:00:00.000Z' },
  { id: 'inv-samuel', name: 'Samuel Peter', email: 'samuel@example.com', role: 'department-investigator', departmentId: 'eco-soc', status: 'active', deactivationReason: null, joinedDate: '2021-08-30', lastLoginAt: '2026-08-12T10:00:00.000Z' },
  { id: 'inv-blessing', name: 'Blessing Peter', email: 'blessing@example.com', role: 'department-investigator', departmentId: 'women-children', status: 'inactive', deactivationReason: 'Extended leave of absence', joinedDate: '2021-10-04', lastLoginAt: '2026-06-02T10:00:00.000Z' },
  { id: 'user-executive-secretary', name: 'Grace Nnadi', email: 'grace.nnadi@example.com', role: 'executive-secretary', departmentId: null, status: 'active', deactivationReason: null, joinedDate: '2016-11-30', lastLoginAt: '2026-08-19T09:00:00.000Z' },
  { id: 'user-ict-head', name: 'Chidinma Obi', email: 'chidinma.obi@example.com', role: 'ict-head', departmentId: null, status: 'active', deactivationReason: null, joinedDate: '2022-02-14', lastLoginAt: '2026-08-20T08:00:00.000Z' },
  { id: 'user-ict-personnel', name: 'Tunde Bakare', email: 'tunde.bakare@example.com', role: 'ict-personnel', departmentId: null, status: 'active', deactivationReason: null, joinedDate: '2023-05-22', lastLoginAt: '2026-08-19T13:15:00.000Z' },
  { id: 'user-pending-onboard', name: 'Ngozi Eze', email: 'ngozi.eze@example.com', role: 'department-investigator', departmentId: 'eco-soc', status: 'pending', deactivationReason: null, joinedDate: '2026-08-18', lastLoginAt: null },
];

export const ROLE_LABELS_FOR_ADMIN = {
  'registry-head': 'Complaint Registry Head',
  'desk-officer': 'Complaint Registry Desk Officer',
  'department-director': 'Department Director',
  'department-supervisor': 'Department Supervisor',
  'department-investigator': 'Department Investigation Officer',
  'executive-secretary': 'Executive Secretary',
  'ict-head': 'ICT Head',
  'ict-personnel': 'ICT Personnel',
  'complainant': 'Complainant',
};
