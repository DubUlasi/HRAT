import React, { useState } from 'react';
import { ChevronUp, ChevronDown, Trash2, Plus, Hash } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { formatComplaintNumber, DEFAULT_COMPLAINT_NUMBER_FORMAT } from '../../context/ComplaintsContext';

let uidCounter = 0;
const uid = () => `seg-${Date.now()}-${uidCounter++}`;

const DEFAULT_SEGMENTS = () => [
  { id: uid(), type: 'prefix', value: 'NHRC' },
  { id: uid(), type: 'separator', value: '/' },
  { id: uid(), type: 'year', value: 'short' },
  { id: uid(), type: 'separator', value: '/' },
  { id: uid(), type: 'sequence', value: 'none' },
];

const TOKEN_RE = /\{YYYY\}|\{YY\}|\{SEQ[2-5]?\}/g;

function literalToSegment(str) {
  if (str === '/' || str === '-') return { id: uid(), type: 'separator', value: str };
  return { id: uid(), type: 'prefix', value: str };
}

function tokenToSegment(tok) {
  if (tok === '{YYYY}') return { id: uid(), type: 'year', value: 'full' };
  if (tok === '{YY}') return { id: uid(), type: 'year', value: 'short' };
  const digits = tok.match(/^\{SEQ([2-5])?\}$/)[1];
  return { id: uid(), type: 'sequence', value: digits || 'none' };
}

// Best-effort split of a saved template string back into editable segments — lets a format
// built (or previously saved) elsewhere still open correctly in this segment editor.
function templateToSegments(template) {
  if (!template) return DEFAULT_SEGMENTS();
  const segments = [];
  let lastIndex = 0;
  let match;
  TOKEN_RE.lastIndex = 0;
  while ((match = TOKEN_RE.exec(template))) {
    if (match.index > lastIndex) segments.push(literalToSegment(template.slice(lastIndex, match.index)));
    segments.push(tokenToSegment(match[0]));
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < template.length) segments.push(literalToSegment(template.slice(lastIndex)));
  return segments.length ? segments : DEFAULT_SEGMENTS();
}

function segmentsToTemplate(segments) {
  return segments.map((seg) => {
    if (seg.type === 'prefix') return seg.value || '';
    if (seg.type === 'separator') return seg.value || '';
    if (seg.type === 'year') return seg.value === 'full' ? '{YYYY}' : seg.value === 'short' ? '{YY}' : '';
    if (seg.type === 'sequence') return seg.value && seg.value !== 'none' ? `{SEQ${seg.value}}` : '{SEQ}';
    return '';
  }).join('');
}

const SEQ_DIGITS_FOR_PREVIEW = (segments) => {
  const seg = segments.find((s) => s.type === 'sequence');
  const map = { none: 1, 2: 2, 3: 3, 4: 4, 5: 5 };
  return map[seg?.value] || 1;
};

// Segment-by-segment complaint number builder — Prefix / Year / Sequence / Separator blocks that
// can be reordered, edited and removed, with a live preview. Mirrors the admission-number /
// staff-ID format configurators elsewhere in the product so numbering setup feels familiar
// rather than asking the Registry Head to type template syntax.
export default function ComplaintNumberFormatModal({ open, onClose, currentFormat, currentSeq, onSave }) {
  const [segments, setSegments] = useState(() => templateToSegments(currentFormat));
  const [nextNum, setNextNum] = useState(currentSeq);
  const [error, setError] = useState(null);

  if (!open) return null;

  const template = segmentsToTemplate(segments);
  const preview = formatComplaintNumber(template, nextNum);
  const seqDigits = SEQ_DIGITS_FOR_PREVIEW(segments);

  const moveSeg = (i, dir) => {
    const j = i + dir;
    if (j < 0 || j >= segments.length) return;
    setSegments((prev) => {
      const copy = [...prev];
      [copy[i], copy[j]] = [copy[j], copy[i]];
      return copy;
    });
  };
  const updateSeg = (i, value) => setSegments((prev) => prev.map((s, idx) => (idx === i ? { ...s, value } : s)));
  const updateSegType = (i, type) => setSegments((prev) => prev.map((s, idx) => {
    if (idx !== i) return s;
    if (type === 'prefix') return { id: s.id, type, value: 'NHRC' };
    if (type === 'separator') return { id: s.id, type, value: '/' };
    if (type === 'year') return { id: s.id, type, value: 'short' };
    return { id: s.id, type, value: 'none' };
  }));
  const removeSeg = (i) => setSegments((prev) => prev.filter((_, idx) => idx !== i));
  const addSeg = () => setSegments((prev) => [...prev, { id: uid(), type: 'prefix', value: '' }]);

  const handleReset = () => {
    setSegments(DEFAULT_SEGMENTS());
    setError(null);
  };

  const handleSave = () => {
    if (!segments.some((s) => s.type === 'sequence')) {
      setError('Add a sequence number block so every complaint number stays unique.');
      return;
    }
    setError(null);
    onSave(template, Math.max(1, parseInt(nextNum, 10) || 1));
  };

  return (
    <Modal open={open} onClose={onClose} title="Configure complaint number format" width="560px">
      <div className="seg-preview-label">Format preview</div>
      <div className="seg-preview-box">{preview || <span className="seg-preview-empty">—</span>}</div>

      <div className="seg-editor-label">Format blocks</div>
      <div className="seg-list">
        {segments.map((seg, i) => (
          <div key={seg.id} className="seg-row">
            <div className="seg-row-move">
              <button type="button" className="seg-icon-btn" disabled={i === 0} onClick={() => moveSeg(i, -1)}>
                <ChevronUp size={13} />
              </button>
              <button type="button" className="seg-icon-btn" disabled={i === segments.length - 1} onClick={() => moveSeg(i, 1)}>
                <ChevronDown size={13} />
              </button>
            </div>

            <Select className="seg-type-select" value={seg.type} onChange={(e) => updateSegType(i, e.target.value)}>
              <option value="prefix">Prefix</option>
              <option value="year">Year</option>
              <option value="sequence">Sequence</option>
              <option value="separator">Separator</option>
            </Select>

            {seg.type === 'prefix' && (
              <Input className="seg-value" value={seg.value} placeholder="e.g. NHRC" onChange={(e) => updateSeg(i, e.target.value)} />
            )}
            {seg.type === 'year' && (
              <Select className="seg-value" value={seg.value} onChange={(e) => updateSeg(i, e.target.value)}>
                <option value="full">Full year, e.g. 2026</option>
                <option value="short">Short year, e.g. 26</option>
              </Select>
            )}
            {seg.type === 'sequence' && (
              <Select className="seg-value" value={seg.value} onChange={(e) => updateSeg(i, e.target.value)}>
                <option value="none">No leading zeros, e.g. 1</option>
                <option value="2">2 digits, e.g. 01</option>
                <option value="3">3 digits, e.g. 001</option>
                <option value="4">4 digits, e.g. 0001</option>
                <option value="5">5 digits, e.g. 00001</option>
              </Select>
            )}
            {seg.type === 'separator' && (
              <Select className="seg-value" value={seg.value} onChange={(e) => updateSeg(i, e.target.value)}>
                <option value="/">/ (slash)</option>
                <option value="-">- (dash)</option>
                <option value="">None</option>
              </Select>
            )}

            <button type="button" className="seg-icon-btn seg-icon-btn--danger" onClick={() => removeSeg(i)}>
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>

      <button type="button" className="btn-link seg-add-btn" onClick={addSeg}>
        <Plus size={13} /> Add block
      </button>

      {error && <p className="form-error">{error}</p>}

      <div className="seg-next-num">
        <Hash size={15} />
        <span>Next number</span>
        <Input
          type="number"
          min={1}
          className="seg-next-num-input"
          value={nextNum}
          onChange={(e) => setNextNum(e.target.value)}
        />
        <span className="seg-next-num-preview">
          → <strong>{String(Math.max(1, parseInt(nextNum, 10) || 1)).padStart(seqDigits, '0')}</strong>
        </span>
      </div>

      <div className="modal-actions" style={{ justifyContent: 'space-between' }}>
        <button type="button" className="btn-link" onClick={handleReset}>
          Reset to default ({DEFAULT_COMPLAINT_NUMBER_FORMAT})
        </button>
        <Button variant="submit" onClick={handleSave}>Save format</Button>
      </div>
    </Modal>
  );
}
