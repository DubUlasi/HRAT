import React from 'react';
import { Upload, FileImage, FileVideo, FileText, X } from 'lucide-react';
import FormField from '../ui/FormField';

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

// Optional file-attach control dropped into any remark-taking modal — every file picked here is
// held in local state by the modal until submit, then handed to ComplaintsContext's
// attachDocuments() alongside whatever action the modal itself performs. Every attachment ends
// up in the complaint detail page's unified Documents & Resources section, tagged with the
// stage it was added at. Purely additive: a modal that never renders this never calls
// attachDocuments, so this doesn't change any existing action's behavior.
export default function AttachDocumentsField({ files, onChange, label = 'Attach Documents (optional)' }) {
  const handleFilesAdded = (e) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length) onChange([...files, ...newFiles]);
    e.target.value = '';
  };

  const removeFile = (idx) => onChange(files.filter((_, i) => i !== idx));

  return (
    <FormField label={label}>
      <label className="attach-docs-btn">
        <Upload size={14} /> Choose Files
        <input type="file" multiple onChange={handleFilesAdded} className="attach-docs-input" />
      </label>

      {files.length > 0 && (
        <div className="attach-docs-chip-list">
          {files.map((file, idx) => {
            const Icon = fileIconFor(file);
            return (
              <div key={`${file.name}-${idx}`} className="attach-docs-chip">
                <Icon size={13} className="attach-docs-chip-icon" />
                <span className="attach-docs-chip-name">{file.name}</span>
                <span className="attach-docs-chip-size">{formatFileSize(file.size)}</span>
                <button
                  type="button"
                  className="attach-docs-chip-remove"
                  onClick={() => removeFile(idx)}
                  aria-label={`Remove ${file.name}`}
                >
                  <X size={12} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </FormField>
  );
}
