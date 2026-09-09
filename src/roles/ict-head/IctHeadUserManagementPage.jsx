import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { UserPlus, Trash2, UserCheck, UserX, History, X } from 'lucide-react';
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

// A fixed set of the reasons this actually tends to happen for — picking one of these IS the
// recorded reason; "Other" is the one option that reveals a free-text field, for anything that
// doesn't fit the list. Deactivate and Reactivate each get their own list since the reasons
// don't overlap.
const REASON_PRESETS = {
  deactivate: [
    'Extended leave of absence',
    'Left the organization',
    'Role reassigned or transferred',
    'Policy or conduct violation',
    'Performance-related',
    'Account security concern',
  ],
  reactivate: [
    'Returned from leave',
    'Reinstated after review',
    'Rehired / returning staff',
    'Deactivated in error, correcting',
  ],
};

const REASON_COPY = {
  deactivate: { title: (name) => `Deactivate ${name}?`, submitLabel: 'Continue', placeholder: 'e.g. Extended leave of absence' },
  reactivate: { title: (name) => `Reactivate ${name}?`, submitLabel: 'Continue', placeholder: 'e.g. Returned from approved leave' },
};

// Shared by both Deactivate and Reactivate — same shape of flow (pick a preset, or type your
// own under "Other"), just a different preset list and title depending on `action`.
function ReasonModal({ open, action, userName, onClose, onSubmit }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const isOther = selectedReason === 'Other';
  const finalReason = (isOther ? otherReason : selectedReason).trim();
  const copy = REASON_COPY[action] || REASON_COPY.deactivate;

  const handleSelect = (reason) => {
    setSelectedReason(reason);
    if (reason !== 'Other') setOtherReason('');
  };

  const reset = () => {
    setSelectedReason('');
    setOtherReason('');
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!finalReason) return;
    onSubmit(finalReason);
    reset();
  };

  return (
    <Modal open={open} onClose={handleClose} title={copy.title(userName)} width="440px">
      <form onSubmit={handleSubmit}>
        <FormField label="Reason" required hint="This is recorded on the account, a reason is required.">
          <div className="sub-category-list">
            {(REASON_PRESETS[action] || []).map((reason) => (
              <button
                type="button"
                key={reason}
                className={`sub-category-pill ${selectedReason === reason ? 'selected' : ''}`}
                onClick={() => handleSelect(reason)}
              >
                <span>{reason}</span>
              </button>
            ))}
            <button
              type="button"
              className={`sub-category-pill ${isOther ? 'selected' : ''}`}
              onClick={() => handleSelect('Other')}
            >
              <span>Other</span>
            </button>
          </div>
        </FormField>

        {isOther && (
          <FormField label="Please specify" required>
            <TextArea value={otherReason} onChange={(e) => setOtherReason(e.target.value)} placeholder={copy.placeholder} />
          </FormField>
        )}

        <div className="modal-actions">
          <Button type="submit" variant="submit" disabled={!finalReason}>{copy.submitLabel}</Button>
        </div>
      </form>
    </Modal>
  );
}

// The quick, in-context way to see an account's full deactivate/reactivate history without
// leaving the table — every entry ever recorded, newest first, not just the most recent one.
function HistoryDrawer({ open, user, onClose }) {
  if (!open || !user) return null;
  const history = user.statusHistory || [];
  return createPortal(
    <div className="drawer-overlay" onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}>
      <aside className="activity-drawer">
        <div className="activity-drawer-header">
          <span className="activity-drawer-header-icon"><History size={15} /></span>
          <div className="activity-drawer-header-text">
            <h3>Account History</h3>
            <p>{user.name}</p>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>
        <div className="activity-drawer-body">
          <div className="person-cell" style={{ marginBottom: 18 }}>
            <Avatar name={user.name} size={36} />
            <div>
              <div className="person-cell-name">{user.name}</div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{user.email}</div>
            </div>
          </div>

          {history.length === 0 ? (
            <p className="activity-empty">No status changes recorded.</p>
          ) : (
            <div className="activity-vertical-timeline">
              {history.map((entry, idx) => (
                <div key={entry.id} className={`activity-timeline-item ${idx === 0 ? 'current' : ''}`}>
                  <span className="activity-node-icon">
                    {entry.action === 'deactivated' ? <UserX size={11} /> : <UserCheck size={11} />}
                  </span>
                  <div className="activity-item-content">
                    <div className="activity-item-header">{entry.action === 'deactivated' ? 'Deactivated' : 'Reactivated'}</div>
                    <div className="activity-item-date">{new Date(entry.at).toLocaleString()}</div>
                    <p className="review-summary-line" style={{ marginTop: 4 }}>{entry.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          <Link to={`/ict-head/users/${user.id}`} className="btn-link" style={{ marginTop: 18, display: 'inline-block' }} onClick={onClose}>
            View Full Profile →
          </Link>
        </div>
      </aside>
    </div>,
    document.body
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
  // { user, action: 'deactivate' | 'reactivate' } while the ReasonModal is open.
  const [reasonFlow, setReasonFlow] = useState(null);
  // { id, name, reason, action } once a reason has been picked — holds it while the "are you
  // sure?" confirmation is up, so the actual context call only happens after that second,
  // explicit confirmation.
  const [pendingAction, setPendingAction] = useState(null);
  const [removeTarget, setRemoveTarget] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [historyTarget, setHistoryTarget] = useState(null);

  const filtered = users
    .filter((u) => !search || [u.name, u.email].some((f) => f.toLowerCase().includes(search.toLowerCase())))
    .filter((u) => roleFilter === 'all' || u.role === roleFilter)
    .filter((u) => statusFilter === 'all' || u.status === statusFilter);
  const pagination = usePagination(filtered, 10, `${search}|${roleFilter}|${statusFilter}`);

  const departmentName = (id) => departments.find((d) => d.id === id)?.name || '—';

  const handleReasonSubmit = (reason) => {
    setPendingAction({ id: reasonFlow.user.id, name: reasonFlow.user.name, action: reasonFlow.action, reason });
    setReasonFlow(null);
  };

  const handleConfirmAction = () => {
    const { id, name, action, reason } = pendingAction;
    if (action === 'deactivate') {
      deactivateUser(id, reason);
      setSuccessMessage(`${name}'s account has been deactivated.`);
    } else {
      activateUser(id, reason);
      setSuccessMessage(`${name}'s account has been reactivated.`);
    }
    setPendingAction(null);
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
                        <button type="button" className="btn-link" onClick={() => setReasonFlow({ user: u, action: 'reactivate' })}>
                          <UserCheck size={13} /> Reactivate
                        </button>
                      ) : (
                        <button type="button" className="btn-link" onClick={() => setReasonFlow({ user: u, action: 'deactivate' })}>
                          <UserX size={13} /> Deactivate
                        </button>
                      )}
                      {u.statusHistory?.length > 0 && (
                        <button type="button" className="btn-link" onClick={() => setHistoryTarget(u)}>
                          <History size={13} /> History
                        </button>
                      )}
                      <button type="button" className="btn-link" style={{ color: 'var(--danger-color)' }} onClick={() => setRemoveTarget(u)}>
                        <Trash2 size={13} /> Delete
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

      <ReasonModal
        open={!!reasonFlow}
        action={reasonFlow?.action}
        userName={reasonFlow?.user?.name || ''}
        onClose={() => setReasonFlow(null)}
        onSubmit={handleReasonSubmit}
      />

      <ConfirmActionModal
        open={!!pendingAction}
        title={pendingAction?.action === 'deactivate' ? `Deactivate ${pendingAction?.name}?` : `Reactivate ${pendingAction?.name}?`}
        description={
          pendingAction?.action === 'deactivate'
            ? `Reason: "${pendingAction?.reason || ''}". They'll lose access immediately, are you sure?`
            : `Reason: "${pendingAction?.reason || ''}". They'll regain access immediately, are you sure?`
        }
        confirmLabel={pendingAction?.action === 'deactivate' ? 'Yes, deactivate' : 'Yes, reactivate'}
        onCancel={() => setPendingAction(null)}
        onConfirm={handleConfirmAction}
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

      <HistoryDrawer
        open={!!historyTarget}
        user={historyTarget}
        onClose={() => setHistoryTarget(null)}
      />
    </AppShell>
  );
}
