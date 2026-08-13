import React, { useMemo, useState } from 'react';
import { Search, X, Users } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import EmptyState from '../../components/ui/EmptyState';
import StatusBadge from '../../components/ui/StatusBadge';
import StageTracker from '../../components/ui/StageTracker';
import Pagination from '../../components/ui/Pagination';
import HeroPersonCard from '../../components/complaints/HeroPersonCard';
import ActivityLogDrawer from '../../components/complaints/ActivityLogDrawer';
import ComplaintListFilters, {
  matchesStatusFilter,
  matchesCategoryFilter,
  matchesPopulationFilter,
} from '../../components/complaints/ComplaintListFilters';
import { useAuth } from '../../context/AuthContext';
import { useComplaints } from '../../context/ComplaintsContext';
import { usePagination } from '../../hooks/usePagination';
import { registryHeadNavItems, registryHeadUser } from './navConfig';
import { ROLE_NAV_ITEMS } from '../roleNavMap';

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
  const { user } = useAuth();
  const navItems = ROLE_NAV_ITEMS[user?.role] || registryHeadNavItems;
  const { complaints } = useComplaints();
  const [selectedId, setSelectedId] = useState('');
  const [showActivityLog, setShowActivityLog] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [populationFilter, setPopulationFilter] = useState('all');
  const [keyGroupFilter, setKeyGroupFilter] = useState('all');
  // Once a complaint is picked, the search/filter panel collapses out of the way — a "Search
  // Again" button below the result brings it back rather than it permanently crowding the page.
  const [searchCollapsed, setSearchCollapsed] = useState(false);

  const complaint = complaints.find((c) => c.id === selectedId);

  const results = useMemo(() => {
    return complaints
      .filter((c) => matchesSearch(c, search))
      .filter((c) => matchesStatusFilter(c, statusFilter))
      .filter((c) => matchesCategoryFilter(c, categoryFilter))
      .filter((c) => matchesPopulationFilter(c, populationFilter, keyGroupFilter))
      .sort((a, b) => new Date(b.dateFiled) - new Date(a.dateFiled));
  }, [complaints, search, statusFilter, categoryFilter, populationFilter, keyGroupFilter]);

  const pagination = usePagination(results, 10, `${search}|${statusFilter}|${categoryFilter}|${populationFilter}|${keyGroupFilter}`);

  const handleSelect = (id) => {
    setSelectedId(id);
    setSearchCollapsed(true);
  };

  return (
    <AppShell navItems={navItems} user={user || registryHeadUser}>
      <PageHeader title="Track Complaint" subtitle="Search or filter for a filed complaint to check its progress." />

      {searchCollapsed && complaint ? (
        <button type="button" className="track-search-again-btn" onClick={() => setSearchCollapsed(false)}>
          <Search size={13} /> Search again
        </button>
      ) : (
        <div className="track-search-panel">
          <div className="filter-toolbar" style={{ marginBottom: 14 }}>
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Search by subject, complaint number, victim, or alleged violator..."
            />
            <ComplaintListFilters
              statusFilter={statusFilter}
              onStatusChange={setStatusFilter}
              categoryFilter={categoryFilter}
              onCategoryChange={setCategoryFilter}
              populationFilter={populationFilter}
              onPopulationChange={setPopulationFilter}
              keyGroupFilter={keyGroupFilter}
              onKeyGroupChange={setKeyGroupFilter}
            />
          </div>

          {results.length === 0 ? (
            <EmptyState message="No complaints match your search/filters." />
          ) : (
            <>
              <div className="track-results-list">
                {pagination.pageItems.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    className={`track-result-row ${selectedId === c.id ? 'active' : ''}`}
                    onClick={() => handleSelect(c.id)}
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

              <Pagination
                page={pagination.page}
                pageCount={pagination.pageCount}
                pageSize={pagination.pageSize}
                totalItems={pagination.totalItems}
                onPageChange={pagination.setPage}
                onPageSizeChange={pagination.setPageSize}
              />
            </>
          )}
        </div>
      )}

      {complaint && (
        <div className="complaint-detail-main" style={{ marginTop: 16 }}>
          <div className="complaint-detail-main-header">
            <div>
              <h2>{complaint.subject}</h2>
              {complaint.complaintNumber && <p className="complaint-number">Complaint Number: {complaint.complaintNumber}</p>}
              <div style={{ marginTop: 8 }}>
                <StatusBadge status={complaint.subStatus} />
              </div>
            </div>
            <div className="track-detail-header-actions">
              <Button variant="secondary" to={`/registry-head/complaints/${complaint.id}`}>
                View Complaint
              </Button>
              <button type="button" className="track-clear-btn" onClick={() => { setSelectedId(''); setSearchCollapsed(false); }} aria-label="Clear selection">
                <X size={16} />
              </button>
            </div>
          </div>

          <StageTracker stageIndex={complaint.stageIndex} onStageClick={() => setShowActivityLog(true)} />

          <p className="complaint-description">{complaint.description}</p>

          <div className="hero-people-section">
            <span className="hero-people-label"><Users size={12} /> People Involved</span>
            <div className="hero-people-grid">
              <HeroPersonCard roleLabel="Victim" person={complaint.victim} tagVariant="victim" />
              {complaint.additionalVictims?.map((person, idx) => (
                <HeroPersonCard key={`victim-${idx}`} roleLabel={`Victim ${idx + 2}`} person={person} tagVariant="victim" />
              ))}
              <HeroPersonCard roleLabel="Alleged Violator" person={complaint.allegedViolator} tagVariant="violator" />
              {complaint.additionalViolators?.map((person, idx) => (
                <HeroPersonCard key={`violator-${idx}`} roleLabel={`Alleged Violator ${idx + 2}`} person={person} tagVariant="violator" />
              ))}
            </div>
          </div>
        </div>
      )}

      <ActivityLogDrawer
        open={showActivityLog}
        onClose={() => setShowActivityLog(false)}
        activityLog={complaint?.activityLog || []}
        documents={complaint?.documents}
      />
    </AppShell>
  );
}
