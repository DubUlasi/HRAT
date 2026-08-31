import { LayoutDashboard, ShieldCheck, Users, Layers, HelpCircle, Settings } from 'lucide-react';

// Super Admin is governance-only — no complaint access at all (scopeComplaints.js returns false
// for it), and no direct user management either (that stays ICT Head/Personnel's job). Its own
// job is the permission table and a read-only cross-role view.
export const superAdminNavItems = [
  { to: '/super-admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/super-admin/permissions', icon: ShieldCheck, label: 'Permissions', section: 'Governance' },
  { to: '/super-admin/users', icon: Users, label: 'All Users', section: 'Governance' },
  { to: '/super-admin/roles', icon: Layers, label: 'Roles', section: 'Governance' },
  { to: '/registry-head/help', icon: HelpCircle, label: 'Help', section: 'Support' },
  { to: '/registry-head/settings', icon: Settings, label: 'Settings', section: 'Support' },
];

export const superAdminUser = {
  name: 'Pixels',
  email: 'pixels@example.com',
  avatarSrc: '/alicia.png',
};
