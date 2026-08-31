import { LayoutDashboard, Users, UserPlus, Building2, HelpCircle, Settings } from 'lucide-react';

// ICT Personnel has zero complaint access — onboarding, user management, and departments only.
// User Management/Onboarding/Departments point at the same /ict-head/* URLs ICT Head's own nav
// uses (those pages are shared, physically living under roles/ict-head/ — see roleNavMap.js);
// each renders whoever is actually logged in's own sidebar, exactly like every other shared page
// in this app already does (e.g. every role's Help link points at /registry-head/help).
// `capability` on an item is read by Sidebar.jsx, which hides it if the current role no longer
// has that capability (Super Admin can revoke manage_users/manage_departments live) — otherwise
// a revoked link would still show in the sidebar and just bounce the user back on click.
export const ictPersonnelNavItems = [
  { to: '/ict-personnel', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/ict-head/users', icon: Users, label: 'User Management', section: 'Administration', capability: 'manage_users' },
  { to: '/ict-head/onboarding', icon: UserPlus, label: 'Onboarding', section: 'Administration', capability: 'manage_users' },
  { to: '/ict-head/departments', icon: Building2, label: 'Departments', section: 'Administration', capability: 'manage_departments' },
  { to: '/registry-head/help', icon: HelpCircle, label: 'Help', section: 'Support' },
  { to: '/registry-head/settings', icon: Settings, label: 'Settings', section: 'Support' },
];

export const ictPersonnelUser = {
  name: 'Tunde Bakare',
  email: 'tunde.bakare@example.com',
  avatarSrc: '/alicia.png',
};
