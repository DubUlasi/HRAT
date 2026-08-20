import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import RepeatOffendersTable from '../../components/ui/RepeatOffendersTable';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import DownloadCsvButton from '../../components/ui/DownloadCsvButton';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { usePagination } from '../../hooks/usePagination';
import { downloadOffendersExcel } from '../../utils/exportUtils';
import { CATEGORY_LABELS } from '../../constants/complaintCategories';
import { registryHeadNavItems, registryHeadUser } from './navConfig';
import { ROLE_NAV_ITEMS } from '../roleNavMap';
import { scopeRepeatOffendersForUser } from '../scopeComplaints';

export default function RegistryHeadRepeatOffendersPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const navItems = ROLE_NAV_ITEMS[user?.role] || registryHeadNavItems;
  const { getRepeatOffenders } = useComplaints();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const offenders = scopeRepeatOffendersForUser(getRepeatOffenders(), user)
    .filter((o) => !search || o.name.toLowerCase().includes(search.toLowerCase()))
    .filter((o) => categoryFilter === 'all' || o.categories.includes(categoryFilter));
  const pagination = usePagination(offenders, 10, `${search}|${categoryFilter}`);

  return (
    <AppShell navItems={navItems} user={user || registryHeadUser}>
      <PageHeader
        title="Repeat Violators"
        subtitle="Alleged violators named in two or more complaints, across every stage of the pipeline."
        actions={<DownloadCsvButton onDownload={() => downloadOffendersExcel(offenders, 'Repeat Violators')} disabled={!offenders.length} />}
      />

      <div className="filter-toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by alleged violator name..." />
        <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
          <option value="all">All Offense Categories</option>
          {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </Select>
      </div>

      <RepeatOffendersTable
        offenders={pagination.pageItems}
        onViewHistory={(offender) => navigate(`/registry-head/repeat-offenders/${encodeURIComponent(offender.id)}`)}
      />

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
