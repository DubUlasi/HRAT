import React, { useEffect, useState } from 'react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import Input from '../ui/Input';

// Only the fields a person would reasonably self-manage (name, contact info) — role,
// department, and office are organizationally assigned and stay read-only on the Settings page.
export default function EditProfileModal({ open, onClose, person, onSubmit }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    if (open) {
      setName(person?.name || '');
      setEmail(person?.email || '');
      setPhone(person?.phone || '');
      setAddress(person?.address || '');
    }
  }, [open, person]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ name, email, phone, address });
  };

  return (
    <Modal open={open} onClose={onClose} title="Edit Profile" width="440px">
      <form onSubmit={handleSubmit}>
        <FormField label="Full Name" required>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </FormField>

        <FormField label="Email" required>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </FormField>

        <FormField label="Phone Number">
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </FormField>

        <FormField label="Address">
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </FormField>

        <div className="modal-actions">
          <Button type="submit" variant="submit">Save Changes</Button>
        </div>
      </form>
    </Modal>
  );
}
