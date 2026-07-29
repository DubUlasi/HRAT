import { LayoutDashboard, FileText, Search, Inbox, CheckCircle2, HelpCircle, Settings, BarChart3, TrendingUp, AlertOctagon, Phone } from 'lucide-react';

// `section` groups items into a labeled block in the sidebar (see Sidebar.jsx) — Dashboard is
// the only item left without one, rendering as a flat top-level link above every section.
export const registryHeadNavItems = [
  { to: '/registry-head', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/registry-head/complaints', icon: FileText, label: 'All Complaints', end: true, section: 'Complaints' },
  { to: '/registry-head/complaints/new', icon: Inbox, label: 'New Complaints', section: 'Complaints' },
  { to: '/registry-head/complaints/treated', icon: CheckCircle2, label: 'Treated Complaints', section: 'Complaints' },
  { to: '/registry-head/call-center', icon: Phone, label: 'Call Center', section: 'Complaints' },
  { to: '/registry-head/repeat-offenders', icon: AlertOctagon, label: 'Repeat Offenders', section: 'Complaints' },
  { to: '/registry-head/analytics', icon: BarChart3, label: 'Analytics', section: 'Insights' },
  { to: '/registry-head/business-intelligence', icon: TrendingUp, label: 'Business Intelligence', section: 'Insights' },
  { to: '/registry-head/track', icon: Search, label: 'Track Complaint', section: 'Insights' },
  { to: '/registry-head/help', icon: HelpCircle, label: 'Help', section: 'Support' },
  { to: '/registry-head/settings', icon: Settings, label: 'Settings', section: 'Support' },
];

// Stands in for auth/session until a real login flow assigns the signed-in staff member.
export const registryHeadUser = {
  name: 'Sam Peter',
  email: 'sampete@example.com',
  avatarSrc: '/alicia.png',
};
