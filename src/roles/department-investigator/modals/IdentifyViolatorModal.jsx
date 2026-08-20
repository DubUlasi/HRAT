import React, { useState } from 'react';
import Modal from '../../../components/ui/Modal';
import Button from '../../../components/ui/Button';
import FormField from '../../../components/ui/FormField';
import Select from '../../../components/ui/Select';
import Input from '../../../components/ui/Input';

// Fills in a violator that was filed as "Unidentified" — only the name is required, everything
// else can still be added progressively later the same way this modal itself got used.
export default function IdentifyViolatorModal({ open, onClose, onSubmit }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName || !lastName) return;
    onSubmit({ firstName, lastName, gender, phone, email, address });
    setFirstName('');
    setLastName('');
    setGender('');
    setPhone('');
    setEmail('');
    setAddress('');
  };

  return (
    <Modal open={open} onClose={onClose} title="Identify Violator" width="440px">
      <form onSubmit={handleSubmit}>
        <FormField label="First Name" required>
          <Input value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
        </FormField>

        <FormField label="Last Name" required>
          <Input value={lastName} onChange={(e) => setLastName(e.target.value)} required />
        </FormField>

        <FormField label="Gender (optional)">
          <Select value={gender} onChange={(e) => setGender(e.target.value)}>
            <option value="">-- Select --</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="rather_not_say">Rather Not Say</option>
          </Select>
        </FormField>

        <FormField label="Phone (optional)">
          <Input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
        </FormField>

        <FormField label="Email (optional)">
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
        </FormField>

        <FormField label="Address (optional)">
          <Input value={address} onChange={(e) => setAddress(e.target.value)} />
        </FormField>

        <div className="modal-actions">
          <Button type="submit" variant="submit">Save Violator Details</Button>
        </div>
      </form>
    </Modal>
  );
}
