import React from 'react';
import { ChevronDown, Pencil, MapPin, Calendar, Paperclip, AlertTriangle } from 'lucide-react';

function formatAddress(addr) {
  if (!addr) return '';
  return [addr.addressLine, addr.city, addr.localGovernmentAreaName, addr.stateName].filter(Boolean).join(', ');
}

export default function ComplainantStepReview({ review, officeId, onOfficeChange, onEditStep, onBack, onSubmit, submitting, error }) {
  const recommendedOffice = review.recommendedOffices?.find((o) => o.selectionNotice)?.id;

  return (
    <div className="su-step active">
      <div className="su-heading left-align">
        <div className="su-step-label">Step 6 of 6</div>
        <h1 className="su-title-dark">Review & Submit</h1>
        <p className="su-subtitle">Check everything below before submitting your complaint.</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="review-summary-card">
          <div className="review-summary-header">
            <span className="review-summary-title">Category</span>
            <button type="button" className="review-edit-link" onClick={() => onEditStep(1)}><Pencil size={12} /> Edit</button>
          </div>
          <div className="review-summary-body">
            <span className="category-pill pill-info">{review.category}{review.subcategory ? ` — ${review.subcategory}` : ''}</span>
            {review.customSubcategoryDescription && <p className="review-summary-line">{review.customSubcategoryDescription}</p>}
          </div>
        </div>

        <div className="review-summary-card">
          <div className="review-summary-header">
            <span className="review-summary-title">Filed By</span>
            <button type="button" className="review-edit-link" onClick={() => onEditStep(3)}><Pencil size={12} /> Edit</button>
          </div>
          <div className="review-summary-body">
            {review.groupName ? (
              <>
                <p className="review-summary-line strong">{review.groupName}</p>
                {review.groupRepresentative && (
                  <p className="review-summary-meta">Represented by {review.groupRepresentative.name} · {review.groupRepresentative.phoneNumber}</p>
                )}
              </>
            ) : (
              <p className="review-summary-line">An Individual</p>
            )}
          </div>
        </div>

        <div className="review-summary-card">
          <div className="review-summary-header">
            <span className="review-summary-title">Incident Details</span>
            <button type="button" className="review-edit-link" onClick={() => onEditStep(2)}><Pencil size={12} /> Edit</button>
          </div>
          <div className="review-summary-body">
            <p className="review-summary-line strong">{review.incidentTitle}</p>
            <p className="review-summary-line">{review.incidentDescription}</p>
            {review.incidentLocation && (
              <p className="review-summary-meta"><MapPin size={12} /> {formatAddress(review.incidentLocation)}</p>
            )}
            {review.occurredOn && <p className="review-summary-meta"><Calendar size={12} /> {review.occurredOn}</p>}
            {review.evidence?.length > 0 && (
              <p className="review-summary-meta"><Paperclip size={12} /> {review.evidence.length} file{review.evidence.length === 1 ? '' : 's'} attached</p>
            )}
          </div>
        </div>

        <div className="review-summary-card">
          <div className="review-summary-header">
            <span className="review-summary-title">Victim{review.victims?.length > 1 ? `s (${review.victims.length})` : ''}</span>
            <button type="button" className="review-edit-link" onClick={() => onEditStep(3)}><Pencil size={12} /> Edit</button>
          </div>
          <div className="review-summary-body">
            {review.victims?.map((v) => (
              <div className="review-summary-person-block" key={v.id}>
                <p className="review-summary-line strong">{v.firstName} {v.lastName}</p>
                <p className="review-summary-meta">{v.phoneNumber}</p>
                {v.address && <p className="review-summary-meta"><MapPin size={12} /> {formatAddress(v.address)}</p>}
                {v.keyPopulationNames?.length > 0 && <p className="review-summary-meta">{v.keyPopulationNames.join(', ')}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="review-summary-card">
          <div className="review-summary-header">
            <span className="review-summary-title">Alleged Violator{review.allegedViolators?.length > 1 ? `s (${review.allegedViolators.length})` : ''}</span>
            <button type="button" className="review-edit-link" onClick={() => onEditStep(4)}><Pencil size={12} /> Edit</button>
          </div>
          <div className="review-summary-body">
            {review.allegedViolators?.map((v) => (
              <div className="review-summary-person-block" key={v.id}>
                <p className="review-summary-line strong">{v.displayName}</p>
                {v.phoneNumber && <p className="review-summary-meta">{v.phoneNumber}</p>}
                {v.address && <p className="review-summary-meta"><MapPin size={12} /> {formatAddress(v.address)}</p>}
              </div>
            ))}
          </div>
        </div>

        <div className="su-field-group full-width" style={{ marginTop: 4 }}>
          <label className="su-label-dark">Preferred Handling Office</label>
          <div className="su-select-wrap">
            <select
              className="su-input-white su-select"
              value={officeId}
              onChange={(e) => onOfficeChange(e.target.value)}
              required
            >
              <option value="">-- Select Office --</option>
              {review.recommendedOffices?.map((o) => (
                <option key={o.id} value={o.id}>{o.name}{o.id === recommendedOffice ? ' (Recommended)' : ''}</option>
              ))}
            </select>
            <ChevronDown className="su-select-chevron" size={16} />
          </div>
          {review.recommendedOffices?.find((o) => o.id === officeId)?.selectionNotice && (
            <p className="office-head-office-warning">
              <AlertTriangle size={13} /> {review.recommendedOffices.find((o) => o.id === officeId).selectionNotice}
            </p>
          )}
        </div>

        {error && (
          <p className="su-field-hint-dark" style={{ color: 'var(--danger-color)', marginTop: 12 }}>{error}</p>
        )}

        <div className="su-step-nav">
          <button type="button" className="su-btn-light-pill" onClick={onBack}>Back</button>
          <button type="submit" className="su-btn-green-submit" disabled={submitting || !officeId}>
            {submitting ? 'Submitting...' : 'Submit Complaint'}
          </button>
        </div>
      </form>
    </div>
  );
}
