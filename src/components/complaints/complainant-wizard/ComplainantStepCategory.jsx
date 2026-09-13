import React from 'react';
import { ArrowRight, Check, AlertCircle } from 'lucide-react';
import { CATEGORY_ICONS } from '../../../constants/complaintCategories';

// Same tile+pill picker UX as the mock wizard's StepCategory, sourcing options from the real
// GET /complaint-form/options response instead of the local CATEGORY_LABELS/SUB_CATEGORIES
// constants — icons still come from the local CATEGORY_ICONS map, keyed by the category's own
// `code` (assumed to line up with the mock constants' category keys; falls back to a generic
// icon if a code doesn't match).
export default function ComplainantStepCategory({ categories, value, onChange, onContinue, error }) {
  const selectedCategory = categories.find((c) => c.id === value.categoryId);
  const subOptions = selectedCategory?.subcategories || [];
  const selectedSub = subOptions.find((s) => s.id === value.subcategoryId);
  const isOtherDescribed = !!selectedSub?.allowsCustomDescription;
  const canContinue = !!value.subcategoryId && (!isOtherDescribed || !!value.customDescription?.trim());

  const handleSelectCategory = (cat) => {
    if (cat.id === value.categoryId) return;
    onChange({ categoryId: cat.id, subcategoryId: '', customDescription: '' });
  };

  return (
    <div className="su-step active">
      <div className="su-heading left-align">
        <div className="su-step-label">Step 1 of 6</div>
        <h1 className="su-title-dark">What happened?</h1>
        <p className="su-subtitle">Select the category that best describes what you experienced.</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onContinue(); }}>
        <div className="category-tile-grid">
          {categories.map((cat) => {
            const Icon = CATEGORY_ICONS[cat.code] || AlertCircle;
            const isSelected = value.categoryId === cat.id;
            return (
              <button
                type="button"
                key={cat.id}
                className={`category-tile ${isSelected ? 'selected' : ''}`}
                onClick={() => handleSelectCategory(cat)}
              >
                {isSelected && <span className="category-tile-check"><Check size={11} /></span>}
                <span className="category-tile-icon"><Icon size={22} /></span>
                <span className="category-tile-label">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {selectedCategory && (
          <div className="sub-category-section">
            <div className="su-section-label">What best describes it?</div>
            <div className="sub-category-list">
              {subOptions.map((opt) => {
                const isSelected = value.subcategoryId === opt.id;
                return (
                  <button
                    type="button"
                    key={opt.id}
                    className={`sub-category-pill ${isSelected ? 'selected' : ''}`}
                    onClick={() => onChange({ subcategoryId: opt.id, customDescription: '' })}
                  >
                    <span>{opt.name}</span>
                    {isSelected && <span className="sub-category-pill-check"><Check size={13} /></span>}
                  </button>
                );
              })}
            </div>

            {isOtherDescribed && (
              <div className="su-field-group full-width" style={{ marginTop: 12 }}>
                <label className="su-label-dark">
                  Please describe <span className="su-req-red">*</span>
                </label>
                <textarea
                  className="su-textarea-white"
                  rows="3"
                  placeholder="Briefly describe what this is about"
                  value={value.customDescription || ''}
                  onChange={(e) => onChange({ customDescription: e.target.value })}
                  required
                />
              </div>
            )}
          </div>
        )}

        {error && (
          <p className="su-field-hint-dark" style={{ color: 'var(--danger-color)', marginTop: 12 }}>{error}</p>
        )}

        <div className="su-step-nav">
          <span />
          <button type="submit" className="su-btn-purple-pill" disabled={!canContinue}>
            Continue <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
