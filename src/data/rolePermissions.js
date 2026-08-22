// Static role -> capability table, same spirit as ROLE_HOME/ROLE_NAV_ITEMS (mockUsers.js /
// roleNavMap.js) — hardcoded for now since there's no Super Admin role yet to edit this
// dynamically. This is the foundation a future Super Admin would edit, not a live editor.
export const ROLE_CAPABILITIES = {
  'registry-head': ['manage_complaint_pipeline'],
  'ict-head': ['manage_users', 'manage_departments'],
  'ict-personnel': ['manage_users', 'manage_departments'],
};

export function hasCapability(role, capability) {
  return (ROLE_CAPABILITIES[role] || []).includes(capability);
}
