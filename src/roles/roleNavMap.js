import { registryHeadNavItems } from './complaint-registry-head/navConfig';
import { deskOfficerNavItems } from './complaint-registry-desk-officer/navConfig';
import { departmentDirectorNavItems } from './department-director/navConfig';
import { departmentSupervisorNavItems } from './department-supervisor/navConfig';
import { departmentInvestigatorNavItems } from './department-investigator/navConfig';
import { executiveSecretaryNavItems } from './executive-secretary/navConfig';

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
};
