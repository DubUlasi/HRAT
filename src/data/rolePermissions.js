// The fixed set of capabilities this app actually checks in code — same spirit as
// ROLE_HOME/ROLE_NAV_ITEMS (mockUsers.js/roleNavMap.js) being the fixed set of roles. The SET of
// capabilities is static (adding a new one requires a developer to wire up an actual check
// somewhere); which roles currently HAVE each one is the editable part, live in
// RolePermissionsContext.jsx so Super Admin can toggle it for real.
//
// `applicableRoles` matters: a capability only has any effect for the roles whose own code path
// actually reads it (see the "Gated by" note on each). Super Admin's Permissions page only shows
// a live toggle for those roles — everyone else would be a switch with nothing behind it, which
// defeats the point of a real permission system.
export const CAPABILITY_DEFS = [
  {
    id: 'manage_complaint_pipeline',
    label: 'Manage Complaint Pipeline',
    description: 'Assign officers, confirm admissibility, assign departments, send to council.',
    applicableRoles: ['registry-head', 'ict-head'],
    gatedBy: 'Action buttons on the shared complaint detail page (RegistryHeadComplaintDetailPage.jsx).',
  },
  {
    id: 'manage_users',
    label: 'Manage Users',
    description: 'Access User Management and Onboarding.',
    applicableRoles: ['ict-head', 'ict-personnel'],
    gatedBy: 'Route access to /ict-head/users and /ict-head/onboarding.',
  },
  {
    id: 'manage_departments',
    label: 'Manage Departments',
    description: 'Create departments and assign staff into them.',
    applicableRoles: ['ict-head', 'ict-personnel'],
    gatedBy: 'Route access to /ict-head/departments.',
  },
];

// Seed mapping — identical to what this table held before Super Admin existed to edit it.
export const DEFAULT_ROLE_CAPABILITIES = {
  'registry-head': ['manage_complaint_pipeline'],
  'ict-head': ['manage_users', 'manage_departments'],
  'ict-personnel': ['manage_users', 'manage_departments'],
};
