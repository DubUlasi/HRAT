import React, { useState } from 'react';
import { ArrowRight, Upload, FileImage, FileVideo, FileText, X } from 'lucide-react';

function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileIconFor(contentType) {
  if (contentType?.startsWith('image/')) return FileImage;
  if (contentType?.startsWith('video/')) return FileVideo;
  return FileText;
}

// Files upload immediately on selection (one real POST per batch) rather than being held locally
// and sent all at once — matches the picking-as-you-go UX of the mock wizard's evidence step,
// but here each pick is a real network call against the draft's current revision.
export default function ComplainantStepEvidence({ files, onUpload, onRemove, onBack, onContinue, error }) {
  const [uploading, setUploading] = useState(false);
  const [localError, setLocalError] = useState('');
  const [removingId, setRemovingId] = useState(null);

  const handleFilesAdded = async (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    if (!picked.length) return;
    setLocalError('');
    setUploading(true);
    try {
      await onUpload(picked);
    } catch (err) {
      setLocalError(err.problem?.detail || err.message);
    }
    setUploading(false);
  };

  const handleRemove = async (id) => {
    setRemovingId(id);
    try {
      await onRemove(id);
    } catch (err) {
      setLocalError(err.problem?.detail || err.message);
    }
    setRemovingId(null);
  };

  return (
    <div className="su-step active">
      <div className="su-heading left-align">
        <div className="su-step-label">Step 5 of 6</div>
        <h1 className="su-title-dark">Any evidence to attach?</h1>
        <p className="su-subtitle">Photos, videos, or documents that support your complaint. You can skip this if you don't have anything to attach yet.</p>
      </div>

      <div className="su-field-group full-width">
        <p className="su-field-hint-dark">JPEG, PNG, WebP, MP4, MOV, PDF, DOC, or DOCX, up to 25 MB each, up to 10 files.</p>

        <label className="su-file-btn evidence-upload-btn">
          <Upload size={16} style={{ marginRight: 8 }} />
          {uploading ? 'Uploading...' : 'Choose File'}
          <input
            type="file"
            className="su-file-input"
            multiple
            accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,application/pdf,.doc,.docx"
            onChange={handleFilesAdded}
            disabled={uploading || files.length >= 10}
          />
        </label>

        {(localError || error) && (
          <p className="su-field-hint-dark" style={{ color: 'var(--danger-color)', marginTop: 8 }}>{localError || error}</p>
        )}

        {files.length > 0 && (
          <div className="evidence-chip-list">
            {files.map((file) => {
              const Icon = fileIconFor(file.contentType);
              return (
                <div key={file.id} className="evidence-chip">
                  <Icon size={14} className="evidence-chip-icon" />
                  <span className="evidence-chip-name">{file.fileName}</span>
                  <span className="evidence-chip-size">{formatFileSize(file.sizeBytes)}</span>
                  <button
                    type="button"
                    className="evidence-chip-remove"
                    onClick={() => handleRemove(file.id)}
                    disabled={removingId === file.id}
                    aria-label={`Remove ${file.fileName}`}
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
        <button type="button" className="su-btn-light-pill" onClick={onBack}>Back</button>
        <button type="button" className="su-btn-purple-pill" onClick={onContinue} disabled={uploading}>
          Continue <ArrowRight size={18} />
        </button>
      </div>
    </div>
  );
}
