import React, { useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Avatar from '../../components/ui/Avatar';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useUserManagement } from '../../context/UserManagementContext';
import { ROLE_LABELS_FOR_ADMIN } from '../../data/mockManagedUsers';
import { usePagination } from '../../hooks/usePagination';
import { superAdminNavItems, superAdminUser } from './navConfig';

const STATUS_BADGE = { active: 'status-success', pending: 'status-warning', inactive: 'status-danger' };

// Read-only by design — Super Admin oversees, ICT Head/Personnel actually manage. No
// activate/deactivate/remove here, that stays their job (see IctHeadUserManagementPage.jsx).
export default function SuperAdminUsersPage() {
  const { user } = useAuth();
  const person = user || superAdminUser;
  const { users, departments } = useUserManagement();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');

  const filtered = users
    .filter((u) => !search || [u.name, u.email].some((f) => f.toLowerCase().includes(search.toLowerCase())))
    .filter((u) => roleFilter === 'all' || u.role === roleFilter)
    .filter((u) => statusFilter === 'all' || u.status === statusFilter);
  const pagination = usePagination(filtered, 10, `${search}|${roleFilter}|${statusFilter}`);

  const departmentName = (id) => departments.find((d) => d.id === id)?.name || '—';

  return (
    <AppShell navItems={superAdminNavItems} user={person}>
      <PageHeader title="All Users" subtitle="Every staff account across every role, read-only." />

      <div className="filter-toolbar">
        <SearchBar value={search} onChange={setSearch} placeholder="Search by name or email..." />
        <Select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          {Object.entries(ROLE_LABELS_FOR_ADMIN).map(([value, label]) => (
            <option key={value} value={value}>{label}</option>
          ))}
        </Select>
        <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="active">Active</option>
          <option value="pending">Pending</option>
          <option value="inactive">Inactive</option>
        </Select>
      </div>

      {pagination.pageItems.length === 0 ? (
        <EmptyState message="No users match your filters" />
      ) : (
        <div className="complaints-table-wrap">
          <table className="complaints-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Role</th>
                <th>Department</th>
                <th>Status</th>
                <th>Joined</th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div className="person-cell">
                      <Avatar name={u.name} size={28} />
                      <span className="person-cell-name">{u.name}</span>
                    </div>
                  </td>
                  <td>{ROLE_LABELS_FOR_ADMIN[u.role] || u.role}</td>
                  <td>{departmentName(u.departmentId)}</td>
                  <td><span className={`status-badge ${STATUS_BADGE[u.status]}`}>{u.status}</span></td>
                  <td>{new Date(u.joinedDate).toDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
