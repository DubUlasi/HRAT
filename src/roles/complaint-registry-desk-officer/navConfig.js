import { LayoutDashboard, Inbox, FileText, Search, TrendingUp, FileBarChart, HelpCircle, Settings } from 'lucide-react';

// No static `user` export here (unlike the older registry-head navConfig) — every page in this
// role pulls its `user` straight from useAuth() now that real (mock) login/session exists.
// Business Intelligence/Reports/Track Complaint/Help/Settings all point at the existing
// Registry Head pages — role-agnostic pages reused as-is rather than duplicated per role.
// No Repeat Violators page for this role — a repeat violator only shows as a flag inline on a
// complaint's own detail page here, per the Registry Head/Director/ES-only scoping decision.
export const deskOfficerNavItems = [
  { to: '/desk-officer', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/desk-officer/queue', icon: Inbox, label: 'My Queue', end: true, section: 'Complaints' },
  { to: '/desk-officer/complaints', icon: FileText, label: 'All Complaints', section: 'Complaints' },
  { to: '/registry-head/track', icon: Search, label: 'Track Complaint', section: 'Insights' },
  { to: '/registry-head/business-intelligence', icon: TrendingUp, label: 'Business Intelligence', section: 'Insights' },
  { to: '/registry-head/reports', icon: FileBarChart, label: 'Reports', section: 'Insights' },
  { to: '/registry-head/help', icon: HelpCircle, label: 'Help', section: 'Support' },
  { to: '/registry-head/settings', icon: Settings, label: 'Settings', section: 'Support' },
];
