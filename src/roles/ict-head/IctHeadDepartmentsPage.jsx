import React, { useState } from 'react';
import { Building2, Plus, Users, Trash2, UserPlus } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Avatar from '../../components/ui/Avatar';
import Modal from '../../components/ui/Modal';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import ConfirmActionModal from '../../components/ui/ConfirmActionModal';
import SuccessModal from '../../components/ui/SuccessModal';
import EmptyState from '../../components/ui/EmptyState';
import { useAuth } from '../../context/AuthContext';
import { useUserManagement } from '../../context/UserManagementContext';
import { ROLE_LABELS_FOR_ADMIN } from '../../data/mockManagedUsers';
import { ROLE_NAV_ITEMS } from '../roleNavMap';
import { ictHeadNavItems, ictHeadUser } from './navConfig';

function CreateDepartmentModal({ open, onClose, onCreate }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onCreate({ name: name.trim(), description: description.trim() });
    setName('');
    setDescription('');
  };
  return (
    <Modal open={open} onClose={onClose} title="Create Department" width="440px">
      <form onSubmit={handleSubmit}>
        <FormField label="Department Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Digital Rights" />
        </FormField>
        <FormField label="Description" hint="Optional">
          <TextArea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="What does this department handle?" />
        </FormField>
        <div className="modal-actions">
          <Button type="submit" variant="submit" disabled={!name.trim()}>Create Department</Button>
        </div>
      </form>
    </Modal>
  );
}

function AssignMembersModal({ open, department, users, onClose, onAssign }) {
  const [selected, setSelected] = useState([]);
  const unassigned = users.filter((u) => u.departmentId !== department?.id);

  const toggle = (id) => setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSubmit = () => {
    onAssign(selected);
    setSelected([]);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Assign Staff to ${department?.name || ''}`} width="480px">
      {unassigned.length === 0 ? (
        <EmptyState message="Every staff account is already in this department" />
      ) : (
        <div className="user-checklist">
          {unassigned.map((u) => (
            <label key={u.id} className="settings-detail-row" style={{ cursor: 'pointer' }}>
              <input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggle(u.id)} />
              <Avatar name={u.name} size={28} />
              <div style={{ flex: 1 }}>
                <span className="settings-detail-label">{u.name}</span>
                <span className="settings-detail-value">{ROLE_LABELS_FOR_ADMIN[u.role] || u.role}</span>
              </div>
            </label>
          ))}
        </div>
      )}
      <div className="modal-actions">
        <Button variant="submit" disabled={!selected.length} onClick={handleSubmit}>
          Assign {selected.length || ''} {selected.length === 1 ? 'Person' : 'People'}
        </Button>
      </div>
    </Modal>
  );
}

export default function IctHeadDepartmentsPage() {
  const { user } = useAuth();
  const navItems = ROLE_NAV_ITEMS[user?.role] || ictHeadNavItems;
  const person = user || ictHeadUser;
  const { users, departments, createDepartment, deleteDepartment, assignMembersToDepartment } = useUserManagement();

  const [showCreate, setShowCreate] = useState(false);
  const [assignTarget, setAssignTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const membersOf = (deptId) => users.filter((u) => u.departmentId === deptId);

  const handleCreate = (data) => {
    createDepartment(data);
    setShowCreate(false);
    setSuccessMessage(`${data.name} has been created.`);
  };

  const handleAssign = (userIds) => {
    assignMembersToDepartment(assignTarget.id, userIds);
    setSuccessMessage(`${userIds.length} ${userIds.length === 1 ? 'person' : 'people'} assigned to ${assignTarget.name}.`);
    setAssignTarget(null);
  };

  const handleDelete = () => {
    deleteDepartment(deleteTarget.id);
    setSuccessMessage(`${deleteTarget.name} has been deleted.`);
    setDeleteTarget(null);
  };

  return (
    <AppShell navItems={navItems} user={person}>
      <PageHeader
        title="Departments"
        subtitle="Create departments and assign staff into them."
        actions={<Button variant="primary" icon={Plus} onClick={() => setShowCreate(true)}>Create Department</Button>}
      />

      {departments.length === 0 ? (
        <EmptyState icon={Building2} message="No departments yet" />
      ) : (
        <div className="complaints-card-grid">
          {departments.map((dept) => {
            const members = membersOf(dept.id);
            return (
              <div key={dept.id} className="categories-card">
                <div className="section-header-flex">
                  <h2><Building2 size={15} style={{ verticalAlign: -2, marginRight: 6 }} />{dept.name}</h2>
                  <button type="button" className="btn-link" title="Delete department" onClick={() => setDeleteTarget(dept)}>
                    <Trash2 size={14} />
                  </button>
                </div>
                {dept.description && <p className="review-summary-line">{dept.description}</p>}

                <div className="settings-detail-row" style={{ marginTop: 8 }}>
                  <span className="settings-detail-icon accent-info"><Users size={15} /></span>
                  <div>
                    <span className="settings-detail-label">{members.length} {members.length === 1 ? 'Member' : 'Members'}</span>
                    <span className="settings-detail-value">{members.slice(0, 3).map((m) => m.name).join(', ')}{members.length > 3 ? `, +${members.length - 3} more` : ''}</span>
                  </div>
                </div>

                <div className="modal-actions" style={{ justifyContent: 'flex-start', marginTop: 12 }}>
                  <Button variant="secondary" icon={UserPlus} onClick={() => setAssignTarget(dept)}>Assign Staff</Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <CreateDepartmentModal open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />

      <AssignMembersModal
        open={!!assignTarget}
        department={assignTarget}
        users={users}
        onClose={() => setAssignTarget(null)}
        onAssign={handleAssign}
      />

      <ConfirmActionModal
        open={!!deleteTarget}
        title={`Delete ${deleteTarget?.name || 'this department'}?`}
        description="Staff currently assigned to it will become unassigned. This cannot be undone."
        confirmLabel="Yes, delete"
        onCancel={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      <SuccessModal open={!!successMessage} message={successMessage || ''} onClose={() => setSuccessMessage(null)} />
    </AppShell>
  );
}
