import React from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { useTranslation } from '../../../context/I18nContext';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../../constants/complaintCategories';
import { getSubCategories } from '../../../constants/complaintSubCategories';

// Step 1 of 6 — "What happened?" A 3-column icon+label tile grid drives the top-level
// CATEGORY_LABELS (the single source of truth, not a separate hardcoded list), then reveals a
// vertical pill list of sub-categories specific to whichever category was picked. Picking the
// Others category's "Other (Please Describe in Details)" pill reveals a free-text field — the
// typed text stands in for "what best describes it" everywhere that would otherwise show the
// picked pill's own label (the Review step, and the incident title default in
// ComplaintWizardForm), so it's required before continuing.
export default function StepCategory({ category, subCategory, otherDescription, onOtherDescriptionChange, onCategoryChange, onSubCategoryChange, onBack, onContinue, stepLabel }) {
  const { t } = useTranslation();
  const subOptions = getSubCategories(category);
  const isOtherDescribed = subCategory === 'other_described';
  const canContinue = !!category && !!subCategory && (!isOtherDescribed || !!otherDescription.trim());

  const handleSelectCategory = (key) => {
    if (key === category) return;
    onCategoryChange(key);
    onSubCategoryChange('');
  };

  return (
    <div className="su-step active">
      <div className="su-heading left-align">
        <div className="su-step-label">{stepLabel}</div>
        <h1 className="su-title-dark">{t('wizard.category.title')}</h1>
        <p className="su-subtitle">{t('wizard.category.subtitle')}</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onContinue(); }}>
        <div className="category-tile-grid">
          {Object.keys(CATEGORY_LABELS).map((key) => {
            const Icon = CATEGORY_ICONS[key];
            const isSelected = category === key;
            return (
              <button
                type="button"
                key={key}
                className={`category-tile ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectCategory(key)}
              >
                {isSelected && <span className="category-tile-check"><Check size={11} /></span>}
                <span className="category-tile-icon"><Icon size={22} /></span>
                <span className="category-tile-label">{CATEGORY_LABELS[key]}</span>
              </button>
            );
          })}
        </div>

        {category && (
          <div className="sub-category-section">
            <div className="su-section-label">{t('wizard.category.subLabel')}</div>
            <div className="sub-category-list">
              {subOptions.map((opt) => {
                const isSelected = subCategory === opt.value;
                return (
                  <button
                    type="button"
                    key={opt.value}
                    className={`sub-category-pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => onSubCategoryChange(opt.value)}
                  >
                    <span>{opt.label}</span>
                    {isSelected && <span className="sub-category-pill-check"><Check size={13} /></span>}
                  </button>
                );
              })}
            </div>

            {isOtherDescribed && (
              <div className="su-field-group full-width" style={{ marginTop: 12 }}>
                <label className="su-label-dark">
                  {t('wizard.category.otherDescribeLabel')} <span className="su-req-red">*</span>
                </label>
                <textarea
                  className="su-textarea-white"
                  rows="3"
                  placeholder={t('wizard.category.otherDescribePlaceholder')}
                  value={otherDescription}
                  onChange={(e) => onOtherDescriptionChange(e.target.value)}
                  required
                />
              </div>
            )}
          </div>
        )}

        <div className="su-step-nav">
          {onBack ? (
            <button type="button" className="su-btn-light-pill" onClick={onBack}>{t('common.back')}</button>
          ) : <span />}
          <button type="submit" className="su-btn-purple-pill" disabled={!canContinue}>
            {t('common.continue')} <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
