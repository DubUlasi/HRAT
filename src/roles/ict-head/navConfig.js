import { LayoutDashboard, FileText, Search, TrendingUp, FileBarChart, HelpCircle, Settings, Users, UserPlus, Building2 } from 'lucide-react';

// ICT Head can view the complaint registry (same data Registry Head sees) but performs no
// pipeline actions on it — so unlike registryHeadNavItems, this list drops "Needs My Action" and
// "New Complaints" (both pure action-queue concepts), and also drops Treated/Flagged/Repeat
// Violators entirely (per-officer/pipeline-outcome breakdowns that aren't this role's job) and
// adds an Administration section instead. Complaints/Insights/Support items point at the SAME
// shared URLs every other role's nav already uses (/registry-head/track, etc.) — those pages
// render whoever's actually logged in's own nav via ROLE_NAV_ITEMS, exactly like every existing
// role today. `capability` on an item is read by Sidebar.jsx, which hides it if the role no
// longer has that capability (Super Admin can revoke manage_users/manage_departments live).
export const ictHeadNavItems = [
  { to: '/ict-head', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/ict-head/complaints', icon: FileText, label: 'All Complaints', end: true, section: 'Complaints' },
  { to: '/registry-head/track', icon: Search, label: 'Track Complaint', section: 'Complaints' },
  { to: '/ict-head/users', icon: Users, label: 'User Management', section: 'Administration', capability: 'manage_users' },
  { to: '/ict-head/onboarding', icon: UserPlus, label: 'Onboarding', section: 'Administration', capability: 'manage_users' },
  { to: '/ict-head/departments', icon: Building2, label: 'Departments', section: 'Administration', capability: 'manage_departments' },
  { to: '/registry-head/business-intelligence', icon: TrendingUp, label: 'Business Intelligence', section: 'Insights' },
  { to: '/registry-head/reports', icon: FileBarChart, label: 'Reports', section: 'Insights' },
  { to: '/registry-head/help', icon: HelpCircle, label: 'Help', section: 'Support' },
  { to: '/registry-head/settings', icon: Settings, label: 'Settings', section: 'Support' },
];

export const ictHeadUser = {
  name: 'Chidinma Obi',
  email: 'chidinma.obi@example.com',
  avatarSrc: '/alicia.png',
};
