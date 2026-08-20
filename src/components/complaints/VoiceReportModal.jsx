import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Sparkles, Square, Loader2, ShieldAlert, AlertTriangle, Mic, X } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import ComplaintWizardForm from './ComplaintWizardForm';
import { useSpeechRecognition, SPEECH_LOCALE_MAP } from '../../hooks/useSpeechRecognition';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useTranslation } from '../../context/I18nContext';
import { suggestCategoryFromText } from '../../constants/complaintCategories';
import { suggestSubCategoryFromText } from '../../constants/complaintSubCategories';
import {
  extractSubjectFromText,
  extractLocationFromText,
  extractVictimNameFromText,
  extractViolatorNameFromText,
} from '../../constants/voiceExtraction';
import '../../styles/makeComplaintModal.css';

const SPEECH_ERROR_KEYS = ['unsupported', 'not-allowed', 'no-speech', 'audio-capture', 'network', 'aborted'];
const AUDIO_ERROR_KEYS = ['unsupported', 'not-allowed', 'unavailable'];

// Voice-first "quick report": record (speech-to-text + raw audio in parallel) -> simulate AI
// processing -> land on the exact same step wizard the typed flow uses (ComplaintWizardForm),
// with category and the incident description pre-filled from what was transcribed. Past the
// recording/processing stage, reporting by voice now looks and behaves identically to typing
// it in, right down to the multi-victim/violator cards, office recommendation, and the
// success/failure feedback modal.
export default function VoiceReportModal({ open, onClose }) {
  const { t, language } = useTranslation();
  const speech = useSpeechRecognition();
  const recorder = useAudioRecorder();

  const [step, setStep] = useState('recording');
  const [transcribedDescription, setTranscribedDescription] = useState('');
  const [suggestedSubject, setSuggestedSubject] = useState('');
  const [suggestedCategory, setSuggestedCategory] = useState('');
  const [suggestedSubCategory, setSuggestedSubCategory] = useState('');
  const [suggestedLocation, setSuggestedLocation] = useState('');
  const [suggestedVictimName, setSuggestedVictimName] = useState('');
  const [suggestedViolatorName, setSuggestedViolatorName] = useState('');

  useEffect(() => {
    if (!open) return;

    setStep('recording');
    setTranscribedDescription('');
    setSuggestedSubject('');
    setSuggestedCategory('');
    setSuggestedSubCategory('');
    setSuggestedLocation('');
    setSuggestedVictimName('');
    setSuggestedViolatorName('');

    let cancelled = false;
    // Request the mic once via the recorder first (this both settles the permission prompt and
    // gets the raw-audio stream), then start SpeechRecognition — asking for the mic from two
    // independent APIs in the same tick can make some browsers drop speech results entirely.
    recorder.start().then(() => {
      if (!cancelled) speech.start(SPEECH_LOCALE_MAP[language] || 'en-US');
    });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, language]);

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
      const transcript = speech.transcript;
      const category = suggestCategoryFromText(transcript) || '';
      setTranscribedDescription(transcript);
      setSuggestedSubject(extractSubjectFromText(transcript));
      setSuggestedCategory(category);
      setSuggestedSubCategory(category ? suggestSubCategoryFromText(category, transcript) || '' : '');
      setSuggestedLocation(extractLocationFromText(transcript) || '');
      setSuggestedVictimName(extractVictimNameFromText(transcript) || '');
      setSuggestedViolatorName(extractViolatorNameFromText(transcript) || '');
      setStep('review');
    }, 1200);
  };

  if (!open) return null;

  if (step === 'review') {
    return createPortal(
      <div className="modal-overlay" onMouseDown={(e) => e.target === e.currentTarget && handleClose()}>
        <div className="wizard-modal-container">
          <div className="wizard-modal-header">
            <div className="wizard-modal-header-text">
              <h3 style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <Sparkles size={16} /> {t('voiceReportModal.modalTitle')}
              </h3>
              <p>{t('voiceReportModal.review.headerSubtitle')}</p>
            </div>
            <div className="modal-header-actions">
              <LanguageSwitcher />
              <button type="button" className="wizard-modal-close" onClick={handleClose} aria-label="Close">
                <X size={18} />
              </button>
            </div>
          </div>
          <div className="wizard-modal-body">
            <div className="review-intro-alert">
              <ShieldAlert size={16} />
              <span>
                {transcribedDescription
                  ? t('voiceReportModal.review.introTranscribed')
                  : t('voiceReportModal.review.introNotTranscribed')}
                {recorder.audioUrl
                  ? t('voiceReportModal.review.audioSaved')
                  : t('voiceReportModal.review.audioNotSaved')}
              </span>
            </div>

            <ComplaintWizardForm
              onComplete={handleClose}
              skipPhoneGate
              initialCategory={suggestedCategory}
              initialSubCategory={suggestedSubCategory}
              initialSubject={suggestedSubject}
              initialDescription={transcribedDescription}
              initialLocation={suggestedLocation}
              initialVictimName={suggestedVictimName}
              initialViolatorName={suggestedViolatorName}
              voiceRecordingUrl={recorder.audioUrl}
            />
          </div>
        </div>
      </div>,
      document.body
    );
  }

  return (
    <Modal
      open={open}
      onClose={handleClose}
      width="480px"
      title={
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Sparkles size={18} /> {t('voiceReportModal.modalTitle')}
        </span>
      }
      headerActions={<LanguageSwitcher />}
    >
      {step === 'recording' && (
        <div className="voice-step-recording">
          <div className="listening-visualizer">
            <span className="voice-blob-ring mini" />
            <span className="voice-blob-shape mini">
              <span className="voice-blob-shine" />
            </span>
            <Mic size={18} className="voice-blob-icon" />
          </div>

          <div className="voice-status-heading">
            <span className="live-mic-pulse" />
            <h4>{t('voiceReportModal.recording.heading')}</h4>
            <p>{t('voiceReportModal.recording.subtitle')}</p>
          </div>

          <div className="transcription-live-box">
            <p>{speech.transcript || t('voiceReportModal.recording.placeholder')}</p>
          </div>

          {speech.error && (
            <div className="voice-error-note">
              <AlertTriangle size={14} />
              <span>{t(`voiceReportModal.errors.speech.${SPEECH_ERROR_KEYS.includes(speech.error) ? speech.error : 'default'}`)}</span>
            </div>
          )}

          {recorder.error && (
            <div className="voice-error-note">
              <AlertTriangle size={14} />
              <span>{t(`voiceReportModal.errors.audio.${AUDIO_ERROR_KEYS.includes(recorder.error) ? recorder.error : 'default'}`)}</span>
            </div>
          )}

          <div className="voice-modal-actions">
            <Button variant="primary" icon={Square} onClick={handleStopRecording}>
              {t('voiceReportModal.recording.stopButton')}
            </Button>
          </div>
        </div>
      )}

      {step === 'processing' && (
        <div className="voice-step-processing">
          <Loader2 size={38} className="ai-processing-spinner" />
          <h4>{t('voiceReportModal.processing.heading')}</h4>
          <p>{t('voiceReportModal.processing.subtitle')}</p>
        </div>
      )}
    </Modal>
  );
}
