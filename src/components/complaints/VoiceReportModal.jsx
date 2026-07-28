import React, { useEffect, useState } from 'react';
import { Sparkles, Square, Loader2, Send, ShieldAlert, AlertTriangle, User, Users, FileText, Mic } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import Input from '../ui/Input';
import Select from '../ui/Select';
import TextArea from '../ui/TextArea';
import SuccessModal from '../ui/SuccessModal';
import PersonFields, { EMPTY_PERSON } from './PersonFields';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useComplaints } from '../../context/ComplaintsContext';
import { CATEGORY_LABELS } from '../../constants/complaintCategories';
import { offices } from '../../data/mockOfficers';

const EMPTY_INCIDENT = { subject: '', description: '', officeId: '' };

const TABS = [
  { key: 'incident', label: 'Incident Details', icon: ShieldAlert },
  { key: 'victim', label: 'Victim Info', icon: User },
  { key: 'violator', label: 'Alleged Violator', icon: Users },
  { key: 'category', label: 'Rights Category', icon: FileText },
];

const SPEECH_ERROR_MESSAGES = {
  unsupported: "This browser doesn't support live speech-to-text. Recording will still be saved — just type the description below.",
  'not-allowed': 'Microphone access was blocked. Allow microphone access for this site in your browser settings, then try again.',
  'no-speech': "We didn't detect any speech. You can try again, or type the description below.",
  'audio-capture': 'No microphone was found on this device.',
  network: "Speech-to-text needs an internet connection and couldn't reach it. Recording will still be saved — just type the description below.",
  aborted: 'Recording was interrupted.',
};

const AUDIO_ERROR_MESSAGES = {
  unsupported: "This browser can't record audio.",
  'not-allowed': 'Microphone access was blocked, so the audio recording could not be saved.',
  unavailable: 'The microphone could not be reached, so the audio recording could not be saved.',
};

// Voice-first "quick report": record (speech-to-text + raw audio in parallel) → simulate AI
// processing → land on an editable review form (reusing the same field components as
// MakeComplaintModal) → submit. Recording starts immediately on open — no setup step.
export default function VoiceReportModal({ open, onClose }) {
  const { createComplaint } = useComplaints();
  const speech = useSpeechRecognition();
  const recorder = useAudioRecorder();

  const [step, setStep] = useState('recording');
  const [activeTab, setActiveTab] = useState('incident');
  const [victim, setVictim] = useState(EMPTY_PERSON);
  const [violator, setViolator] = useState(EMPTY_PERSON);
  const [incident, setIncident] = useState(EMPTY_INCIDENT);
  const [category, setCategory] = useState('women_children');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;

    setStep('recording');
    setActiveTab('incident');
    setVictim(EMPTY_PERSON);
    setViolator(EMPTY_PERSON);
    setIncident(EMPTY_INCIDENT);
    setCategory('women_children');

    let cancelled = false;
    // Request the mic once via the recorder first (this both settles the permission prompt and
    // gets the raw-audio stream), then start SpeechRecognition — asking for the mic from two
    // independent APIs in the same tick can make some browsers drop speech results entirely.
    recorder.start().then(() => {
      if (!cancelled) speech.start();
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleClose = () => {
    speech.stop();
    recorder.stop();
    onClose();
  };

  const handleStopRecording = () => {
    speech.stop();
    recorder.stop();
    setStep('processing');
    setTimeout(() => {
      setIncident((prev) => ({ ...prev, description: speech.transcript }));
      setStep('review');
    }, 1200);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    createComplaint({
      subject: incident.subject,
      category,
      description: incident.description,
      office: incident.officeId || null,
      voiceRecordingUrl: recorder.audioUrl,
      victim: {
        name: `${victim.firstName} ${victim.lastName}`.trim(),
        gender: victim.gender,
        phone: victim.phone,
        email: victim.email,
        address: victim.address,
      },
      allegedViolator: {
        name: `${violator.firstName} ${violator.lastName}`.trim(),
        gender: violator.gender,
        phone: violator.phone,
        email: violator.email,
        address: violator.address,
      },
    });
    handleClose();
    setShowSuccess(true);
  };

  return (
    <>
      <Modal
        open={open}
        onClose={handleClose}
        width="720px"
        title={
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Sparkles size={18} /> Make a Complaint — AI Voice Report
          </span>
        }
      >
        {step === 'recording' && (
          <div className="voice-step-recording">
            <div className="listening-visualizer">
              <span className="voice-blob-ring mini" />
              <span className="voice-blob-shape mini">
                <span className="voice-blob-shine" />
              </span>
              <Mic size={22} className="voice-blob-icon" />
            </div>

            <div className="voice-status-heading">
              <span className="live-mic-pulse" />
              <h4>Listening to your report...</h4>
              <p>Describe what happened — you'll be able to review and edit everything before it's submitted.</p>
            </div>

            <div className="transcription-live-box">
              <p>{speech.transcript || 'Start speaking now...'}</p>
            </div>

            {speech.error && (
              <div className="voice-error-note">
                <AlertTriangle size={14} />
                <span>{SPEECH_ERROR_MESSAGES[speech.error] || 'Something went wrong with speech-to-text.'}</span>
              </div>
            )}

            {recorder.error && (
              <div className="voice-error-note">
                <AlertTriangle size={14} />
                <span>{AUDIO_ERROR_MESSAGES[recorder.error] || 'Something went wrong recording the audio.'}</span>
              </div>
            )}

            <div className="voice-modal-actions">
              <Button variant="primary" icon={Square} onClick={handleStopRecording}>
                Stop & Autofill Complaint Form
              </Button>
            </div>
          </div>
        )}

        {step === 'processing' && (
          <div className="voice-step-processing">
            <Loader2 size={38} className="ai-processing-spinner" />
            <h4>Autofilling complaint form...</h4>
            <p>Structuring the incident description from your recording.</p>
          </div>
        )}

        {step === 'review' && (
          <form onSubmit={handleSubmit}>
            <div className="review-intro-alert">
              <ShieldAlert size={16} />
              <span>
                {incident.description
                  ? 'Your recording has been transcribed into Incident Details — check it over for accuracy. '
                  : "We couldn't transcribe your recording, so Incident Details is blank — please type it in below. "}
                {recorder.audioUrl
                  ? 'The original audio has been saved and will be attached to this complaint for future reference.'
                  : "The audio recording itself couldn't be saved on this browser/device."}
                {' '}Review and complete every tab below.
              </span>
            </div>

            <div className="voice-stepper-tabs">
              {TABS.map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  className={`voice-stepper-tab ${activeTab === tab.key ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.key)}
                >
                  <tab.icon size={14} />
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>

            {activeTab === 'incident' && (
              <>
                <FormField label="Subject" required>
                  <Input
                    value={incident.subject}
                    onChange={(e) => setIncident({ ...incident, subject: e.target.value })}
                    placeholder="Brief title of the incident"
                    required
                  />
                </FormField>
                <FormField label="Detailed Description" required>
                  <TextArea
                    rows={5}
                    value={incident.description}
                    onChange={(e) => setIncident({ ...incident, description: e.target.value })}
                    required
                  />
                </FormField>
                <FormField label="Preferred Handling Office">
                  <Select value={incident.officeId} onChange={(e) => setIncident({ ...incident, officeId: e.target.value })}>
                    <option value="">-- Select Office --</option>
                    {offices.map((o) => (
                      <option key={o.id} value={o.id}>{o.name}</option>
                    ))}
                  </Select>
                </FormField>
              </>
            )}

            {activeTab === 'victim' && <PersonFields person={victim} onChange={setVictim} />}
            {activeTab === 'violator' && <PersonFields person={violator} onChange={setViolator} />}

            {activeTab === 'category' && (
              <FormField label="Complaint Category" required>
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </FormField>
            )}

            <div className="modal-actions space-between">
              <Button variant="secondary" type="button" onClick={handleClose}>Cancel</Button>
              <Button variant="submit" type="submit" icon={Send}>Submit Complaint</Button>
            </div>
          </form>
        )}
      </Modal>

      <SuccessModal
        open={showSuccess}
        message="Your voice complaint has been submitted successfully."
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
