import { LayoutDashboard, Inbox, CheckCircle2, FileText, AlertOctagon, Search, TrendingUp, FileBarChart, HelpCircle, Settings, Flag } from 'lucide-react';

// No static `user` export — every page pulls its `user` straight from useAuth().
// Business Intelligence/Reports/Track Complaint/Help/Settings all point at the existing
// Registry Head pages — role-agnostic pages reused as-is rather than duplicated per role.
export const departmentDirectorNavItems = [
  { to: '/department-director', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/department-director/new', icon: Inbox, label: 'New Assignments', end: true, section: 'Complaints' },
  { to: '/department-director/final-review', icon: CheckCircle2, label: 'Review Findings', section: 'Complaints' },
  { to: '/department-director/complaints', icon: FileText, label: 'All Complaints', end: true, section: 'Complaints' },
  { to: '/registry-head/flagged', icon: Flag, label: 'Flagged Complaints', section: 'Complaints' },
  { to: '/registry-head/repeat-offenders', icon: AlertOctagon, label: 'Repeat Violators', section: 'Complaints' },
  { to: '/registry-head/track', icon: Search, label: 'Track Complaint', section: 'Insights' },
  { to: '/registry-head/business-intelligence', icon: TrendingUp, label: 'Business Intelligence', section: 'Insights' },
  { to: '/registry-head/reports', icon: FileBarChart, label: 'Reports', section: 'Insights' },
  { to: '/registry-head/help', icon: HelpCircle, label: 'Help', section: 'Support' },
  { to: '/registry-head/settings', icon: Settings, label: 'Settings', section: 'Support' },
];
