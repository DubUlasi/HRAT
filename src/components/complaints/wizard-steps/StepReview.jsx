import React, { useEffect } from 'react';
import { ChevronDown, Pencil, MapPin, Calendar, Paperclip, AlertTriangle } from 'lucide-react';
import { useTranslation } from '../../../context/I18nContext';
import { CATEGORY_LABELS, CATEGORY_COLOR } from '../../../constants/complaintCategories';
import { getKeyPopulation } from '../../../constants/keyPopulations';
import { relevantOfficesForComplaint, recommendedOfficeForComplaint } from '../../../constants/officeRecommendation';

// Step 6 of 6 — "Review & Submit". Summarizes steps 1-5 (all state lives in the parent, so
// nothing is lost navigating back via the Edit links), plus the Preferred Handling Office
// select relocated here from the old final step, and the Submit button.
export default function StepReview({
  category,
  subCategoryLabel,
  incident,
  victims,
  violators,
  filedBy,
  office,
  onOfficeChange,
  onEditStep,
  onBack,
  onSubmit,
  submitting,
  stepLabel,
}) {
  const { t } = useTranslation();
  const categoryColor = CATEGORY_COLOR[category] || 'info';
  const relevantOffices = relevantOfficesForComplaint(incident.location, victims, violators);
  const recommendedOffice = recommendedOfficeForComplaint(incident.location, victims, violators);

  // If a previously-picked office falls out of the relevant set (e.g. the complainant went
  // back and changed a victim/violator address), clear it rather than silently submitting a
  // now-irrelevant office that's no longer even shown as an option.
  useEffect(() => {
    if (office && !relevantOffices.includes(office)) {
      onOfficeChange('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [relevantOffices.join('|')]);

  return (
    <div className="su-step active">
      <div className="su-heading left-align">
        <div className="su-step-label">{stepLabel}</div>
        <h1 className="su-title-dark">{t('wizard.review.title')}</h1>
        <p className="su-subtitle">{t('wizard.review.subtitle')}</p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="review-summary-card">
          <div className="review-summary-header">
            <span className="review-summary-title">{t('wizard.review.sectionCategory')}</span>
            <button type="button" className="review-edit-link" onClick={() => onEditStep(1)}>
              <Pencil size={12} /> {t('wizard.review.edit')}
            </button>
          </div>
          <div className="review-summary-body">
            <span className={`category-pill pill-${categoryColor}`}>{CATEGORY_LABELS[category]}</span>
            {subCategoryLabel && <p className="review-summary-line">{subCategoryLabel}</p>}
          </div>
        </div>

        <div className="review-summary-card">
          <div className="review-summary-header">
            <span className="review-summary-title">{t('wizard.review.sectionFiledBy')}</span>
            <button type="button" className="review-edit-link" onClick={() => onEditStep(3)}>
              <Pencil size={12} /> {t('wizard.review.edit')}
            </button>
          </div>
          <div className="review-summary-body">
            {filedBy.type === 'group' ? (
              <>
                <p className="review-summary-line strong">{filedBy.groupName}</p>
                <p className="review-summary-meta">{t('wizard.review.filedByGroupRepresentedBy', { name: filedBy.representativeName })}</p>
                {filedBy.representativePhone && <p className="review-summary-meta">{filedBy.representativePhone}</p>}
              </>
            ) : (
              <p className="review-summary-line">{t('wizard.review.filedByIndividual')}</p>
            )}
          </div>
        </div>

        <div className="review-summary-card">
          <div className="review-summary-header">
            <span className="review-summary-title">{t('wizard.review.sectionIncident')}</span>
            <button type="button" className="review-edit-link" onClick={() => onEditStep(2)}>
              <Pencil size={12} /> {t('wizard.review.edit')}
            </button>
          </div>
          <div className="review-summary-body">
            <p className="review-summary-line strong">{incident.subject}</p>
            <p className="review-summary-line">{incident.description}</p>
            {incident.location && (
              <p className="review-summary-meta">
                <MapPin size={12} /> {incident.location}{incident.landmark ? ` (near ${incident.landmark})` : ''}
              </p>
            )}
            {incident.date && <p className="review-summary-meta"><Calendar size={12} /> {incident.date}</p>}
            {incident.evidenceFiles.length > 0 && (
              <p className="review-summary-meta">
                <Paperclip size={12} /> {incident.evidenceFiles.length} file{incident.evidenceFiles.length === 1 ? '' : 's'} attached
              </p>
            )}
          </div>
        </div>

        <div className="review-summary-card">
          <div className="review-summary-header">
            <span className="review-summary-title">
              {t('wizard.review.sectionVictim')}{victims.length > 1 ? ` (${victims.length})` : ''}
            </span>
            <button type="button" className="review-edit-link" onClick={() => onEditStep(3)}>
              <Pencil size={12} /> {t('wizard.review.edit')}
            </button>
          </div>
          <div className="review-summary-body">
            {victims.map((victim, index) => {
              const victimPopulation = getKeyPopulation(victim.keyPopulationGroup);
              return (
                <div className="review-summary-person-block" key={index}>
                  <p className="review-summary-line strong">{victim.firstName} {victim.lastName}</p>
                  <p className="review-summary-meta">{victim.phone}</p>
                  {victim.address && (
                    <p className="review-summary-meta">
                      <MapPin size={12} /> {victim.address}{victim.landmark ? ` (near ${victim.landmark})` : ''}
                    </p>
                  )}
                  {victimPopulation && <p className="review-summary-meta">{victimPopulation.label}</p>}
                </div>
              );
            })}
          </div>
        </div>

        <div className="review-summary-card">
          <div className="review-summary-header">
            <span className="review-summary-title">
              {t('wizard.review.sectionViolator')}{violators.length > 1 ? ` (${violators.length})` : ''}
            </span>
            <button type="button" className="review-edit-link" onClick={() => onEditStep(4)}>
              <Pencil size={12} /> {t('wizard.review.edit')}
            </button>
          </div>
          <div className="review-summary-body">
            {violators.map((violator, index) => (
              <div className="review-summary-person-block" key={index}>
                {violator.unidentified ? (
                  <p className="review-summary-line strong">{t('wizard.review.unidentifiedViolator')}</p>
                ) : (
                  <>
                    <p className="review-summary-line strong">{violator.firstName} {violator.lastName}</p>
                    {violator.phone && <p className="review-summary-meta">{violator.phone}</p>}
                    {violator.address && (
                      <p className="review-summary-meta">
                        <MapPin size={12} /> {violator.address}{violator.landmark ? ` (near ${violator.landmark})` : ''}
                      </p>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="su-field-group full-width" style={{ marginTop: 4 }}>
          <label className="su-label-dark">{t('wizard.review.officeLabel')}</label>
          <div className="su-select-wrap">
            <select
              className="su-input-white su-select"
              style={office && office === recommendedOffice ? { paddingRight: 118 } : undefined}
              value={office}
              onChange={(e) => onOfficeChange(e.target.value)}
            >
              <option value="">{t('common.selectOffice')}</option>
              {relevantOffices.map((officeId) => (
                <option key={officeId} value={officeId}>{t(`wizard.review.offices.${officeId}`)}</option>
              ))}
            </select>
            {office && office === recommendedOffice && (
              <span className="recommended-tag recommended-tag-inline">{t('wizard.review.recommendedTag')}</span>
            )}
            <ChevronDown className="su-select-chevron" size={16} />
          </div>
          {office === 'abuja' && (
            <p className="office-head-office-warning">
              <AlertTriangle size={13} /> {t('wizard.review.officeHeadOfficeWarning')}
            </p>
          )}
        </div>

        <div className="su-step-nav">
          <button type="button" className="su-btn-light-pill" onClick={onBack}>{t('common.back')}</button>
          <button type="submit" className="su-btn-green-submit" disabled={submitting}>
            {submitting ? t('wizard.review.submitting') : t('wizard.review.submitButton')}
          </button>
        </div>
      </form>
    </div>
  );
}
