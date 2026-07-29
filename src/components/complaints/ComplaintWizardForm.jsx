import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintsContext';
import { useTranslation } from '../../context/I18nContext';
import StepPhoneGate from './wizard-steps/StepPhoneGate';
import StepCategory from './wizard-steps/StepCategory';
import StepIncidentDetails from './wizard-steps/StepIncidentDetails';
import StepVictimDetails from './wizard-steps/StepVictimDetails';
import StepViolatorDetails from './wizard-steps/StepViolatorDetails';
import StepReview from './wizard-steps/StepReview';
import '../../styles/signup.css';

// The complaint wizard — a simplified, mobile-app-style 5-step flow (What happened? / Tell us
// more / Who was affected? / Who is responsible? / Review & Submit), each step its own
// component under wizard-steps/ so this file and MakeComplaintModal.jsx compose the exact same
// steps instead of maintaining two forms. All step state is lifted here so Back/Continue/the
// Review step's Edit links never lose anything already entered.
//
// Complainants (this file rendered via ComplaintWizardPage, unauthenticated) see an extra
// phone-number gate before step 1, used to identify/track the complaint. Staff filing on a
// complainant's behalf (MakeComplaintModal, already authenticated) skip it via `skipPhoneGate`.
const OFFICE_ID_MAP = { abuja: 'hq' };

const WIZARD_STEPS = [
  { num: 1, labelKey: 'wizard.stepper.category' },
  { num: 2, labelKey: 'wizard.stepper.incident' },
  { num: 3, labelKey: 'wizard.stepper.victim' },
  { num: 4, labelKey: 'wizard.stepper.violator' },
  { num: 5, labelKey: 'wizard.stepper.review' },
];

const EMPTY_INCIDENT = { subject: '', description: '', location: '', date: '', evidenceFiles: [] };

function emptyVictim(initialPhone) {
  return {
    relationship: 'self',
    firstName: '',
    lastName: '',
    phone: initialPhone || '',
    email: '',
    gender: 'female',
    address: '',
    populationType: 'general',
    keyPopulationGroup: null,
  };
}

const EMPTY_VIOLATOR = { firstName: '', lastName: '', phone: '', email: '', gender: '', address: '' };

export default function ComplaintWizardForm({ onComplete, initialVictimPhone, skipPhoneGate = false }) {
  const { createComplaint } = useComplaints();
  const { t } = useTranslation();

  const [currentStep, setCurrentStep] = useState(skipPhoneGate ? 1 : 0);
  const [phoneGateValue, setPhoneGateValue] = useState(initialVictimPhone || '');

  const [category, setCategory] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [incident, setIncident] = useState(EMPTY_INCIDENT);
  const [victim, setVictim] = useState(() => emptyVictim(initialVictimPhone));
  const [violator, setViolator] = useState(EMPTY_VIOLATOR);
  const [office, setOffice] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const patchIncident = (patch) => setIncident((prev) => ({ ...prev, ...patch }));
  const patchVictim = (patch) => setVictim((prev) => ({ ...prev, ...patch }));
  const patchViolator = (patch) => setViolator((prev) => ({ ...prev, ...patch }));

  const handlePhoneGateContinue = () => {
    // "Myself" is the default relationship, so the gate's phone number doubles as the
    // victim's phone unless the complainant has already typed something different in.
    setVictim((prev) => ({ ...prev, phone: prev.phone || phoneGateValue }));
    setCurrentStep(1);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      createComplaint({
        subject: incident.subject,
        category,
        description: incident.description,
        office: OFFICE_ID_MAP[office] || office || null,
        evidenceFiles: incident.evidenceFiles,
        victim: {
          name: `${victim.firstName} ${victim.lastName}`.trim(),
          gender: victim.gender,
          phone: victim.phone,
          email: victim.email || null,
          address: victim.address || null,
          populationType: victim.populationType,
          keyPopulationGroup: victim.keyPopulationGroup,
        },
        allegedViolator: {
          name: `${violator.firstName} ${violator.lastName}`.trim(),
          gender: violator.gender || null,
          phone: violator.phone || null,
          email: violator.email || null,
          address: violator.address || null,
        },
      });
      onComplete();
    }, 600);
  };

  const stepLabel = (n) => t('wizard.stepLabel', { current: n, total: WIZARD_STEPS.length });

  return (
    <>
      {currentStep >= 1 && (
        <div className="wizard-stepper-bar">
          {WIZARD_STEPS.map((step, idx) => {
            const reached = step.num <= currentStep;
            const isCurrent = step.num === currentStep;
            return (
              <React.Fragment key={step.num}>
                {idx > 0 && <div className={`wizard-step-connector ${step.num <= currentStep ? 'filled' : ''}`} />}
                <div className={`wizard-step-node ${reached ? 'reached' : ''} ${isCurrent ? 'current' : ''}`}>
                  <span className="wizard-step-circle">
                    {reached && !isCurrent ? <Check size={14} /> : step.num}
                  </span>
                  <span className="wizard-step-label">{t(step.labelKey)}</span>
                </div>
              </React.Fragment>
            );
          })}
        </div>
      )}

      <main className="su-main">
        <div className="su-content">
          {currentStep === 0 && (
            <StepPhoneGate
              value={phoneGateValue}
              onChange={setPhoneGateValue}
              onContinue={handlePhoneGateContinue}
            />
          )}

          {currentStep === 1 && (
            <StepCategory
              category={category}
              subCategory={subCategory}
              onCategoryChange={setCategory}
              onSubCategoryChange={setSubCategory}
              onBack={skipPhoneGate ? undefined : () => setCurrentStep(0)}
              onContinue={() => setCurrentStep(2)}
              stepLabel={stepLabel(1)}
            />
          )}

          {currentStep === 2 && (
            <StepIncidentDetails
              value={incident}
              onChange={patchIncident}
              onBack={() => setCurrentStep(1)}
              onContinue={() => setCurrentStep(3)}
              stepLabel={stepLabel(2)}
            />
          )}

          {currentStep === 3 && (
            <StepVictimDetails
              value={victim}
              onChange={patchVictim}
              onBack={() => setCurrentStep(2)}
              onContinue={() => setCurrentStep(4)}
              stepLabel={stepLabel(3)}
            />
          )}

          {currentStep === 4 && (
            <StepViolatorDetails
              value={violator}
              onChange={patchViolator}
              onBack={() => setCurrentStep(3)}
              onContinue={() => setCurrentStep(5)}
              stepLabel={stepLabel(4)}
            />
          )}

          {currentStep === 5 && (
            <StepReview
              category={category}
              subCategory={subCategory}
              incident={incident}
              victim={victim}
              violator={violator}
              office={office}
              onOfficeChange={setOffice}
              onEditStep={setCurrentStep}
              onBack={() => setCurrentStep(4)}
              onSubmit={handleSubmit}
              submitting={submitting}
              stepLabel={stepLabel(5)}
            />
          )}
        </div>
      </main>
    </>
  );
}
