import { LayoutDashboard, Inbox, FileText, Search, TrendingUp, FileBarChart, HelpCircle, Settings, Flag } from 'lucide-react';

// No static `user` export — every page pulls its `user` straight from useAuth().
// Business Intelligence/Reports/Track Complaint/Help/Settings all point at the existing
// Registry Head pages — role-agnostic pages reused as-is rather than duplicated per role.
// No Repeat Violators page for this role — a repeat violator only shows as a flag inline on a
// complaint's own detail page here, per the Registry Head/Director/ES-only scoping decision.
export const departmentInvestigatorNavItems = [
  { to: '/department-investigator', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/department-investigator/cases', icon: Inbox, label: 'Active Cases', end: true, section: 'Complaints' },
  { to: '/department-investigator/complaints', icon: FileText, label: 'All Complaints', end: true, section: 'Complaints' },
  { to: '/registry-head/flagged', icon: Flag, label: 'Flagged Complaints', section: 'Complaints' },
  { to: '/registry-head/track', icon: Search, label: 'Track Complaint', section: 'Insights' },
  { to: '/registry-head/business-intelligence', icon: TrendingUp, label: 'Business Intelligence', section: 'Insights' },
  { to: '/registry-head/reports', icon: FileBarChart, label: 'Reports', section: 'Insights' },
  { to: '/registry-head/help', icon: HelpCircle, label: 'Help', section: 'Support' },
  { to: '/registry-head/settings', icon: Settings, label: 'Settings', section: 'Support' },
];
