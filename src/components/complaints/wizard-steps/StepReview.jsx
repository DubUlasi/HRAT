import React from 'react';
import { ChevronDown, Pencil, MapPin, Calendar, Paperclip } from 'lucide-react';
import { useTranslation } from '../../../context/I18nContext';
import { CATEGORY_LABELS, CATEGORY_COLOR } from '../../../constants/complaintCategories';
import { getSubCategories } from '../../../constants/complaintSubCategories';
import { getKeyPopulation } from '../../../constants/keyPopulations';

// Step 5 of 5 — "Review & Submit". Summarizes steps 1-4 (all state lives in the parent, so
// nothing is lost navigating back via the Edit links), plus the Preferred Handling Office
// select relocated here from the old final step, and the Submit button.
export default function StepReview({
  category,
  subCategory,
  incident,
  victim,
  violator,
  office,
  onOfficeChange,
  onEditStep,
  onBack,
  onSubmit,
  submitting,
  stepLabel,
}) {
  const { t } = useTranslation();
  const subCategoryLabel = getSubCategories(category).find((o) => o.value === subCategory)?.label;
  const categoryColor = CATEGORY_COLOR[category] || 'info';
  const selectedPopulation = getKeyPopulation(victim.keyPopulationGroup);

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
            <span className="review-summary-title">{t('wizard.review.sectionIncident')}</span>
            <button type="button" className="review-edit-link" onClick={() => onEditStep(2)}>
              <Pencil size={12} /> {t('wizard.review.edit')}
            </button>
          </div>
          <div className="review-summary-body">
            <p className="review-summary-line strong">{incident.subject}</p>
            <p className="review-summary-line">{incident.description}</p>
            {incident.location && <p className="review-summary-meta"><MapPin size={12} /> {incident.location}</p>}
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
            <span className="review-summary-title">{t('wizard.review.sectionVictim')}</span>
            <button type="button" className="review-edit-link" onClick={() => onEditStep(3)}>
              <Pencil size={12} /> {t('wizard.review.edit')}
            </button>
          </div>
          <div className="review-summary-body">
            <p className="review-summary-line strong">{victim.firstName} {victim.lastName}</p>
            <p className="review-summary-meta">{victim.phone}</p>
            {victim.address && <p className="review-summary-meta"><MapPin size={12} /> {victim.address}</p>}
            {selectedPopulation && <p className="review-summary-meta">{selectedPopulation.label}</p>}
          </div>
        </div>

        <div className="review-summary-card">
          <div className="review-summary-header">
            <span className="review-summary-title">{t('wizard.review.sectionViolator')}</span>
            <button type="button" className="review-edit-link" onClick={() => onEditStep(4)}>
              <Pencil size={12} /> {t('wizard.review.edit')}
            </button>
          </div>
          <div className="review-summary-body">
            <p className="review-summary-line strong">{violator.firstName} {violator.lastName}</p>
            {violator.phone && <p className="review-summary-meta">{violator.phone}</p>}
            {violator.address && <p className="review-summary-meta"><MapPin size={12} /> {violator.address}</p>}
          </div>
        </div>

        <div className="su-field-group full-width" style={{ marginTop: 4 }}>
          <label className="su-label-dark">{t('wizard.review.officeLabel')}</label>
          <div className="su-select-wrap">
            <select
              className="su-input-white su-select"
              value={office}
              onChange={(e) => onOfficeChange(e.target.value)}
            >
              <option value="">{t('common.selectOffice')}</option>
              <option value="abuja">{t('wizard.review.offices.abuja')}</option>
              <option value="lagos">{t('wizard.review.offices.lagos')}</option>
              <option value="kano">{t('wizard.review.offices.kano')}</option>
              <option value="enugu">{t('wizard.review.offices.enugu')}</option>
              <option value="rivers">{t('wizard.review.offices.rivers')}</option>
            </select>
            <ChevronDown className="su-select-chevron" size={16} />
          </div>
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
