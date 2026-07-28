import React from 'react';
import AssignPersonModal from '../../../components/complaints/AssignPersonModal';
import { registryOfficers } from '../../../data/mockOfficers';

/**
 * Thin wrapper around the generic AssignPersonModal, configured for the Registry Head's two
 * "assign an officer" moments: numbering the complaint, and checking its admissibility.
 */
export default function AssignRegistryOfficerModal({ open, onClose, mode, onSubmit }) {
  const isNumbering = mode === 'number';

  return (
    <AssignPersonModal
      open={open}
      onClose={onClose}
      title={isNumbering ? 'Assign Complaint For Complaint Number' : 'Assign Complaint For Admissibility Check'}
      description={
        isNumbering
          ? 'Select the complaint registry officer who would assign this complaint its number.'
          : "Select the complaint registry officer who would evaluate this complaint's admissibility."
      }
      personLabel="Officer"
      people={registryOfficers}
      onSubmit={onSubmit}
    />
  );
}
