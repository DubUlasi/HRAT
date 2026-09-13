import React, { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Search, X, Users, Paperclip } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import SearchBar from '../../components/ui/SearchBar';
import EmptyState from '../../components/ui/EmptyState';
import Pagination from '../../components/ui/Pagination';
import FormField from '../../components/ui/FormField';
import TextArea from '../../components/ui/TextArea';
import Modal from '../../components/ui/Modal';
import SuccessModal from '../../components/ui/SuccessModal';
import HeroPersonCard from '../../components/complaints/HeroPersonCard';
import { useAuth } from '../../context/AuthContext';
import { usePagination } from '../../hooks/usePagination';
import { listComplainantComplaints, getComplainantComplaint, withdrawComplainantComplaint } from '../../api/complainantApi';
import { complainantNavItems, complainantBottomNav, complainantUser } from './navConfig';

const NOT_WITHDRAWABLE = ['Closed', 'Withdrawn', 'Abandoned'];

function WithdrawModal({ open, onClose, onConfirm }) {
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (reason.trim().length < 10) { setError('Please explain in at least 10 characters.'); return; }
    setSubmitting(true);
    try {
      await onConfirm(reason.trim());
      setReason('');
    } catch (err) {
      setError(err.problem?.detail || err.message);
    }
    setSubmitting(false);
  };
  return (
    <Modal open={open} onClose={onClose} title="Withdraw This Complaint?" width="440px">
      <form onSubmit={handleSubmit}>
        <p className="modal-description">This cannot be undone. Let us know why you're withdrawing it.</p>
        <FormField label="Reason" required hint="At least 10 characters.">
          <TextArea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Matter resolved directly with the other party" />
        </FormField>
        {error && <p className="su-field-hint-dark" style={{ color: 'var(--danger-color)' }}>{error}</p>}
        <div className="modal-actions">
          <Button type="submit" variant="submit" disabled={submitting}>Withdraw Complaint</Button>
        </div>
      </form>
    </Modal>
  );
}

function formatAddress(addr) {
  if (!addr) return null;
  return [addr.addressLine, addr.city, addr.localGovernmentArea, addr.state].filter(Boolean).join(', ');
}

function toHeroPerson(v) {
  return {
    name: v.fullName || v.displayName,
    unidentified: v.identificationStatus === 'Unidentified',
    gender: v.gender,
    ageAtIncident: v.age,
    phone: v.phoneNumber,
    email: v.email,
    dob: v.dateOfBirth,
    address: formatAddress(v.address),
  };
}

function matchesSearch(complaint, search) {
  if (!search) return true;
  const term = search.toLowerCase();
  return [complaint.subject, complaint.complaintNumber, ...(complaint.victimNames || []), ...(complaint.allegedViolatorNames || [])]
    .filter(Boolean)
    .some((field) => field.toLowerCase().includes(term));
}

// The real-data counterpart to RegistryHeadTrackPage.jsx, used only for the complainant role —
// that page's search/list/detail shape is built entirely around the mock complaint model
// (stageIndex, subStatus, victim/allegedViolator objects, activityLog); the real tracking API
// returns a genuinely different shape (a public `timeline`, `victims[]`/`allegedViolators[]` with
// their own field names, `activities[]`, evidence with an `openUrl`), so rather than deeply
// branching that already-complex, heavily-used-by-every-other-role file, this is its own small
// dedicated component. RegistryHeadTrackPage renders this instead of its own body when the
// signed-in user is a complainant — same URL, same deep-link (`?id=`) support.
export default function ComplainantTrackView() {
  const { user } = useAuth();
  const person = user || complainantUser;
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [listItems, setListItems] = useState([]);
  const [loadingList, setLoadingList] = useState(true);
  const [selectedId, setSelectedId] = useState('');
  const [detail, setDetail] = useState(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [showWithdraw, setShowWithdraw] = useState(false);
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [searchCollapsed, setSearchCollapsed] = useState(false);

  const loadList = () => {
    setLoadingList(true);
    listComplainantComplaints({ page: 1, pageSize: 100 })
      .then((result) => setListItems(result.items || []))
      .catch(() => {})
      .finally(() => setLoadingList(false));
  };

  useEffect(() => { loadList(); }, []);

  useEffect(() => {
    const queryId = searchParams.get('id');
    if (queryId) {
      setSelectedId(queryId);
      setSearchCollapsed(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    if (!selectedId) { setDetail(null); return; }
    setLoadingDetail(true);
    getComplainantComplaint(selectedId)
      .then(setDetail)
      .catch(() => setDetail(null))
      .finally(() => setLoadingDetail(false));
  }, [selectedId]);

  const results = useMemo(() => listItems.filter((c) => matchesSearch(c, search)), [listItems, search]);
  const pagination = usePagination(results, 10, search);

  const handleSelect = (id) => { setSelectedId(id); setSearchCollapsed(true); };

  const handleWithdrawConfirm = async (reason) => {
    await withdrawComplainantComplaint(selectedId, reason);
    setShowWithdraw(false);
    setWithdrawSuccess(true);
    loadList();
    getComplainantComplaint(selectedId).then(setDetail).catch(() => {});
  };

  return (
    <AppShell navItems={complainantNavItems} user={person} bottomNavItems={complainantBottomNav} mobileClassName="complainant-mobile-view">
      <PageHeader title="Track Complaint" subtitle="Search or filter for a filed complaint to check its progress." />

      {searchCollapsed && detail ? (
        <button type="button" className="track-search-again-btn" onClick={() => setSearchCollapsed(false)}>
          <Search size={13} /> Search again
        </button>
      ) : (
        <div className="track-search-panel">
          <div className="filter-toolbar" style={{ marginBottom: 14 }}>
            <SearchBar value={search} onChange={setSearch} placeholder="Search by subject, complaint number, victim, or alleged violator..." />
          </div>

          {results.length === 0 ? (
            <EmptyState message={loadingList ? 'Loading...' : 'No complaints match your search.'} />
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
                        {c.complaintNumber || 'No number yet'} · Victim: {c.victimNames?.[0]} · Alleged Violator: {c.allegedViolatorNames?.[0]}
                      </span>
                    </div>
                    <span className="status-badge status-info">{c.status}</span>
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

      {loadingDetail && <p className="review-summary-line" style={{ marginTop: 16 }}>Loading...</p>}

      {detail && (
        <div className="complaint-detail-main" style={{ marginTop: 16 }}>
          <div className="complaint-detail-main-header">
            <div>
              <h2>{detail.subject}</h2>
              {detail.complaintNumber && <p className="complaint-number">Complaint Number: {detail.complaintNumber}</p>}
              <div style={{ marginTop: 8 }}>
                <span className="status-badge status-info">{detail.status}</span>
              </div>
            </div>
            <div className="track-detail-header-actions">
              {detail.canWithdraw && !NOT_WITHDRAWABLE.includes(detail.status) && (
                <Button variant="secondary" onClick={() => setShowWithdraw(true)}>Withdraw Complaint</Button>
              )}
              <button type="button" className="track-clear-btn" onClick={() => { setSelectedId(''); setSearchCollapsed(false); }} aria-label="Clear selection">
                <X size={16} />
              </button>
            </div>
          </div>

          <div className="filter-toolbar" style={{ marginTop: 4, marginBottom: 4 }}>
            <div style={{ width: '100%' }}>
              <div className="progress-bar-track"><div className="progress-bar-fill" style={{ width: `${detail.progressPercent}%` }} /></div>
            </div>
          </div>

          {detail.timeline?.length > 0 && (
            <div className="activity-vertical-timeline" style={{ marginTop: 12 }}>
              {detail.timeline.map((stage) => (
                <div key={stage.step} className={`activity-timeline-item ${stage.state === 'Current' ? 'current' : ''}`}>
                  <span className="activity-node-icon"><span className={`activity-node-dot ${stage.state === 'Current' ? 'latest' : ''}`} /></span>
                  <div className="activity-item-content">
                    <div className="activity-item-header">{stage.name}</div>
                    <div className="activity-item-date">{stage.state}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <p className="complaint-description">{detail.incident?.description}</p>

          <div className="hero-people-section">
            <span className="hero-people-label"><Users size={12} /> People Involved</span>
            <div className="hero-people-grid">
              {detail.victims?.map((v, idx) => (
                <HeroPersonCard key={v.id} roleLabel={idx === 0 ? 'Victim' : `Victim ${idx + 1}`} person={toHeroPerson(v)} tagVariant="victim" />
              ))}
              {detail.allegedViolators?.map((v, idx) => (
                <HeroPersonCard key={v.id} roleLabel={idx === 0 ? 'Alleged Violator' : `Alleged Violator ${idx + 1}`} person={toHeroPerson(v)} tagVariant="violator" />
              ))}
            </div>
          </div>

          {detail.evidence?.length > 0 && (
            <div className="detail-section-card" style={{ marginTop: 16 }}>
              <h3 className="section-card-title"><Paperclip size={14} /> Evidence</h3>
              <div className="evidence-file-list">
                {detail.evidence.map((doc) => (
                  <a key={doc.id} href={doc.openUrl} target="_blank" rel="noreferrer" className="evidence-file-row">
                    <Paperclip size={14} />
                    <div className="evidence-file-info">
                      <span className="evidence-file-name">{doc.fileName}</span>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {detail.activities?.length > 0 && (
            <div className="detail-section-card" style={{ marginTop: 16 }}>
              <h3 className="section-card-title">Activity</h3>
              <div className="activity-vertical-timeline">
                {detail.activities.map((a) => (
                  <div key={a.id} className="activity-timeline-item">
                    <span className="activity-node-icon"><span className="activity-node-dot" /></span>
                    <div className="activity-item-content">
                      <div className="activity-item-header">{a.title}</div>
                      <div className="activity-item-date">{new Date(a.occurredAt).toLocaleString()}</div>
                      {a.description && <p className="review-summary-line" style={{ marginTop: 4 }}>{a.description}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      <WithdrawModal open={showWithdraw} onClose={() => setShowWithdraw(false)} onConfirm={handleWithdrawConfirm} />
      <SuccessModal
        open={withdrawSuccess}
        message="Your complaint has been withdrawn."
        onClose={() => { setWithdrawSuccess(false); setSelectedId(''); setSearchCollapsed(false); }}
      />
    </AppShell>
  );
}
