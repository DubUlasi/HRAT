import { LayoutDashboard, FileText, Search, Inbox, CheckCircle2, HelpCircle, Settings, BarChart3 } from 'lucide-react';

export const registryHeadNavItems = [
  { to: '/registry-head', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/registry-head/complaints', icon: FileText, label: 'Complaints', end: true },
  { to: '/registry-head/complaints/new', icon: Inbox, label: 'New Complaints' },
  { to: '/registry-head/complaints/treated', icon: CheckCircle2, label: 'Treated Complaints' },
  { to: '/registry-head/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/registry-head/track', icon: Search, label: 'Track Complaint' },
  { to: '/registry-head/help', icon: HelpCircle, label: 'Help' },
  { to: '/registry-head/settings', icon: Settings, label: 'Settings' },
];

// Stands in for auth/session until a real login flow assigns the signed-in staff member.
export const registryHeadUser = {
  name: 'Sam Peter',
  email: 'sampete@example.com',
  avatarSrc: '/alicia.png',
};
