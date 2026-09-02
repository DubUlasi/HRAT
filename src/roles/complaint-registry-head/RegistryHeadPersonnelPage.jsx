import React, { useState } from 'react';
import { Mail, Phone } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import Avatar from '../../components/ui/Avatar';
import EmptyState from '../../components/ui/EmptyState';
import ActionIconButton from '../../components/ui/ActionIconButton';
import Pagination from '../../components/ui/Pagination';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { usePagination } from '../../hooks/usePagination';
import { getPersonnelRoster, getCasesForPersonnel, isActiveCase } from '../scopePersonnel';
import { ROLE_NAV_ITEMS } from '../roleNavMap';
import { registryHeadNavItems } from './navConfig';

// One shared page, registered once under Registry Head's own route and granted to Director/
// Supervisor/Executive Secretary too (same convention as Business Intelligence/Reports/Repeat
// Violators) — which staff members show up, and whether a Role column/filter is even needed, is
// entirely driven by getPersonnelRoster(user), so this component itself has no per-role
// branching of its own.
const PAGE_COPY = {
  'registry-head': { title: 'Desk Officers', subtitle: 'The desk officers processing complaint numbering and admissibility checks.' },
  'department-director': { title: 'My Department Staff', subtitle: 'The supervisors and investigation officers in your department.' },
  'department-supervisor': { title: 'My Investigation Officers', subtitle: 'The investigators in your department.' },
  'state-coordinator': { title: 'State Personnel', subtitle: 'The personnel officers at your state office.' },
  'executive-secretary': { title: 'Personnel Directory', subtitle: 'Every staff member handling a complaint across the organization.' },
};

function matchesSearch(person, search) {
  if (!search) return true;
  const term = search.toLowerCase();
  return [person.name, person.email].some((f) => f.toLowerCase().includes(term));
}

export default function RegistryHeadPersonnelPage() {
  const { user } = useAuth();
  const { complaints } = useComplaints();
  const navItems = ROLE_NAV_ITEMS[user?.role] || registryHeadNavItems;
  const [search, setSearch] = useState('');
  const [kindFilter, setKindFilter] = useState('all');

  const roster = getPersonnelRoster(user);
  const kindsPresent = [...new Set(roster.map((p) => p.kind))];
  const showKindColumn = kindsPresent.length > 1;
  // Only worth a column when it actually distinguishes rows — a Director/Supervisor/Coordinator's
  // own roster is already scoped to one department/office, so every row would repeat the exact
  // same value; only Executive Secretary's org-wide directory spans more than one.
  const showScopeColumn = new Set(roster.map((p) => p.scopeLabel).filter(Boolean)).size > 1;

  const rows = roster
    .filter((p) => kindFilter === 'all' || p.kind === kindFilter)
    .filter((p) => matchesSearch(p, search));
  const pagination = usePagination(rows, 10, `${search}|${kindFilter}`);

  const copy = PAGE_COPY[user?.role] || PAGE_COPY['registry-head'];
  const activeCaseCount = (id) => getCasesForPersonnel(complaints, id).filter(isActiveCase).length;

  return (
    <AppShell navItems={navItems} user={user}>
      <PageHeader title={copy.title} subtitle={copy.subtitle} />

      <div className="filter-toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email..." />
        {showKindColumn && (
          <Select value={kindFilter} onChange={(e) => setKindFilter(e.target.value)}>
            <option value="all">All Roles</option>
            {kindsPresent.map((kind) => (
              <option key={kind} value={kind}>{roster.find((p) => p.kind === kind)?.roleLabel}</option>
            ))}
          </Select>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState message="No personnel on file." />
      ) : (
        <>
          <div className="complaints-table-wrap">
            <table className="complaints-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  {showKindColumn && <th>Role</th>}
                  {showScopeColumn && <th>Department / Office</th>}
                  <th>Active Cases</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pagination.pageItems.map((p) => (
                  <tr key={p.id}>
                    <td>
                      <div className="person-cell">
                        <Avatar name={p.name} size={28} />
                        <span className="person-cell-name">{p.name}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                        <Mail size={13} style={{ color: 'var(--text-muted)' }} /> {p.email}
                      </span>
                    </td>
                    <td>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--text-secondary)' }}>
                        <Phone size={13} style={{ color: 'var(--text-muted)' }} /> {p.phone || '—'}
                      </span>
                    </td>
                    {showKindColumn && <td>{p.roleLabel}</td>}
                    {showScopeColumn && <td>{p.scopeLabel || '—'}</td>}
                    <td><span className="count-badge">{activeCaseCount(p.id)}</span></td>
                    <td><ActionIconButton to={`/registry-head/personnel/${p.id}`} label={`View ${p.name}`} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={pagination.page}
            pageCount={pagination.pageCount}
            pageSize={pagination.pageSize}
            totalItems={pagination.totalItems}
            onPageChange={pagination.setPage}
            onPageSizeChange={pagination.setPageSize}
          />
        </>
      )}
    </AppShell>
  );
}
