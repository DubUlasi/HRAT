import React, { useState } from 'react';
import { Check, KeyRound } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import FormField from '../../components/ui/FormField';
import SuccessModal from '../../components/ui/SuccessModal';
import { useAuth } from '../../context/AuthContext';
import { useUserManagement } from '../../context/UserManagementContext';
import { ROLE_LABELS_FOR_ADMIN } from '../../data/mockManagedUsers';
import { ROLE_NAV_ITEMS } from '../roleNavMap';
import { ictHeadNavItems, ictHeadUser } from './navConfig';

const STEPS = [
  { num: 1, label: 'Personal Info' },
  { num: 2, label: 'Role & Access' },
  { num: 3, label: 'Contact & Login' },
  { num: 4, label: 'Review & Send' },
];

const DEPARTMENT_SCOPED_ROLES = ['department-director', 'department-supervisor', 'department-investigator'];

function generateTempPassword() {
  return `Nhrc${Math.random().toString(36).slice(2, 8)}`;
}

export default function IctHeadOnboardingPage() {
  const { user } = useAuth();
  const navItems = ROLE_NAV_ITEMS[user?.role] || ictHeadNavItems;
  const person = user || ictHeadUser;
  const { departments, createUser } = useUserManagement();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'desk-officer', departmentId: '' });
  const [tempPassword] = useState(generateTempPassword);
  const [done, setDone] = useState(false);

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const needsDepartment = DEPARTMENT_SCOPED_ROLES.includes(form.role);

  const canContinueFrom = {
    1: form.name.trim() && form.email.trim(),
    2: form.role && (!needsDepartment || form.departmentId),
    3: true,
  };

  const handleSubmit = () => {
    createUser({
      name: form.name.trim(),
      email: form.email.trim(),
      role: form.role,
      departmentId: needsDepartment ? form.departmentId : null,
    });
    setDone(true);
  };

  const handleCloseSuccess = () => {
    setDone(false);
    setStep(1);
    setForm({ name: '', email: '', phone: '', role: 'desk-officer', departmentId: '' });
  };

  return (
    <AppShell navItems={navItems} user={person}>
      <PageHeader title="Onboard Someone" subtitle="Create a new staff account and assign it a role." />

      <div className="wizard-stepper-bar">
        {STEPS.map((s, idx) => (
          <React.Fragment key={s.num}>
            {idx > 0 && <div className={`wizard-step-connector ${s.num <= step ? 'filled' : ''}`} />}
            <button
              type="button"
              className={`wizard-step-node ${s.num <= step ? 'reached' : ''} ${s.num === step ? 'current' : ''}`}
              onClick={() => s.num <= step && setStep(s.num)}
              disabled={s.num > step}
            >
              <span className="wizard-step-circle">{s.num < step ? <Check size={14} /> : s.num}</span>
              <span className="wizard-step-label">{s.label}</span>
            </button>
          </React.Fragment>
        ))}
      </div>

      <div className="categories-card" style={{ maxWidth: 560 }}>
        {step === 1 && (
          <>
            <h2>Personal Info</h2>
            <FormField label="Full Name" required>
              <Input value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="e.g. Ada Obi" />
            </FormField>
            <FormField label="Email Address" required>
              <Input type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} placeholder="name@example.com" />
            </FormField>
            <FormField label="Phone Number" hint="Optional">
              <Input value={form.phone} onChange={(e) => set({ phone: e.target.value })} placeholder="+234 800 000 0000" />
            </FormField>
          </>
        )}

        {step === 2 && (
          <>
            <h2>Role & Access</h2>
            <FormField label="Role" required>
              <Select value={form.role} onChange={(e) => set({ role: e.target.value, departmentId: '' })}>
                {Object.entries(ROLE_LABELS_FOR_ADMIN).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </Select>
            </FormField>
            {needsDepartment && (
              <FormField label="Department" required>
                <Select value={form.departmentId} onChange={(e) => set({ departmentId: e.target.value })}>
                  <option value="">Select a department...</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </Select>
              </FormField>
            )}
          </>
        )}

        {step === 3 && (
          <>
            <h2>Contact & Login</h2>
            <p className="review-summary-line">
              A temporary password is generated below. Share it with {form.name || 'this person'} through your usual secure channel — they'll be required to change it on first sign-in.
            </p>
            <div className="settings-detail-row" style={{ marginTop: 10 }}>
              <span className="settings-detail-icon accent-info"><KeyRound size={15} /></span>
              <div>
                <span className="settings-detail-label">Temporary Password</span>
                <span className="settings-detail-value mono">{tempPassword}</span>
              </div>
            </div>
          </>
        )}

        {step === 4 && (
          <>
            <h2>Review & Send</h2>
            <div className="settings-detail-row"><span className="settings-detail-label">Name</span><span className="settings-detail-value">{form.name}</span></div>
            <div className="settings-detail-row"><span className="settings-detail-label">Email</span><span className="settings-detail-value">{form.email}</span></div>
            {form.phone && <div className="settings-detail-row"><span className="settings-detail-label">Phone</span><span className="settings-detail-value">{form.phone}</span></div>}
            <div className="settings-detail-row"><span className="settings-detail-label">Role</span><span className="settings-detail-value">{ROLE_LABELS_FOR_ADMIN[form.role]}</span></div>
            {needsDepartment && (
              <div className="settings-detail-row"><span className="settings-detail-label">Department</span><span className="settings-detail-value">{departments.find((d) => d.id === form.departmentId)?.name}</span></div>
            )}
          </>
        )}

        <div className="modal-actions" style={{ marginTop: 18 }}>
          {step > 1 && <Button variant="secondary" onClick={() => setStep(step - 1)}>Back</Button>}
          {step < 4 ? (
            <Button variant="primary" disabled={!canContinueFrom[step]} onClick={() => setStep(step + 1)}>Continue</Button>
          ) : (
            <Button variant="submit" onClick={handleSubmit}>Send Invitation</Button>
          )}
        </div>
      </div>

      <SuccessModal
        open={done}
        title="Account Created"
        message={`${form.name}'s account has been created and added to User Management.`}
        onClose={handleCloseSuccess}
      />
    </AppShell>
  );
}
