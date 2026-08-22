import { LayoutDashboard, FileText, CheckCircle2, Flag, AlertOctagon, Search, TrendingUp, FileBarChart, HelpCircle, Settings, Users, UserPlus, Building2 } from 'lucide-react';

// ICT Head can view the complaint registry (same data Registry Head sees) but performs no
// pipeline actions on it — so unlike registryHeadNavItems, this list drops "Needs My Action" and
// "New Complaints" (both pure action-queue concepts) and adds an Administration section instead.
// Complaints/Insights/Support items point at the SAME shared URLs every other role's nav already
// uses (/registry-head/flagged, /registry-head/track, etc.) — those pages render whoever's
// actually logged in's own nav via ROLE_NAV_ITEMS, exactly like every existing role today.
export const ictHeadNavItems = [
  { to: '/ict-head', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/ict-head/complaints', icon: FileText, label: 'All Complaints', end: true, section: 'Complaints' },
  { to: '/ict-head/complaints/treated', icon: CheckCircle2, label: 'Treated Complaints', section: 'Complaints' },
  { to: '/registry-head/flagged', icon: Flag, label: 'Flagged Complaints', section: 'Complaints' },
  { to: '/registry-head/repeat-offenders', icon: AlertOctagon, label: 'Repeat Violators', section: 'Complaints' },
  { to: '/ict-head/users', icon: Users, label: 'User Management', section: 'Administration' },
  { to: '/ict-head/onboarding', icon: UserPlus, label: 'Onboarding', section: 'Administration' },
  { to: '/ict-head/departments', icon: Building2, label: 'Departments', section: 'Administration' },
  { to: '/registry-head/track', icon: Search, label: 'Track Complaint', section: 'Insights' },
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
