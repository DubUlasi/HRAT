import React, { useEffect, useState } from 'react';
import { Sparkles, Square, Loader2, Send, ShieldAlert, AlertTriangle, User, Users, FileText, Mic } from 'lucide-react';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import FormField from '../ui/FormField';
import Input from '../ui/Input';
import Select from '../ui/Select';
import TextArea from '../ui/TextArea';
import SuccessModal from '../ui/SuccessModal';
import LanguageSwitcher from '../ui/LanguageSwitcher';
import PersonFields, { EMPTY_PERSON } from './PersonFields';
import { useSpeechRecognition } from '../../hooks/useSpeechRecognition';
import { useAudioRecorder } from '../../hooks/useAudioRecorder';
import { useComplaints } from '../../context/ComplaintsContext';
import { useTranslation } from '../../context/I18nContext';
import { CATEGORY_LABELS, suggestCategoryFromText } from '../../constants/complaintCategories';
import { offices } from '../../data/mockOfficers';

const EMPTY_INCIDENT = { subject: '', description: '', officeId: '' };

const TABS = [
  { key: 'incident', labelKey: 'voiceReportModal.tabs.incident', icon: ShieldAlert },
  { key: 'victim', labelKey: 'voiceReportModal.tabs.victim', icon: User },
  { key: 'violator', labelKey: 'voiceReportModal.tabs.violator', icon: Users },
  { key: 'category', labelKey: 'voiceReportModal.tabs.category', icon: FileText },
];

// Web Speech API locale codes — Pidgin has no dedicated speech-recognition locale, so it
// falls back to en-US.
const SPEECH_LOCALE_MAP = { en: 'en-US', ha: 'ha-NG', yo: 'yo-NG', ig: 'ig-NG', pcm: 'en-US' };

const SPEECH_ERROR_KEYS = ['unsupported', 'not-allowed', 'no-speech', 'audio-capture', 'network', 'aborted'];
const AUDIO_ERROR_KEYS = ['unsupported', 'not-allowed', 'unavailable'];

// Voice-first "quick report": record (speech-to-text + raw audio in parallel) → simulate AI
// processing → land on an editable review form (reusing the same field components as
// MakeComplaintModal) → submit. Recording starts immediately on open — no setup step.
export default function VoiceReportModal({ open, onClose }) {
  const { createComplaint } = useComplaints();
  const { t, language } = useTranslation();
  const speech = useSpeechRecognition();
  const recorder = useAudioRecorder();

  const [step, setStep] = useState('recording');
  const [activeTab, setActiveTab] = useState('incident');
  const [victim, setVictim] = useState(EMPTY_PERSON);
  const [violator, setViolator] = useState(EMPTY_PERSON);
  const [incident, setIncident] = useState(EMPTY_INCIDENT);
  const [category, setCategory] = useState('women_children');
  const [suggestedCategory, setSuggestedCategory] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (!open) return;

    setStep('recording');
    setActiveTab('incident');
    setVictim(EMPTY_PERSON);
    setViolator(EMPTY_PERSON);
    setIncident(EMPTY_INCIDENT);
    setCategory('women_children');
    setSuggestedCategory(null);

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
      setIncident((prev) => ({ ...prev, description: transcript }));

      const suggestion = suggestCategoryFromText(transcript);
      if (suggestion) {
        setCategory(suggestion);
        setSuggestedCategory(suggestion);
      }

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

        {step === 'review' && (
          <form onSubmit={handleSubmit}>
            <div className="review-intro-alert">
              <ShieldAlert size={16} />
              <span>
                {incident.description
                  ? t('voiceReportModal.review.introTranscribed')
                  : t('voiceReportModal.review.introNotTranscribed')}
                {recorder.audioUrl
                  ? t('voiceReportModal.review.audioSaved')
                  : t('voiceReportModal.review.audioNotSaved')}
                {t('voiceReportModal.review.reviewInstruction')}
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
                  <span>{t(tab.labelKey)}</span>
                </button>
              ))}
            </div>

            {activeTab === 'incident' && (
              <>
                <FormField label={t('voiceReportModal.incidentTab.subjectLabel')} required>
                  <Input
                    value={incident.subject}
                    onChange={(e) => setIncident({ ...incident, subject: e.target.value })}
                    placeholder={t('voiceReportModal.incidentTab.subjectPlaceholder')}
                    required
                  />
                </FormField>
                <FormField label={t('voiceReportModal.incidentTab.descriptionLabel')} required>
                  <TextArea
                    rows={5}
                    value={incident.description}
                    onChange={(e) => setIncident({ ...incident, description: e.target.value })}
                    required
                  />
                </FormField>
                <FormField label={t('voiceReportModal.incidentTab.officeLabel')}>
                  <Select value={incident.officeId} onChange={(e) => setIncident({ ...incident, officeId: e.target.value })}>
                    <option value="">{t('common.selectOffice')}</option>
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
              <FormField
                label={t('voiceReportModal.categoryTab.label')}
                required
                hint={
                  suggestedCategory
                    ? (category === suggestedCategory
                      ? t('voiceReportModal.categoryTab.suggestedHintMatch')
                      : t('voiceReportModal.categoryTab.suggestedHintChanged', { category: CATEGORY_LABELS[suggestedCategory] }))
                    : undefined
                }
              >
                <Select value={category} onChange={(e) => setCategory(e.target.value)}>
                  {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </Select>
              </FormField>
            )}

            <div className="modal-actions space-between">
              <Button variant="secondary" type="button" onClick={handleClose}>{t('voiceReportModal.actions.cancel')}</Button>
              <Button variant="submit" type="submit" icon={Send}>{t('voiceReportModal.actions.submit')}</Button>
            </div>
          </form>
        )}
      </Modal>

      <SuccessModal
        open={showSuccess}
        message={t('voiceReportModal.successMessage')}
        onClose={() => setShowSuccess(false)}
      />
    </>
  );
}
