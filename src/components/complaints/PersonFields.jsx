import React from 'react';
import FormField from '../ui/FormField';
import Input from '../ui/Input';
import Select from '../ui/Select';

export const EMPTY_PERSON = { firstName: '', lastName: '', gender: 'female', phone: '', email: '', address: '' };

// Quick victim/alleged-violator fields shared by any "fast" complaint-entry flow (as opposed
// to the full public ComplaintWizardForm, which asks for a lot more per person).
export default function PersonFields({ person, onChange }) {
  const set = (field) => (e) => onChange({ ...person, [field]: e.target.value });

  return (
    <>
      <div className="modal-field-row">
        <FormField label="First Name" required>
          <Input value={person.firstName} onChange={set('firstName')} required />
        </FormField>
        <FormField label="Last Name" required>
          <Input value={person.lastName} onChange={set('lastName')} required />
        </FormField>
      </div>
      <div className="modal-field-row">
        <FormField label="Gender" required>
          <Select value={person.gender} onChange={set('gender')}>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="rather_not_say">I'd rather not say</option>
          </Select>
        </FormField>
        <FormField label="Phone Number">
          <Input type="tel" value={person.phone} onChange={set('phone')} />
        </FormField>
      </div>
      <FormField label="Email">
        <Input type="email" value={person.email} onChange={set('email')} />
      </FormField>
      <FormField label="Address" required>
        <Input value={person.address} onChange={set('address')} required />
      </FormField>
    </>
  );
}
