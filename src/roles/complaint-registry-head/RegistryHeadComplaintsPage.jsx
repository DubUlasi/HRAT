import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import ComplaintsCardGrid from '../../components/complaints/ComplaintsCardGrid';
import MakeComplaintModal from '../../components/complaints/MakeComplaintModal';
import { useComplaints } from '../../context/ComplaintsContext';
import { SUB_STATUS } from '../../constants/complaintStatus';
import { registryHeadNavItems, registryHeadUser } from './navConfig';

const FILTER_COPY = {
  all: { title: 'Complaints', subtitle: 'See the list of filed complaints below.' },
  new: { title: 'New Complaints', subtitle: 'Complaints awaiting their first action — assign a complaint number to get started.' },
  treated: { title: 'Treated Complaints', subtitle: 'Complaints that have been fully investigated and closed.' },
};

function filterComplaints(complaints, filter) {
  if (filter === 'new') return complaints.filter((c) => c.subStatus === SUB_STATUS.NEW);
  if (filter === 'treated') return complaints.filter((c) => c.subStatus === SUB_STATUS.CLOSED);
  return complaints;
}

export default function RegistryHeadComplaintsPage({ filter = 'all' }) {
  const { complaints } = useComplaints();
  const [showMakeComplaint, setShowMakeComplaint] = useState(false);
  const copy = FILTER_COPY[filter] || FILTER_COPY.all;
  const filteredComplaints = filterComplaints(complaints, filter);

  return (
    <AppShell navItems={registryHeadNavItems} user={registryHeadUser}>
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <Button variant="primary" icon={PlusCircle} onClick={() => setShowMakeComplaint(true)}>
            Make a Complaint
          </Button>
        }
      />

      <ComplaintsCardGrid complaints={filteredComplaints} />

      <MakeComplaintModal open={showMakeComplaint} onClose={() => setShowMakeComplaint(false)} />
    </AppShell>
  );
}
