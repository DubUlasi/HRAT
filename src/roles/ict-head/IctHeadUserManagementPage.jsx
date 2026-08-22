import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { UserPlus, Trash2, UserCheck, UserX } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import TextArea from '../../components/ui/TextArea';
import ConfirmActionModal from '../../components/ui/ConfirmActionModal';
import SuccessModal from '../../components/ui/SuccessModal';
import { useAuth } from '../../context/AuthContext';
import { useUserManagement } from '../../context/UserManagementContext';
import { ROLE_LABELS_FOR_ADMIN } from '../../data/mockManagedUsers';
import { usePagination } from '../../hooks/usePagination';
import { ROLE_NAV_ITEMS } from '../roleNavMap';
import { ictHeadNavItems, ictHeadUser } from './navConfig';

const STATUS_BADGE = { active: 'status-success', pending: 'status-warning', inactive: 'status-danger' };

function DeactivateModal({ open, userName, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onConfirm(reason.trim());
    setReason('');
  };
  return (
    <Modal open={open} onClose={onClose} title={`Deactivate ${userName}?`} width="440px">
      <form onSubmit={handleSubmit}>
        <FormField label="Reason" required hint="This is recorded on the account, a reason is required.">
          <TextArea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Extended leave of absence" />
        </FormField>
        <div className="modal-actions">
          <Button type="submit" variant="submit" disabled={!reason.trim()}>Deactivate Account</Button>
        </div>
      </form>
    </Modal>
  );
}

export default function IctHeadUserManagementPage() {
  const { user } = useAuth();
  const navItems = ROLE_NAV_ITEMS[user?.role] || ictHeadNavItems;
  const person = user || ictHeadUser;
  const { users, departments, activateUser, deactivateUser, removeUser } = useUserManagement();

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [deactivateTarget, setDeactivateTarget] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const filtered = users
    .filter((u) => !search || [u.name, u.email].some((f) => f.toLowerCase().includes(search.toLowerCase())))
    .filter((u) => roleFilter === 'all' || u.role === roleFilter)
    .filter((u) => statusFilter === 'all' || u.status === statusFilter);
  const pagination = usePagination(filtered, 10, `${search}|${roleFilter}|${statusFilter}`);

  const departmentName = (id) => departments.find((d) => d.id === id)?.name || '—';

  const handleDeactivateConfirm = (reason) => {
    deactivateUser(deactivateTarget.id, reason);
    setDeactivateTarget(null);
    setSuccessMessage(`${deactivateTarget.name}'s account has been deactivated.`);
  };

  const handleRemoveConfirm = () => {
    removeUser(removeTarget.id);
    setSuccessMessage(`${removeTarget.name} has been removed.`);
    setRemoveTarget(null);
  };

  return (
    <AppShell navItems={navItems} user={person}>
      <PageHeader
        title="User Management"
        subtitle="Every onboarded staff account, its role, department, and status."
        actions={<Button variant="primary" icon={UserPlus} to="/ict-head/onboarding">Onboard Someone</Button>}
      />

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
                <th></th>
              </tr>
            </thead>
            <tbody>
              {pagination.pageItems.map((u) => (
                <tr key={u.id}>
                  <td>
                    <Link to={`/ict-head/users/${u.id}`} className="person-cell">
                      <Avatar name={u.name} size={28} />
                      <span className="person-cell-name">{u.name}</span>
                    </Link>
                  </td>
                  <td>{ROLE_LABELS_FOR_ADMIN[u.role] || u.role}</td>
                  <td>{departmentName(u.departmentId)}</td>
                  <td><span className={`status-badge ${STATUS_BADGE[u.status]}`}>{u.status}</span></td>
                  <td>{new Date(u.joinedDate).toDateString()}</td>
                  <td>
                    <div className="table-row-actions">
                      {u.status === 'inactive' ? (
                        <button type="button" className="btn-link" title="Activate" onClick={() => activateUser(u.id)}>
                          <UserCheck size={15} />
                        </button>
                      ) : (
                        <button type="button" className="btn-link" title="Deactivate" onClick={() => setDeactivateTarget(u)}>
                          <UserX size={15} />
                        </button>
                      )}
                      <button type="button" className="btn-link" title="Remove" onClick={() => setRemoveTarget(u)}>
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
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

      <DeactivateModal
        open={!!deactivateTarget}
        userName={deactivateTarget?.name || ''}
        onClose={() => setDeactivateTarget(null)}
        onConfirm={handleDeactivateConfirm}
      />

      <ConfirmActionModal
        open={!!removeTarget}
        title={`Remove ${removeTarget?.name || 'this user'}?`}
        description="This permanently removes their account record. This cannot be undone."
        confirmLabel="Yes, remove"
        onCancel={() => setRemoveTarget(null)}
        onConfirm={handleRemoveConfirm}
      />

      <SuccessModal open={!!successMessage} message={successMessage || ''} onClose={() => setSuccessMessage(null)} />
    </AppShell>
  );
}
