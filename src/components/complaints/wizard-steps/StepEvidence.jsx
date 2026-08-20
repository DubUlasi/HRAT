import React from 'react';
import { ArrowRight, Upload, FileImage, FileVideo, FileText, X } from 'lucide-react';
import { useTranslation } from '../../../context/I18nContext';

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIconFor(file) {
  if (file.type.startsWith('image/')) return FileImage;
  if (file.type.startsWith('video/')) return FileVideo;
  return FileText;
}

// Step 5 of 6 — a second, standalone chance to attach evidence. StepIncidentDetails already
// offers the same upload folded into "Tell us more", but it's easy to miss there (one field
// among several, at the point the complainant is still focused on writing the description) — so
// this repeats the exact same control, bound to the same `incident.evidenceFiles`, as its own
// unmissable step right before Review. Purely additive: skipping here doesn't lose anything
// already attached back on step 2, and attaching here shows up back there too.
export default function StepEvidence({ value, onChange, onBack, onContinue, stepLabel }) {
  const { t } = useTranslation();

  const handleFilesAdded = (e) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length) onChange({ evidenceFiles: [...value.evidenceFiles, ...newFiles] });
    e.target.value = '';
  };

  const removeFile = (idx) => {
    onChange({ evidenceFiles: value.evidenceFiles.filter((_, i) => i !== idx) });
  };

  return (
    <div className="su-step active">
      <div className="su-heading left-align">
        <div className="su-step-label">{stepLabel}</div>
        <h1 className="su-title-dark">{t('wizard.evidence.title')}</h1>
        <p className="su-subtitle">{t('wizard.evidence.subtitle')}</p>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); onContinue(); }}>
        <div className="su-field-group full-width">
          <label className="su-label-dark">
            {t('wizard.incident.evidenceLabel')} ({t('wizard.optional')})
          </label>
          <p className="su-field-hint-dark">{t('wizard.incident.evidenceHint')}</p>

          <label className="su-file-btn evidence-upload-btn">
            <Upload size={16} style={{ marginRight: 8 }} />
            {t('common.chooseFile')}
            <input
              type="file"
              className="su-file-input"
              multiple
              accept="image/*,video/*,.pdf"
              onChange={handleFilesAdded}
            />
          </label>

          {value.evidenceFiles.length > 0 && (
            <div className="evidence-chip-list">
              {value.evidenceFiles.map((file, idx) => {
                const Icon = fileIconFor(file);
                return (
                  <div key={`${file.name}-${idx}`} className="evidence-chip">
                    <Icon size={14} className="evidence-chip-icon" />
                    <span className="evidence-chip-name">{file.name}</span>
                    <span className="evidence-chip-size">{formatFileSize(file.size)}</span>
                    <button
                      type="button"
                      className="evidence-chip-remove"
                      onClick={() => removeFile(idx)}
                      aria-label={`Remove ${file.name}`}
                    >
                      <X size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="su-step-nav">
          <button type="button" className="su-btn-light-pill" onClick={onBack}>{t('common.back')}</button>
          <button type="submit" className="su-btn-purple-pill">
            {t('common.continue')} <ArrowRight size={18} />
          </button>
        </div>
      </form>
    </div>
  );
}
