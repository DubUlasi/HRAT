import React, { useState } from 'react';
import { PlusCircle } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import ComplaintsCardGrid from '../../components/complaints/ComplaintsCardGrid';
import ComplaintsTable from '../../components/ui/ComplaintsTable';
import MakeComplaintModal from '../../components/complaints/MakeComplaintModal';
import VoiceReportModal from '../../components/complaints/VoiceReportModal';
import ReportChoiceModal from '../../components/complaints/ReportChoiceModal';
import SearchBar from '../../components/ui/SearchBar';
import ViewToggle from '../../components/ui/ViewToggle';
import { useComplaints } from '../../context/ComplaintsContext';
import { SUB_STATUS } from '../../constants/complaintStatus';
import { registryHeadNavItems, registryHeadUser } from './navConfig';

const FILTER_COPY = {
  all: { title: 'Complaints', subtitle: 'See the list of filed complaints below.' },
  new: { title: 'New Complaints', subtitle: 'Complaints awaiting their first action, assign a complaint number to get started.' },
  treated: { title: 'Treated Complaints', subtitle: 'Complaints that have been fully investigated and closed.' },
};

function filterComplaints(complaints, filter) {
  if (filter === 'new') return complaints.filter((c) => c.subStatus === SUB_STATUS.NEW);
  if (filter === 'treated') return complaints.filter((c) => c.subStatus === SUB_STATUS.CLOSED);
  return complaints;
}

function matchesSearch(complaint, search) {
  if (!search) return true;
  const term = search.toLowerCase();
  return [complaint.subject, complaint.complaintNumber, complaint.victim?.name, complaint.allegedViolator?.name]
    .filter(Boolean)
    .some((field) => field.toLowerCase().includes(term));
}

export default function RegistryHeadComplaintsPage({ filter = 'all' }) {
  const { complaints } = useComplaints();
  const [showReportChoice, setShowReportChoice] = useState(false);
  const [showMakeComplaint, setShowMakeComplaint] = useState(false);
  const [showVoiceReport, setShowVoiceReport] = useState(false);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('list');
  const copy = FILTER_COPY[filter] || FILTER_COPY.all;
  const filteredComplaints = filterComplaints(complaints, filter).filter((c) => matchesSearch(c, search));

  return (
    <AppShell navItems={registryHeadNavItems} user={registryHeadUser}>
      <PageHeader
        title={copy.title}
        subtitle={copy.subtitle}
        actions={
          <Button variant="primary" icon={PlusCircle} onClick={() => setShowReportChoice(true)}>
            Make a Complaint
          </Button>
        }
      />

      <div className="filter-toolbar">
        <SearchBar
          value={search}
          onChange={setSearch}
          placeholder="Search by subject, complaint number, victim, or alleged violator..."
        />
        <ViewToggle value={viewMode} onChange={setViewMode} />
      </div>

      {viewMode === 'list' ? (
        <ComplaintsTable
          complaints={filteredComplaints}
          getActionHref={(c) => `/registry-head/complaints/${c.id}`}
        />
      ) : (
        <ComplaintsCardGrid complaints={filteredComplaints} />
      )}

      <ReportChoiceModal
        open={showReportChoice}
        onClose={() => setShowReportChoice(false)}
        onSelectType={() => { setShowReportChoice(false); setShowMakeComplaint(true); }}
        onSelectSpeak={() => { setShowReportChoice(false); setShowVoiceReport(true); }}
      />
      <MakeComplaintModal open={showMakeComplaint} onClose={() => setShowMakeComplaint(false)} />
      <VoiceReportModal open={showVoiceReport} onClose={() => setShowVoiceReport(false)} />
    </AppShell>
  );
}
