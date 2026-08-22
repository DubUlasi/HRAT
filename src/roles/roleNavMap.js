import { registryHeadNavItems } from './complaint-registry-head/navConfig';
import { deskOfficerNavItems } from './complaint-registry-desk-officer/navConfig';
import { departmentDirectorNavItems } from './department-director/navConfig';
import { departmentSupervisorNavItems } from './department-supervisor/navConfig';
import { departmentInvestigatorNavItems } from './department-investigator/navConfig';
import { executiveSecretaryNavItems } from './executive-secretary/navConfig';
import { ictHeadNavItems } from './ict-head/navConfig';
import { ictPersonnelNavItems } from './ict-personnel/navConfig';
import { complainantNavItems, complainantBottomNav } from './complainant/navConfig';

// Central lookup so pages reused across every role (Business Intelligence, Reports, Track
// Complaint, Help, Settings) render whoever is actually logged in's OWN sidebar instead of
// always hardcoding Registry Head's — keyed by the same role strings RequireRole/mockUsers use.
export const ROLE_NAV_ITEMS = {
  'registry-head': registryHeadNavItems,
  'desk-officer': deskOfficerNavItems,
  'department-director': departmentDirectorNavItems,
  'department-supervisor': departmentSupervisorNavItems,
  'department-investigator': departmentInvestigatorNavItems,
  'executive-secretary': executiveSecretaryNavItems,
  'ict-head': ictHeadNavItems,
  'ict-personnel': ictPersonnelNavItems,
  'complainant': complainantNavItems,
};

// Only the Complainant role gets a mobile bottom tab bar (see AppShell.jsx) — shared pages like
// Track Complaint/Settings read this so they can pass it through without knowing anything about
// the complainant-specific layout themselves. Empty for every other role, same as ROLE_NAV_ITEMS
// having no entry for a role that doesn't need it.
export const ROLE_BOTTOM_NAV = {
  'complainant': complainantBottomNav,
};

export const ROLE_MOBILE_CLASS = {
  'complainant': 'complainant-mobile-view',
};

// Every role has its own complaint detail route at `/{base}/complaints/:id` — used by shared
// pages like Track Complaint so a "View Complaint" link sends the visitor to THEIR OWN role's
// detail route (which also enforces their scoping) instead of always hardcoding Registry Head's.
// ICT Personnel has no entry: it has zero complaint access, so nothing should ever resolve a
// detail link for it (callers fall back to the Registry Head base, which it can't reach either —
// intentional, RequireRole is what actually blocks it).
export const ROLE_COMPLAINT_DETAIL_BASE = {
  'registry-head': '/registry-head/complaints',
  'desk-officer': '/desk-officer/complaints',
  'department-director': '/department-director/complaints',
  'department-supervisor': '/department-supervisor/complaints',
  'department-investigator': '/department-investigator/complaints',
  'executive-secretary': '/executive-secretary/complaints',
  'ict-head': '/ict-head/complaints',
};
