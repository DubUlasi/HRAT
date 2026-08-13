import { LayoutDashboard, Gavel, Siren, AlertOctagon, FileText, Search, TrendingUp, FileBarChart, HelpCircle, Settings } from 'lucide-react';

// No static `user` export — every page pulls its `user` straight from useAuth(). The ES sees
// every complaint (no ownership filter). Business Intelligence/Reports/Track Complaint/Help/
// Settings all point at the existing Registry Head pages — role-agnostic pages reused as-is
// rather than duplicated. Repeat Violators is likewise the Registry Head's page reused as-is —
// Registry Head/Director/ES are the only roles with a dedicated page for it. Escalated To Me
// uses Siren rather than AlertOctagon so it doesn't collide with Repeat Violators' icon,
// reserved app-wide for that one meaning (see the hero's repeat-violator pill, the BI teaser).
export const executiveSecretaryNavItems = [
  { to: '/executive-secretary', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/executive-secretary/council', icon: Gavel, label: 'Ready For Council', end: true, section: 'Complaints' },
  { to: '/executive-secretary/escalated', icon: Siren, label: 'Escalated To Me', section: 'Complaints' },
  { to: '/executive-secretary/complaints', icon: FileText, label: 'All Complaints', section: 'Complaints' },
  { to: '/registry-head/repeat-offenders', icon: AlertOctagon, label: 'Repeat Violators', section: 'Complaints' },
  { to: '/registry-head/track', icon: Search, label: 'Track Complaint', section: 'Insights' },
  { to: '/registry-head/business-intelligence', icon: TrendingUp, label: 'Business Intelligence', section: 'Insights' },
  { to: '/registry-head/reports', icon: FileBarChart, label: 'Reports', section: 'Insights' },
  { to: '/registry-head/help', icon: HelpCircle, label: 'Help', section: 'Support' },
  { to: '/registry-head/settings', icon: Settings, label: 'Settings', section: 'Support' },
];
