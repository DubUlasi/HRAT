import React from 'react';
import { ArrowRight } from 'lucide-react';
import { useTranslation } from '../../../context/I18nContext';
import { CATEGORY_LABELS, CATEGORY_ICONS } from '../../../constants/complaintCategories';
import { getSubCategories } from '../../../constants/complaintSubCategories';

// Step 1 of 5 — "What happened?" A 3-column icon+label tile grid drives the top-level
// CATEGORY_LABELS (the single source of truth, not a separate hardcoded list), then reveals a
// vertical pill list of sub-categories specific to whichever category was picked.
export default function StepCategory({ category, subCategory, onCategoryChange, onSubCategoryChange, onBack, onContinue, stepLabel }) {
  const { t } = useTranslation();
  const subOptions = getSubCategories(category);
  const canContinue = !!category && !!subCategory;

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
            return (
              <button
                type="button"
                key={key}
                className={`category-tile ${category === key ? 'selected' : ''}`}
                onClick={() => handleSelectCategory(key)}
              >
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
              {subOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  className={`sub-category-pill ${subCategory === opt.value ? 'selected' : ''}`}
                  onClick={() => onSubCategoryChange(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
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
