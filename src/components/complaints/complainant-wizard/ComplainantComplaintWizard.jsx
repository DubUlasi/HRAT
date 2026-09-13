import React, { useEffect, useState } from 'react';
import { Check, FileClock, FilePlus2 } from 'lucide-react';
import SuccessModal from '../../ui/SuccessModal';
import {
  createComplaintDraft, listComplaintDrafts, getComplaintDraft, abandonComplaintDraft,
  getComplaintFormOptions, getComplaintFilingProfile,
  saveComplaintCategory, saveComplaintIncident, saveComplaintVictims, saveComplaintViolators,
  uploadComplaintEvidence, removeComplaintEvidence, completeComplaintEvidence,
  getComplaintReview, savePreferredHandlingOffice, submitComplaintDraft,
  COMPLAINT_DRAFT_STEP, VICTIM_SOURCE_TYPE, POPULATION_CLASSIFICATION, ALLEGED_VIOLATOR_TYPE, VIOLATOR_IDENTIFICATION_STATUS, FILING_PARTY_TYPE,
} from '../../../api/complainantApi';
import ComplainantStepCategory from './ComplainantStepCategory';
import ComplainantStepIncident from './ComplainantStepIncident';
import ComplainantStepVictims from './ComplainantStepVictims';
import ComplainantStepViolators from './ComplainantStepViolators';
import ComplainantStepEvidence from './ComplainantStepEvidence';
import ComplainantStepReview from './ComplainantStepReview';
import { toAddressInput } from './AddressPicker';
import '../../../styles/signup.css';

// Real, draft-based complainant filing flow — deliberately separate from ComplaintWizardForm
// (the mock/staff-facing wizard, untouched by this). Same six-step shape, but every "Continue"
// here saves to the real backend draft (create draft -> per-step PUT with revision tracking ->
// evidence upload -> submit) instead of just patching local state. See the "Wire the frontend up
// to the real HRAT backend API" plan, Phase 2, for the full design this implements.
const WIZARD_STEPS = [
  { num: 1, label: 'Category' },
  { num: 2, label: 'Incident' },
  { num: 3, label: 'Victim' },
  { num: 4, label: 'Violator' },
  { num: 5, label: 'Evidence' },
  { num: 6, label: 'Review' },
];

function emptyIndividualViolator() {
  return { firstName: '', lastName: '', dateOfBirth: '', phoneNumber: '', gender: '', email: '', address: null };
}

function emptyViolatorEntry() {
  return {
    identificationStatus: VIOLATOR_IDENTIFICATION_STATUS.KNOWN,
    type: ALLEGED_VIOLATOR_TYPE.INDIVIDUAL,
    individual: emptyIndividualViolator(),
    organisation: { organisationName: '', phoneNumber: '', email: '', address: null },
    officer: { firstName: '', lastName: '', dateOfBirth: '', agency: '', rankOrServiceNumber: '', phoneNumber: '', email: '', address: null },
  };
}

function emptyVictimEntry() {
  return {
    relationship: 'self', // local-only, drives sourceType + prefill — not sent to the API directly
    sourceType: VICTIM_SOURCE_TYPE.CURRENT_COMPLAINANT,
    firstName: '', lastName: '', phoneNumber: '', gender: '', dateOfBirth: '', email: '',
    address: null,
    populationClassification: POPULATION_CLASSIFICATION.GENERAL,
    keyPopulations: [],
  };
}

// Prefills the primary victim from the signed-in account — same "Myself" default the mock
// wizard uses for a complainant, for a brand-new draft with no victims saved yet.
function victimFromProfile(p) {
  return {
    ...emptyVictimEntry(),
    firstName: p.firstName || '',
    lastName: p.lastName || '',
    phoneNumber: p.phoneNumber || '',
    email: p.email || '',
    gender: p.gender || '',
    address: p.address ? { addressLine: p.address.addressLine || '', city: p.address.city || '', stateId: p.address.stateId || '', localGovernmentAreaId: p.address.localGovernmentAreaId || '' } : null,
  };
}

// Reverses a GET .../complaint-drafts/{id} snapshot back into this component's per-step local
// state shapes. Every field name below already matches the wire format 1:1 (the same
// Individual/Organisation/OfficerViolatorInput and AddressData/AddressInput shapes are used for
// both saving and reading — see complainantApi.js's wire-format note), so this is mostly a
// straight spread rather than a real transform; the one derived value is categoryId, which the
// snapshot doesn't carry directly (only subcategoryId), found by searching the loaded categories
// for whichever one owns that subcategory.
function hydrateFromDraft(snapshot, categories, profile) {
  const subcategoryId = snapshot.subcategoryId || '';
  const categoryId = subcategoryId
    ? (categories.find((c) => c.subcategories?.some((s) => s.id === subcategoryId))?.id || '')
    : '';

  const category = { categoryId, subcategoryId, customDescription: snapshot.customSubcategoryDescription || '' };

  const incident = {
    title: snapshot.incident?.title || '',
    description: snapshot.incident?.description || '',
    location: snapshot.incident?.location || null,
    occurredOn: snapshot.incident?.occurredOn || '',
  };

  const filedBy = {
    filingPartyType: snapshot.filingPartyType || FILING_PARTY_TYPE.INDIVIDUAL,
    groupName: snapshot.groupName || '',
    representative: snapshot.groupRepresentative || { name: '', phoneNumber: '', email: '' },
  };

  const victims = snapshot.victims?.length
    ? snapshot.victims.map((v) => ({
        relationship: v.sourceType === VICTIM_SOURCE_TYPE.CURRENT_COMPLAINANT ? 'self' : 'other',
        ...v,
      }))
    : [victimFromProfile(profile)];

  const violators = snapshot.allegedViolators?.length
    ? snapshot.allegedViolators.map((v) => ({
        identificationStatus: v.identificationStatus,
        type: v.type,
        individual: { ...emptyIndividualViolator(), ...v.individual },
        organisation: { organisationName: '', phoneNumber: '', email: '', address: null, ...v.organisation },
        officer: { firstName: '', lastName: '', dateOfBirth: '', agency: '', rankOrServiceNumber: '', phoneNumber: '', email: '', address: null, ...v.officer },
      }))
    : [emptyViolatorEntry()];

  return {
    category, incident, filedBy, victims, violators,
    evidenceFiles: snapshot.evidence || [],
    officeId: snapshot.preferredHandlingOfficeId || '',
  };
}

export default function ComplainantComplaintWizard({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(null);

  const [draft, setDraft] = useState(null); // { id, revision }
  const [formOptions, setFormOptions] = useState(null);
  const [filingProfile, setFilingProfile] = useState(null);

  const [category, setCategory] = useState({ categoryId: '', subcategoryId: '', customDescription: '' });
  const [incident, setIncident] = useState({ title: '', description: '', location: null, occurredOn: '' });
  const [filedBy, setFiledBy] = useState({
    filingPartyType: FILING_PARTY_TYPE.INDIVIDUAL,
    groupName: '',
    representative: { name: '', phoneNumber: '', email: '' },
  });
  const [victims, setVictims] = useState([emptyVictimEntry()]);
  const [violators, setViolators] = useState([emptyViolatorEntry()]);
  const [evidenceFiles, setEvidenceFiles] = useState([]); // already-uploaded evidence metadata from the API
  const [officeId, setOfficeId] = useState('');
  const [reviewData, setReviewData] = useState(null);

  const [stepError, setStepError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null); // null | 'success' | 'error'
  const [submittedComplaint, setSubmittedComplaint] = useState(null);

  // An in-progress draft found on mount (GET /complaint-drafts, most-recently-updated first) —
  // set only long enough to show the "resume or start fresh" choice below; once the user picks
  // either path this goes back to null and the wizard proper renders.
  const [pendingDraft, setPendingDraft] = useState(null);
  const [resolving, setResolving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    Promise.all([listComplaintDrafts(), getComplaintFormOptions(), getComplaintFilingProfile()])
      .then(([draftsResult, optionsResult, profileResult]) => {
        if (cancelled) return;
        setFormOptions(optionsResult.options);
        setFilingProfile(profileResult.profile);
        const drafts = draftsResult.drafts || [];
        if (drafts.length > 0) {
          setPendingDraft(drafts[0]);
          setLoading(false);
          return;
        }
        return startFreshDraft(profileResult.profile).then(() => { if (!cancelled) setLoading(false); });
      })
      .catch((err) => { if (!cancelled) setLoadError(err.message || 'Could not start a new complaint, please try again.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startFreshDraft = async (profile) => {
    const draftResult = await createComplaintDraft();
    setDraft({ id: draftResult.draft.id, revision: draftResult.draft.revision });
    // Prefill the primary victim from the signed-in account, same "Myself" default the mock
    // wizard uses for a complainant — they can still switch to "Someone else" and clear it.
    setVictims([victimFromProfile(profile)]);
  };

  const handleResumeDraft = async () => {
    setResolving(true);
    setLoadError(null);
    try {
      const { draft: snapshot } = await getComplaintDraft(pendingDraft.id);
      const hydrated = hydrateFromDraft(snapshot, formOptions.categories, filingProfile);
      setDraft({ id: pendingDraft.id, revision: snapshot.summary.revision });
      setCategory(hydrated.category);
      setIncident(hydrated.incident);
      setFiledBy(hydrated.filedBy);
      setVictims(hydrated.victims);
      setViolators(hydrated.violators);
      setEvidenceFiles(hydrated.evidenceFiles);
      setOfficeId(hydrated.officeId);

      let step = pendingDraft.nextStep || (pendingDraft.lastCompletedStep ? pendingDraft.lastCompletedStep + 1 : COMPLAINT_DRAFT_STEP.CATEGORY);
      step = Math.min(Math.max(step, COMPLAINT_DRAFT_STEP.CATEGORY), COMPLAINT_DRAFT_STEP.REVIEW);
      if (step === COMPLAINT_DRAFT_STEP.REVIEW) {
        try {
          const review = await getComplaintReview(pendingDraft.id);
          setReviewData(review.review);
          setOfficeId(review.review.preferredHandlingOfficeId || hydrated.officeId);
        } catch {
          // Evidence stage wasn't actually completed server-side yet, despite the draft summary
          // pointing at Review — land on Evidence instead rather than showing a blank step 6.
          step = COMPLAINT_DRAFT_STEP.EVIDENCE;
        }
      }
      setCurrentStep(step);
      setPendingDraft(null);
    } catch (err) {
      setLoadError(err.problem?.detail || err.message || 'Could not resume that draft, please try again.');
    }
    setResolving(false);
  };

  const handleStartNew = async () => {
    setResolving(true);
    setLoadError(null);
    try {
      // Best-effort — an old draft failing to abandon shouldn't block starting a new one.
      await abandonComplaintDraft(pendingDraft.id, pendingDraft.revision).catch(() => {});
      await startFreshDraft(filingProfile);
      setPendingDraft(null);
    } catch (err) {
      setLoadError(err.problem?.detail || err.message || 'Could not start a new complaint, please try again.');
    }
    setResolving(false);
  };

  const applyRevision = (result) => setDraft((d) => ({ ...d, revision: result.draft.revision }));

  const goToStep = (n) => { setStepError(''); setCurrentStep(n); };

  const handleCategoryContinue = async () => {
    setStepError('');
    try {
      const result = await saveComplaintCategory(draft.id, {
        revision: draft.revision,
        subcategoryId: category.subcategoryId,
        customDescription: category.customDescription || null,
      });
      applyRevision(result);
      goToStep(2);
    } catch (err) {
      setStepError(err.problem?.detail || err.message);
    }
  };

  const handleIncidentContinue = async () => {
    setStepError('');
    try {
      const result = await saveComplaintIncident(draft.id, {
        revision: draft.revision,
        title: incident.title,
        description: incident.description,
        location: toAddressInput(incident.location),
        occurredOn: incident.occurredOn || null,
      });
      applyRevision(result);
      goToStep(3);
    } catch (err) {
      setStepError(err.problem?.detail || err.message);
    }
  };

  const handleVictimsContinue = async () => {
    setStepError('');
    try {
      // The live API rejects groupName/representative outright — even empty strings/objects —
      // when filingPartyType isn't GroupOrCommittee ("Group information is only accepted when
      // filing for a group"), the opposite of what the OpenAPI schema's required-fields list
      // implied. Only include them for an actual group filing.
      const isGroup = filedBy.filingPartyType === FILING_PARTY_TYPE.GROUP_OR_COMMITTEE;
      const result = await saveComplaintVictims(draft.id, {
        revision: draft.revision,
        filingPartyType: filedBy.filingPartyType,
        groupName: isGroup ? filedBy.groupName : null,
        representative: isGroup ? filedBy.representative : null,
        victims: victims.map((v) => ({
          sourceType: v.relationship === 'self' ? VICTIM_SOURCE_TYPE.CURRENT_COMPLAINANT : VICTIM_SOURCE_TYPE.PROVIDED_PERSON,
          firstName: v.firstName, lastName: v.lastName, phoneNumber: v.phoneNumber, gender: v.gender,
          dateOfBirth: v.dateOfBirth || null, email: v.email || null,
          address: toAddressInput(v.address), populationClassification: v.populationClassification, keyPopulations: v.keyPopulations,
        })),
      });
      applyRevision(result);
      goToStep(4);
    } catch (err) {
      setStepError(err.problem?.detail || err.message);
    }
  };

  const handleViolatorsContinue = async () => {
    setStepError('');
    try {
      const result = await saveComplaintViolators(draft.id, {
        revision: draft.revision,
        allegedViolators: violators.map((v) => {
          // Send the COMPUTED type here, not the raw local v.type — v.type stays whatever it was
          // last set to (defaults to Individual) even after switching to "Unidentified", so
          // checking it directly would incorrectly still attach the individual/organisation/
          // officer sub-object (with empty-string fields the API then rejects) for an
          // unidentified violator, who should get all three as null.
          const effectiveType = v.identificationStatus === VIOLATOR_IDENTIFICATION_STATUS.UNIDENTIFIED ? ALLEGED_VIOLATOR_TYPE.UNKNOWN : v.type;
          return {
            identificationStatus: v.identificationStatus,
            type: effectiveType,
            individual: effectiveType === ALLEGED_VIOLATOR_TYPE.INDIVIDUAL
              ? { ...v.individual, dateOfBirth: v.individual.dateOfBirth || null, address: toAddressInput(v.individual.address) }
              : null,
            organisation: effectiveType === ALLEGED_VIOLATOR_TYPE.ORGANISATION
              ? { ...v.organisation, address: toAddressInput(v.organisation.address) }
              : null,
            officer: effectiveType === ALLEGED_VIOLATOR_TYPE.PUBLIC_OFFICER
              ? { ...v.officer, dateOfBirth: v.officer.dateOfBirth || null, address: toAddressInput(v.officer.address) }
              : null,
          };
        }),
      });
      applyRevision(result);
      goToStep(5);
    } catch (err) {
      setStepError(err.problem?.detail || err.message);
    }
  };

  const handleUploadFiles = async (files) => {
    const result = await uploadComplaintEvidence(draft.id, files, draft.revision);
    setDraft((d) => ({ ...d, revision: result.upload.revision }));
    setEvidenceFiles((prev) => [...prev, ...result.upload.files]);
  };

  const handleRemoveFile = async (evidenceId) => {
    const result = await removeComplaintEvidence(draft.id, evidenceId, draft.revision);
    applyRevision(result);
    setEvidenceFiles((prev) => prev.filter((f) => f.id !== evidenceId));
  };

  const handleEvidenceContinue = async () => {
    setStepError('');
    try {
      const result = await completeComplaintEvidence(draft.id, draft.revision);
      applyRevision(result);
      const review = await getComplaintReview(draft.id);
      setReviewData(review.review);
      setOfficeId(review.review.preferredHandlingOfficeId || '');
      goToStep(6);
    } catch (err) {
      setStepError(err.problem?.detail || err.message);
    }
  };

  const handleOfficeChange = async (id) => {
    setOfficeId(id);
    try {
      const result = await savePreferredHandlingOffice(draft.id, id, draft.revision);
      applyRevision(result);
    } catch (err) {
      setStepError(err.problem?.detail || err.message);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setStepError('');
    try {
      const result = await submitComplaintDraft(draft.id, draft.revision);
      setSubmittedComplaint(result.complaint);
      setSubmitResult('success');
    } catch (err) {
      setStepError(err.problem?.detail || err.message);
      setSubmitResult('error');
    }
    setSubmitting(false);
  };

  const handleFeedbackClose = () => {
    const wasSuccess = submitResult === 'success';
    setSubmitResult(null);
    if (wasSuccess) onComplete(submittedComplaint);
  };

  if (loading) {
    return (
      <main className="su-main"><div className="su-content"><p className="su-subtitle">Starting your complaint...</p></div></main>
    );
  }

  if (pendingDraft) {
    return (
      <main className="su-main">
        <div className="su-content">
          <div className="su-step active">
            <div className="su-heading left-align">
              <h1 className="su-title-dark">Continue where you left off?</h1>
              <p className="su-subtitle">
                You have a complaint draft in progress{pendingDraft.category ? ` (${pendingDraft.category})` : ''}, last updated {new Date(pendingDraft.updatedAt).toDateString()}.
              </p>
            </div>

            {loadError && <p className="su-field-hint-dark" style={{ color: 'var(--danger-color)', marginTop: 12 }}>{loadError}</p>}

            <div className="resume-draft-choice-row" style={{ display: 'flex', gap: 12, marginTop: 20 }}>
              <button type="button" className="su-btn-purple-pill" onClick={handleResumeDraft} disabled={resolving}>
                <FileClock size={18} /> {resolving ? 'Loading...' : 'Resume Draft'}
              </button>
              <button type="button" className="su-btn-light-pill" onClick={handleStartNew} disabled={resolving}>
                <FilePlus2 size={18} /> Start New Complaint
              </button>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (loadError) {
    return (
      <main className="su-main"><div className="su-content"><p className="su-subtitle">{loadError}</p></div></main>
    );
  }

  return (
    <>
      <div className="wizard-stepper-bar">
        {WIZARD_STEPS.map((step, idx) => {
          const reached = step.num <= currentStep;
          const isCurrent = step.num === currentStep;
          return (
            <React.Fragment key={step.num}>
              {idx > 0 && <div className={`wizard-step-connector ${step.num <= currentStep ? 'filled' : ''}`} />}
              <button
                type="button"
                className={`wizard-step-node ${reached ? 'reached' : ''} ${isCurrent ? 'current' : ''}`}
                onClick={() => reached && goToStep(step.num)}
                disabled={!reached}
              >
                <span className="wizard-step-circle">{reached && !isCurrent ? <Check size={14} /> : step.num}</span>
                <span className="wizard-step-label">{step.label}</span>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      <main className="su-main">
        <div className="su-content">
          {currentStep === 1 && (
            <ComplainantStepCategory
              categories={formOptions.categories}
              value={category}
              onChange={(patch) => setCategory((c) => ({ ...c, ...patch }))}
              onContinue={handleCategoryContinue}
              error={stepError}
            />
          )}

          {currentStep === 2 && (
            <ComplainantStepIncident
              states={formOptions.states}
              value={incident}
              onChange={(patch) => setIncident((i) => ({ ...i, ...patch }))}
              onBack={() => goToStep(1)}
              onContinue={handleIncidentContinue}
              error={stepError}
            />
          )}

          {currentStep === 3 && (
            <ComplainantStepVictims
              states={formOptions.states}
              keyPopulations={formOptions.keyPopulations}
              genders={formOptions.genders}
              victims={victims}
              onChange={(idx, patch) => setVictims((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)))}
              onAdd={() => setVictims((prev) => [...prev, { ...emptyVictimEntry(), relationship: 'other' }])}
              onRemove={(idx) => setVictims((prev) => prev.filter((_, i) => i !== idx))}
              filedBy={filedBy}
              onFiledByChange={(patch) => setFiledBy((f) => ({ ...f, ...patch }))}
              onBack={() => goToStep(2)}
              onContinue={handleVictimsContinue}
              error={stepError}
            />
          )}

          {currentStep === 4 && (
            <ComplainantStepViolators
              states={formOptions.states}
              violators={violators}
              onChange={(idx, patch) => setViolators((prev) => prev.map((v, i) => (i === idx ? { ...v, ...patch } : v)))}
              onAdd={() => setViolators((prev) => [...prev, emptyViolatorEntry()])}
              onRemove={(idx) => setViolators((prev) => prev.filter((_, i) => i !== idx))}
              onBack={() => goToStep(3)}
              onContinue={handleViolatorsContinue}
              error={stepError}
            />
          )}

          {currentStep === 5 && (
            <ComplainantStepEvidence
              files={evidenceFiles}
              onUpload={handleUploadFiles}
              onRemove={handleRemoveFile}
              onBack={() => goToStep(4)}
              onContinue={handleEvidenceContinue}
              error={stepError}
            />
          )}

          {currentStep === 6 && reviewData && (
            <ComplainantStepReview
              review={reviewData}
              officeId={officeId}
              onOfficeChange={handleOfficeChange}
              onEditStep={goToStep}
              onBack={() => goToStep(5)}
              onSubmit={handleSubmit}
              submitting={submitting}
              error={stepError}
            />
          )}
        </div>
      </main>

      <SuccessModal
        open={submitResult === 'success'}
        title="Complaint Submitted"
        message={submittedComplaint ? `Your complaint number is ${submittedComplaint.complaintNumber}. You can track its progress from your dashboard.` : ''}
        okLabel="OK"
        onClose={handleFeedbackClose}
      />
      <SuccessModal
        open={submitResult === 'error'}
        variant="error"
        title="Something Went Wrong"
        message={stepError || 'Please try again.'}
        okLabel="OK"
        onClose={() => setSubmitResult(null)}
      />
    </>
  );
}
