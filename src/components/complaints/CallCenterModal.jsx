import React, { useEffect, useState } from 'react';
import { Phone, PhoneIncoming, Search, ArrowRight } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import Input from '../ui/Input';
import TextArea from '../ui/TextArea';
import ComplaintsTable from '../ui/ComplaintsTable';
import EmptyState from '../ui/EmptyState';
import SuccessModal from '../ui/SuccessModal';
import MakeComplaintModal from './MakeComplaintModal';
import { useComplaints } from '../../context/ComplaintsContext';
import { useCalls } from '../../context/CallsContext';
import { CATEGORY_LABELS, suggestCategoryFromText } from '../../constants/complaintCategories';

// Dashboard-blob quick-entry for the Call Center feature — dial a number, see whether it's a
// returning caller (existing complaints) or a new one, jot notes (with a live category
// suggestion), and log the call. Same "step machine inside one Modal" shape as
// VoiceReportModal, just without the speech/audio pieces.
export default function CallCenterModal({ open, onClose }) {
  const { findCallerHistory, currentUser } = useComplaints();
  const { createCallLog } = useCalls();

  const [step, setStep] = useState('dial');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [matches, setMatches] = useState([]);
  const [notes, setNotes] = useState('');
  const [startedNewComplaint, setStartedNewComplaint] = useState(false);
  const [showMakeComplaint, setShowMakeComplaint] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;
    setStep('dial');
    setPhoneNumber('');
    setMatches([]);
    setNotes('');
    setStartedNewComplaint(false);
    setShowMakeComplaint(false);
  }, [open]);

  const isReturning = matches.length > 0;
  const suggestedCategory = suggestCategoryFromText(notes);

  const handleDialSubmit = (e) => {
    e.preventDefault();
    setMatches(findCallerHistory(phoneNumber));
    setStep('session');
  };

  const handleStartNewComplaint = () => {
    setStartedNewComplaint(true);
    setShowMakeComplaint(true);
  };

  const handleCompleteCall = () => {
    const outcome = startedNewComplaint
      ? 'new_complaint_started'
      : (isReturning ? 'complaint_linked' : 'info_only');

    createCallLog({
      phoneNumber,
      callerType: isReturning ? 'returning' : 'new',
      linkedComplaintIds: isReturning ? matches.map((c) => c.id) : [],
      suggestedCategory,
      notes,
      handledBy: currentUser.name,
      outcome,
    });
    onClose();
    setShowSuccess(true);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={onClose}
        width="640px"
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Phone size={18} /> Call Center
          </span>
        }
      >
        {step === 'dial' && (
          <form onSubmit={handleDialSubmit}>
            <p className="modal-description">
              Enter the caller's phone number to look up their history and log this call.
            </p>
            <FormField label="Caller Phone Number" required>
              <Input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="e.g. 08053647328"
                required
                autoFocus
              />
            </FormField>
            <div className="modal-actions">
              <Button type="submit" variant="primary" icon={PhoneIncoming}>Simulate Incoming Call</Button>
            </div>
          </form>
        )}

        {step === 'session' && (
          <div className="call-session">
            <div className="call-session-header">
              <span className="call-session-phone"><Phone size={14} /> {phoneNumber}</span>
              <span className={`status-badge status-${isReturning ? 'success' : 'info'}`}>
                {isReturning ? 'Returning Caller' : 'New Caller'}
              </span>
            </div>

            {isReturning ? (
              <div className="call-session-block">
                <h4 className="section-card-title">Complaint History ({matches.length})</h4>
                <ComplaintsTable
                  complaints={matches}
                  getActionHref={(c) => `/registry-head/complaints/${c.id}`}
                />
              </div>
            ) : (
              <div className="call-session-block call-session-new-caller">
                <EmptyState icon={Search} message="No prior complaints found for this number." />
                <Button variant="secondary" icon={ArrowRight} onClick={handleStartNewComplaint}>
                  Start New Complaint
                </Button>
              </div>
            )}

            <FormField label="Call Notes">
              <TextArea
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Summarize what the caller said..."
              />
            </FormField>

            {suggestedCategory && (
              <div className="call-category-suggestion">
                <span className="category-pill">{CATEGORY_LABELS[suggestedCategory]}</span>
                <span>Suggested category based on call notes</span>
              </div>
            )}

            <div className="modal-actions space-between">
              <Button variant="secondary" type="button" onClick={onClose}>Cancel</Button>
              <Button variant="submit" type="button" onClick={handleCompleteCall}>Complete Call</Button>
            </div>
          </div>
        )}
      </Modal>

      <MakeComplaintModal
        open={showMakeComplaint}
        onClose={() => setShowMakeComplaint(false)}
        prefillPhone={phoneNumber}
      />

      <SuccessModal
        open={showSuccess}
        message="Call logged successfully."
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
