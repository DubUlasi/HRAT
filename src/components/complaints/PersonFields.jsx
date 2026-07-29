import React from 'react';
import FormField from '../ui/FormField';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { useTranslation } from '../../context/I18nContext';

export const EMPTY_PERSON = { firstName: '', lastName: '', gender: 'female', phone: '', email: '', address: '' };

// Quick victim/alleged-violator fields shared by any "fast" complaint-entry flow (as opposed
// to the full public ComplaintWizardForm, which asks for a lot more per person).
export default function PersonFields({ person, onChange }) {
  const { t } = useTranslation();
  const set = (field) => (e) => onChange({ ...person, [field]: e.target.value });

  return (
    <>
      <div className="modal-field-row">
        <FormField label={t('common.firstName')} required>
          <Input value={person.firstName} onChange={set('firstName')} required />
        </FormField>
        <FormField label={t('common.lastName')} required>
          <Input value={person.lastName} onChange={set('lastName')} required />
        </FormField>
      </div>
      <div className="modal-field-row">
        <FormField label={t('common.gender')} required>
          <Select value={person.gender} onChange={set('gender')}>
            <option value="female">{t('common.genderFemale')}</option>
            <option value="male">{t('common.genderMale')}</option>
            <option value="rather_not_say">{t('common.genderRatherNotSay')}</option>
          </Select>
        </FormField>
        <FormField label={t('common.phone')}>
          <Input type="tel" value={person.phone} onChange={set('phone')} />
        </FormField>
      </div>
      <FormField label={t('common.email')}>
        <Input type="email" value={person.email} onChange={set('email')} />
      </FormField>
      <FormField label={t('common.address')} required>
        <Input value={person.address} onChange={set('address')} required />
      </FormField>
    </>
  );
}
