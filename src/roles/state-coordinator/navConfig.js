import { LayoutDashboard, Inbox, FileText, Users, Search, TrendingUp, FileBarChart, HelpCircle, Settings } from 'lucide-react';

// No static `user` export — every page pulls its `user` straight from useAuth(), same
// convention as department-supervisor/department-investigator. Business Intelligence/Reports/
// Track Complaint/Help/Settings all point at the existing Registry Head pages — role-agnostic
// pages reused as-is rather than duplicated per role.
export const stateCoordinatorNavItems = [
  { to: '/state-coordinator', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/state-coordinator/incoming', icon: Inbox, label: 'Incoming Complaints', end: true, section: 'Complaints' },
  { to: '/state-coordinator/complaints', icon: FileText, label: 'All Complaints', section: 'Complaints' },
  { to: '/registry-head/personnel', icon: Users, label: 'State Personnel', section: 'Team' },
  { to: '/registry-head/track', icon: Search, label: 'Track Complaint', section: 'Insights' },
  { to: '/registry-head/business-intelligence', icon: TrendingUp, label: 'Business Intelligence', section: 'Insights' },
  { to: '/registry-head/reports', icon: FileBarChart, label: 'Reports', section: 'Insights' },
  { to: '/registry-head/help', icon: HelpCircle, label: 'Help', section: 'Support' },
  { to: '/registry-head/settings', icon: Settings, label: 'Settings', section: 'Support' },
];
