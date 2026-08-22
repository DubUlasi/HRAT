import { Home, Search, User, HelpCircle, ShieldAlert } from 'lucide-react';

// Desktop sidebar nav — Track Complaint and Profile/Settings point at the SAME shared pages
// every other role already uses (/registry-head/track, /registry-head/settings); those pages
// derive their own nav/scoping from ROLE_NAV_ITEMS + scopeComplaintsForUser, so a complainant
// landing there sees only their own case(s) with no new page needed.
export const complainantNavItems = [
  { to: '/complainant', icon: Home, label: 'Home', end: true },
  { to: '/registry-head/track', icon: Search, label: 'Track Complaints' },
  { to: '/complainant/rights', icon: ShieldAlert, label: 'Learn About Your Rights' },
  { to: '/complainant/support', icon: HelpCircle, label: 'Contact Support' },
  { to: '/registry-head/settings', icon: User, label: 'My Profile' },
];

// Mobile bottom tab bar — shorter labels, same destinations.
export const complainantBottomNav = [
  { to: '/complainant', icon: Home, label: 'Home', end: true },
  { to: '/registry-head/track', icon: Search, label: 'Track' },
  { to: '/complainant/support', icon: HelpCircle, label: 'Contact' },
  { to: '/complainant/rights', icon: ShieldAlert, label: 'Learn More' },
  { to: '/registry-head/settings', icon: User, label: 'Profile' },
];

export const complainantUser = {
  name: 'Susan Peters',
  email: 'susan.peters@example.com',
  avatarSrc: '/alicia.png',
};
