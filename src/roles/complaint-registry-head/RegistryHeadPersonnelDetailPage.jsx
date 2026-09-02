import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { Mail, Phone, Briefcase, Building2 } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import Avatar from '../../components/ui/Avatar';
import BackButton from '../../components/ui/BackButton';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import Pagination from '../../components/ui/Pagination';
import DownloadCsvButton from '../../components/ui/DownloadCsvButton';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { usePagination } from '../../hooks/usePagination';
import { downloadComplaintsExcel } from '../../utils/exportUtils';
import { SUB_STATUS_META } from '../../constants/complaintStatus';
import { matchesStatusFilter } from '../../components/complaints/ComplaintListFilters';
import { findPersonnelById, getCasesForPersonnel, canViewPersonnel, isActiveCase } from '../scopePersonnel';
import { ROLE_NAV_ITEMS, ROLE_COMPLAINT_DETAIL_BASE } from '../roleNavMap';
import { registryHeadNavItems } from './navConfig';

// Same-URL sharing as RegistryHeadViolatorDetailPage — one canonical route, granted to every
// role with a Personnel page (see PERSONNEL_ROLES in scopePersonnel.js), rendering whoever's
// actually logged in's own sidebar and their own complaint-detail base so "View" links land on
// the right role's detail route.
function matchesSearch(complaint, search) {
  if (!search) return true;
  const term = search.toLowerCase();
  return [complaint.subject, complaint.complaintNumber, complaint.victim?.name, complaint.allegedViolator?.name]
    .filter(Boolean)
    .some((field) => field.toLowerCase().includes(term));
}

export default function RegistryHeadPersonnelDetailPage() {
  const { officerId } = useParams();
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const navItems = ROLE_NAV_ITEMS[user?.role] || registryHeadNavItems;
  const detailBase = ROLE_COMPLAINT_DETAIL_BASE[user?.role] || '/registry-head/complaints';
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const found = findPersonnelById(officerId);
  const allowed = canViewPersonnel(officerId, user);

  if (!found || !allowed) {
    return (
      <AppShell navItems={navItems} user={user}>
        <div className="detail-top-nav-bar">
          <BackButton navItems={navItems} fallbackTo="/registry-head/personnel" />
        </div>
        <h1>Staff member not found</h1>
        <p>This person may not be on file, or you don't have access to view them.</p>
      </AppShell>
    );
  }

  const { person, roleLabel, scopeLabel } = found;
  const cases = getCasesForPersonnel(complaints, officerId);
  const activeCount = cases.filter(isActiveCase).length;

  const rows = cases.filter((c) => matchesSearch(c, search)).filter((c) => matchesStatusFilter(c, statusFilter));
  const pagination = usePagination(rows, 10, `${search}|${statusFilter}`);

  return (
    <AppShell navItems={navItems} user={user}>
      <div className="detail-top-nav-bar">
        <BackButton navItems={navItems} fallbackTo="/registry-head/personnel" />
        <DownloadCsvButton onDownload={() => downloadComplaintsExcel(cases, `${person.name} - Cases`)} disabled={!cases.length} />
      </div>

      <div className="violator-detail-hero">
        <Avatar name={person.name} size={56} />
        <div className="violator-detail-identity">
          <h1>{person.name}</h1>
          <div className="violator-detail-contact-row">
            <span><Mail size={12} /> {person.email}</span>
            {person.phone && <span><Phone size={12} /> {person.phone}</span>}
            <span><Briefcase size={12} /> {roleLabel}</span>
            {scopeLabel && <span><Building2 size={12} /> {scopeLabel}</span>}
          </div>
        </div>
        <div className="violator-detail-stats">
          <div className="violator-detail-stat personnel-stat">
            <span className="value">{cases.length}</span>
            <span className="label">Total Cases</span>
          </div>
          <div className="violator-detail-stat personnel-stat">
            <span className="value">{activeCount}</span>
            <span className="label">Active</span>
          </div>
        </div>
      </div>

      <div className="filter-toolbar" style={{ marginTop: 16 }}>
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by subject, complaint number, victim, or alleged violator..."
        />
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          {Object.entries(SUB_STATUS_META).map(([key, meta]) => (
            <option key={key} value={key}>{meta.label}</option>
          ))}
        </Select>
      </div>

      <ComplaintsTable complaints={pagination.pageItems} getActionHref={(c) => `${detailBase}/${c.id}`} />

      <Pagination
        page={pagination.page}
        pageCount={pagination.pageCount}
        pageSize={pagination.pageSize}
        totalItems={pagination.totalItems}
        onPageChange={pagination.setPage}
        onPageSizeChange={pagination.setPageSize}
      />
    </AppShell>
  );
}
