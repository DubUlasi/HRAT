import React, { useMemo, useState } from 'react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import Select from '../../components/ui/Select';
import SearchBar from '../../components/ui/SearchBar';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import StageTracker from '../../components/ui/StageTracker';
import ComplaintProfileCard from '../../components/complaints/ComplaintProfileCard';
import ActivityLogDrawer from '../../components/complaints/ActivityLogDrawer';
import { useComplaints } from '../../context/ComplaintsContext';
import { SUB_STATUS_META } from '../../constants/complaintStatus';
import { CATEGORY_LABELS } from '../../constants/complaintCategories';
import { registryHeadNavItems, registryHeadUser } from './navConfig';

function matchesSearch(complaint, search) {
  if (!search) return true;
  const term = search.toLowerCase();
  return [complaint.subject, complaint.complaintNumber, complaint.victim?.name, complaint.allegedViolator?.name]
    .filter(Boolean)
    .some((field) => field.toLowerCase().includes(term));
}

// The "select a complaint and view its progress" flow is identical for every role per the
// manual ("This is the same process used to track complaints for every type of user").
export default function RegistryHeadTrackPage() {
  const { complaints } = useComplaints();
  const [selectedId, setSelectedId] = useState('');
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');

  const complaint = complaints.find((c) => c.id === selectedId);

  const results = useMemo(() => {
    return complaints
      .filter((c) => matchesSearch(c, search))
      .filter((c) => statusFilter === 'all' || c.subStatus === statusFilter)
      .filter((c) => categoryFilter === 'all' || c.category === categoryFilter)
      .sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled));
  }, [complaints, search, statusFilter, categoryFilter]);

  return (
    <AppShell navItems={registryHeadNavItems} user={registryHeadUser}>
      <PageHeader title="Track Complaint" subtitle="Search or filter for a filed complaint to check its progress." />

      <div className="complaint-detail-main" style={{ marginBottom: 24 }}>
        <div className="filter-toolbar" style={{ marginBottom: 14 }}>
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder="Search by subject, complaint number, victim, or alleged violator..."
          />
          <Select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="all">All Statuses</option>
            {Object.entries(SUB_STATUS_META).map(([key, meta]) => (
              <option key={key} value={key}>{meta.label}</option>
            ))}
          </Select>
          <Select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
              <option key={key} value={key}>{label}</option>
            ))}
          </Select>
        </div>

        {results.length === 0 ? (
          <EmptyState message="No complaints match your search/filters." />
        ) : (
          <div className="track-results-list">
            {results.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`track-result-row ${selectedId === c.id ? 'active' : ''}`}
                onClick={() => setSelectedId(c.id)}
              >
                <div className="track-result-main">
                  <span className="track-result-subject">{c.subject}</span>
                  <span className="track-result-meta">
                    {c.complaintNumber || 'No number yet'} · Victim: {c.victim?.name} · Alleged Violator: {c.allegedViolator?.name}
                  </span>
                </div>
                <StatusBadge status={c.subStatus} />
              </button>
            ))}
          </div>
        )}
      </div>

      {complaint && (
        <div className="complaint-detail-main">
          <div className="complaint-detail-main-header">
            <div>
              <h2>{complaint.subject}</h2>
              {complaint.complaintNumber && <p className="complaint-number">Complaint Number: {complaint.complaintNumber}</p>}
              <div style={{ marginTop: 8 }}>
                <StatusBadge status={complaint.subStatus} />
              </div>
            </div>
            <Button variant="secondary" to={`/registry-head/complaints/${complaint.id}`}>
              View Complaint
            </Button>
          </div>

          <StageTracker stageIndex={complaint.stageIndex} onStageClick={() => setShowActivityLog(true)} />

          <p className="complaint-description">{complaint.description}</p>

          <ComplaintProfileCard roleLabel="Victim" person={complaint.victim} tagVariant="victim" />
          <div style={{ height: 16 }} />
          <ComplaintProfileCard roleLabel="Alleged Violator" person={complaint.allegedViolator} tagVariant="violator" />
        </div>
      )}

      <ActivityLogDrawer
        open={showActivityLog}
        onClose={() => setShowActivityLog(false)}
        activityLog={complaint?.activityLog || []}
      />
    </AppShell>
  );
}
