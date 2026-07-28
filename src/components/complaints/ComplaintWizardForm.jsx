import React, { useState } from 'react';
import { ArrowRight, ChevronDown, Upload, FileText, CheckCircle2, ShieldAlert, Users, Info, Eye, EyeOff, Check } from 'lucide-react';
import { useComplaints } from '../../context/ComplaintsContext';
import '../../styles/signup.css';

// The full complaint wizard — same 6 steps/fields/styling as the public site's flow. Extracted
// so it can be rendered either as its own full page (ComplaintWizardPage) or inside a modal
// (MakeComplaintModal), via the `onComplete` callback instead of hard-coding navigation.
const OFFICE_ID_MAP = { abuja: 'hq' };

const WIZARD_STEPS = [
  { num: 1, label: 'Scope' },
  { num: 2, label: 'Victim' },
  { num: 3, label: 'Violator' },
  { num: 4, label: 'Category' },
  { num: 5, label: 'Incident' },
  { num: 6, label: 'Account' },
];

export default function ComplaintWizardForm({ onComplete }) {
  const { createComplaint } = useComplaints();
  const [currentStep, setCurrentStep] = useState(1);

  // Form State
  const [scope, setScope] = useState('single');

  // Victim State (Matching Alleged Violator fields)
  const [victims, setVictims] = useState([
    {
      id: 1,
      firstName: '',
      lastName: '',
      email: 'susan@example.com',
      phone: '',
      dob: '',
      gender: 'female',
      street: '',
      city: '',
      lga: '',
      postalCode: '',
      state: '',
      country: 'Nigeria'
    }
  ]);

  // Alleged Violators State
  const [violators, setViolators] = useState([
    {
      id: 1,
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      dob: '',
      gender: 'female',
      street: '',
      city: '',
      lga: '',
      postalCode: '',
      state: '',
      country: 'Nigeria'
    }
  ]);

  const [category, setCategory] = useState('women_children');
  const [incident, setIncident] = useState({
    subject: '',
    date: '',
    description: '',
    victimAges: '',
    location: '',
    office: '',
    file: null
  });

  const [account, setAccount] = useState({
    firstName: '',
    lastName: '',
    email: 'susan@example.com',
    phone: '',
    gender: 'female',
    password: 'password123',
    confirmPassword: ''
  });

  const [showPassword1, setShowPassword1] = useState(false);
  const [showPassword2, setShowPassword2] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Victim Handlers
  const addVictim = () => {
    setVictims(prev => [
      ...prev,
      {
        id: Date.now(),
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        gender: 'female',
        street: '',
        city: '',
        lga: '',
        postalCode: '',
        state: '',
        country: 'Nigeria'
      }
    ]);
  };

  const removeVictim = (id) => {
    if (victims.length > 1) {
      setVictims(prev => prev.filter(v => v.id !== id));
    }
  };

  const updateVictim = (id, field, value) => {
    setVictims(prev =>
      prev.map(v => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  // Alleged Violator Handlers
  const addViolator = () => {
    setViolators(prev => [
      ...prev,
      {
        id: Date.now(),
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        dob: '',
        gender: 'female',
        street: '',
        city: '',
        lga: '',
        postalCode: '',
        state: '',
        country: 'Nigeria'
      }
    ]);
  };

  const removeViolator = (id) => {
    if (violators.length > 1) {
      setViolators(prev => prev.filter(v => v.id !== id));
    }
  };

  const updateViolator = (id, field, value) => {
    setViolators(prev =>
      prev.map(v => (v.id === id ? { ...v, [field]: value } : v))
    );
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setIncident(prev => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitting(true);
    setTimeout(() => {
      const primaryVictim = victims[0];
      const primaryViolator = violators[0];
      createComplaint({
        subject: incident.subject,
        category,
        description: incident.description,
        office: OFFICE_ID_MAP[incident.office] || incident.office || null,
        victim: {
          name: `${primaryVictim.firstName} ${primaryVictim.lastName}`.trim(),
          gender: primaryVictim.gender,
          phone: primaryVictim.phone,
          email: primaryVictim.email,
          address: [primaryVictim.street, primaryVictim.city, primaryVictim.state, primaryVictim.country].filter(Boolean).join(', '),
        },
        allegedViolator: {
          name: `${primaryViolator.firstName} ${primaryViolator.lastName}`.trim(),
          gender: primaryViolator.gender,
          phone: primaryViolator.phone,
          email: primaryViolator.email,
          address: [primaryViolator.street, primaryViolator.city, primaryViolator.state, primaryViolator.country].filter(Boolean).join(', '),
        },
      });
      onComplete();
    }, 600);
  };

  return (
    <>
      {/* Stepper Bar */}
      <div className="wizard-stepper-bar">
        {WIZARD_STEPS.map((step, idx) => {
          const reached = step.num <= currentStep;
          const isCurrent = step.num === currentStep;
          return (
            <React.Fragment key={step.key || step.num}>
              {idx > 0 && <div className={`wizard-step-connector ${step.num <= currentStep ? 'filled' : ''}`} />}
              <div className={`wizard-step-node ${reached ? 'reached' : ''} ${isCurrent ? 'current' : ''}`}>
                <span className="wizard-step-circle">
                  {reached && !isCurrent ? <Check size={14} /> : step.num}
                </span>
                <span className="wizard-step-label">{step.label}</span>
              </div>
            </React.Fragment>
          );
        })}
      </div>

      <main className="su-main">
        <div className="su-content">
          {/* STEP 1: COMPLAINT SCOPE */}
          {currentStep === 1 && (
            <div className="su-step active">
              <div className="su-heading">
                <h1>Specify the Complaint Scope</h1>
                <p className="su-subtitle">
                  Choose whether this complaint is for an individual or a group of victims.
                </p>
              </div>

              <div className="su-scope-grid">
                <label className="su-scope-card">
                  <input
                    type="radio"
                    name="complaintScope"
                    value="single"
                    className="su-radio-input"
                    checked={scope === 'single'}
                    onChange={() => setScope('single')}
                  />
                  <span className="su-radio-circle"></span>
                  <span className="su-scope-label">Single Complaint</span>
                </label>

                <label className="su-scope-card">
                  <input
                    type="radio"
                    name="complaintScope"
                    value="group"
                    className="su-radio-input"
                    checked={scope === 'group'}
                    onChange={() => setScope('group')}
                  />
                  <span className="su-radio-circle"></span>
                  <span className="su-scope-label">Group Complaint</span>
                </label>
              </div>

              <div className="su-step1-nav">
                <button
                  type="button"
                  className="su-btn-continue"
                  onClick={() => setCurrentStep(2)}
                >
                  Continue <ArrowRight size={18} />
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: VICTIM'S INFORMATION */}
          {currentStep === 2 && (
            <div className="su-step active">
              <div className="su-heading left-align">
                <div className="su-step-label">Step 2 of 6</div>
                <h1 className="su-title-dark">Victim's Information</h1>
                <p className="su-subtitle">Provide details of the person or persons who suffered the violation.</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setCurrentStep(3); }}>
                {victims.map((victim, idx) => (
                  <div key={victim.id} className="victim-block">
                    <div className="victim-block-header">
                      <span className="victim-block-title">
                        {victims.length === 1 ? "Victim Information" : `Victim #${idx + 1}`}
                      </span>
                      {victims.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-victim"
                          onClick={() => removeVictim(victim.id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="victim-form-grid">
                      <div className="su-field-group">
                        <label className="su-label-dark">
                          First Name <span className="su-req-red">*</span>
                        </label>
                        <input
                          type="text"
                          className="su-input-blue"
                          placeholder="Ephraim"
                          value={victim.firstName}
                          onChange={(e) => updateVictim(victim.id, 'firstName', e.target.value)}
                          required
                        />
                      </div>

                      <div className="su-field-group">
                        <label className="su-label-dark">
                          Last Name <span className="su-req-red">*</span>
                        </label>
                        <input
                          type="text"
                          className="su-input-blue"
                          placeholder="Ogunlade"
                          value={victim.lastName}
                          onChange={(e) => updateVictim(victim.id, 'lastName', e.target.value)}
                          required
                        />
                      </div>

                      <div className="su-field-group">
                        <label className="su-label-dark">Email</label>
                        <input
                          type="email"
                          className="su-input-blue"
                          placeholder="damiiz6030@gmail.com"
                          value={victim.email}
                          onChange={(e) => updateVictim(victim.id, 'email', e.target.value)}
                        />
                      </div>

                      <div className="su-field-group">
                        <label className="su-label-dark">Phone Number</label>
                        <input
                          type="tel"
                          className="su-input-blue"
                          placeholder="07026450248"
                          value={victim.phone}
                          onChange={(e) => updateVictim(victim.id, 'phone', e.target.value)}
                        />
                      </div>

                      <div className="su-field-group">
                        <label className="su-label-dark">Date of Birth</label>
                        <input
                          type="date"
                          className="su-input-white"
                          value={victim.dob}
                          onChange={(e) => updateVictim(victim.id, 'dob', e.target.value)}
                        />
                      </div>

                      <div className="su-field-group">
                        <label className="su-label-dark">
                          Gender <span className="su-req-red">*</span>
                        </label>
                        <div className="su-select-wrap">
                          <select
                            className="su-input-white su-select"
                            value={victim.gender}
                            onChange={(e) => updateVictim(victim.id, 'gender', e.target.value)}
                            required
                          >
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="rather_not_say">I'd rather not say</option>
                          </select>
                          <ChevronDown className="su-select-chevron" size={16} />
                        </div>
                      </div>

                      <div className="su-field-group full-width">
                        <label className="su-label-dark">Street Information</label>
                        <input
                          type="text"
                          className="su-input-blue"
                          placeholder="battalion 3 mararaba"
                          value={victim.street}
                          onChange={(e) => updateVictim(victim.id, 'street', e.target.value)}
                        />
                      </div>

                      <div className="su-field-group col-2">
                        <label className="su-label-dark">
                          Locality/City <span className="su-req-red">*</span>
                        </label>
                        <input
                          type="text"
                          className="su-input-blue"
                          placeholder="nasarawa"
                          value={victim.city}
                          onChange={(e) => updateVictim(victim.id, 'city', e.target.value)}
                          required
                        />
                      </div>

                      <div className="su-field-group col-2">
                        <label className="su-label-dark">LGA</label>
                        <input
                          type="text"
                          className="su-input-white"
                          placeholder="karu"
                          value={victim.lga}
                          onChange={(e) => updateVictim(victim.id, 'lga', e.target.value)}
                        />
                      </div>

                      <div className="su-field-group col-2">
                        <label className="su-label-dark">Postal Code</label>
                        <input
                          type="text"
                          className="su-input-blue"
                          placeholder="950001 - 962106"
                          value={victim.postalCode}
                          onChange={(e) => updateVictim(victim.id, 'postalCode', e.target.value)}
                        />
                      </div>

                      <div className="su-field-group">
                        <label className="su-label-dark">
                          State <span className="su-req-red">*</span>
                        </label>
                        <input
                          type="text"
                          className="su-input-blue"
                          placeholder="Nasarawa"
                          value={victim.state}
                          onChange={(e) => updateVictim(victim.id, 'state', e.target.value)}
                          required
                        />
                      </div>

                      <div className="su-field-group">
                        <label className="su-label-dark">
                          Country <span className="su-req-red">*</span>
                        </label>
                        <input
                          type="text"
                          className="su-input-blue"
                          placeholder="Nigeria"
                          value={victim.country}
                          onChange={(e) => updateVictim(victim.id, 'country', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="add-victim-wrap">
                  <button type="button" className="btn-add-victim" onClick={addVictim}>
                    + Add Another Victim Information
                  </button>
                </div>

                <div className="su-step-nav">
                  <button
                    type="button"
                    className="su-btn-light-pill"
                    onClick={() => setCurrentStep(1)}
                  >
                    Back
                  </button>
                  <button type="submit" className="su-btn-purple-pill">
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 3: ALLEGED VIOLATOR'S INFORMATION */}
          {currentStep === 3 && (
            <div className="su-step active">
              <div className="su-heading left-align">
                <div className="su-step-label">Step 3 of 6</div>
                <h1 className="su-title-dark">Alleged Violator's Information</h1>
                <p className="su-subtitle">Provide details of the individual, organization, or officer responsible for the alleged violation.</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setCurrentStep(4); }}>
                {violators.map((violator, idx) => (
                  <div key={violator.id} className="victim-block">
                    <div className="victim-block-header">
                      <span className="victim-block-title">
                        {violators.length === 1 ? "Alleged Violator's Information" : `Alleged Violator #${idx + 1}`}
                      </span>
                      {violators.length > 1 && (
                        <button
                          type="button"
                          className="btn-remove-victim"
                          onClick={() => removeViolator(violator.id)}
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <div className="victim-form-grid">
                      <div className="su-field-group">
                        <label className="su-label-dark">
                          First Name <span className="su-req-red">*</span>
                        </label>
                        <input
                          type="text"
                          className="su-input-blue"
                          placeholder="Ephraim"
                          value={violator.firstName}
                          onChange={(e) => updateViolator(violator.id, 'firstName', e.target.value)}
                          required
                        />
                      </div>

                      <div className="su-field-group">
                        <label className="su-label-dark">
                          Last Name <span className="su-req-red">*</span>
                        </label>
                        <input
                          type="text"
                          className="su-input-blue"
                          placeholder="Ogunlade"
                          value={violator.lastName}
                          onChange={(e) => updateViolator(violator.id, 'lastName', e.target.value)}
                          required
                        />
                      </div>

                      <div className="su-field-group">
                        <label className="su-label-dark">Email</label>
                        <input
                          type="email"
                          className="su-input-blue"
                          placeholder="damiiz6030@gmail.com"
                          value={violator.email}
                          onChange={(e) => updateViolator(violator.id, 'email', e.target.value)}
                        />
                      </div>

                      <div className="su-field-group">
                        <label className="su-label-dark">Phone Number</label>
                        <input
                          type="tel"
                          className="su-input-blue"
                          placeholder="07026450248"
                          value={violator.phone}
                          onChange={(e) => updateViolator(violator.id, 'phone', e.target.value)}
                        />
                      </div>

                      <div className="su-field-group">
                        <label className="su-label-dark">Date of Birth</label>
                        <input
                          type="date"
                          className="su-input-white"
                          value={violator.dob}
                          onChange={(e) => updateViolator(violator.id, 'dob', e.target.value)}
                        />
                      </div>

                      <div className="su-field-group">
                        <label className="su-label-dark">
                          Gender <span className="su-req-red">*</span>
                        </label>
                        <div className="su-select-wrap">
                          <select
                            className="su-input-white su-select"
                            value={violator.gender}
                            onChange={(e) => updateViolator(violator.id, 'gender', e.target.value)}
                            required
                          >
                            <option value="female">Female</option>
                            <option value="male">Male</option>
                            <option value="rather_not_say">I'd rather not say</option>
                          </select>
                          <ChevronDown className="su-select-chevron" size={16} />
                        </div>
                      </div>

                      <div className="su-field-group full-width">
                        <label className="su-label-dark">Street Information</label>
                        <input
                          type="text"
                          className="su-input-blue"
                          placeholder="battalion 3 mararaba"
                          value={violator.street}
                          onChange={(e) => updateViolator(violator.id, 'street', e.target.value)}
                        />
                      </div>

                      <div className="su-field-group col-2">
                        <label className="su-label-dark">
                          Locality/City <span className="su-req-red">*</span>
                        </label>
                        <input
                          type="text"
                          className="su-input-blue"
                          placeholder="nasarawa"
                          value={violator.city}
                          onChange={(e) => updateViolator(violator.id, 'city', e.target.value)}
                          required
                        />
                      </div>

                      <div className="su-field-group col-2">
                        <label className="su-label-dark">LGA</label>
                        <input
                          type="text"
                          className="su-input-white"
                          placeholder="karu"
                          value={violator.lga}
                          onChange={(e) => updateViolator(violator.id, 'lga', e.target.value)}
                        />
                      </div>

                      <div className="su-field-group col-2">
                        <label className="su-label-dark">Postal Code</label>
                        <input
                          type="text"
                          className="su-input-blue"
                          placeholder="950001 - 962106"
                          value={violator.postalCode}
                          onChange={(e) => updateViolator(violator.id, 'postalCode', e.target.value)}
                        />
                      </div>

                      <div className="su-field-group">
                        <label className="su-label-dark">
                          State <span className="su-req-red">*</span>
                        </label>
                        <input
                          type="text"
                          className="su-input-blue"
                          placeholder="Nasarawa"
                          value={violator.state}
                          onChange={(e) => updateViolator(violator.id, 'state', e.target.value)}
                          required
                        />
                      </div>

                      <div className="su-field-group">
                        <label className="su-label-dark">
                          Country <span className="su-req-red">*</span>
                        </label>
                        <input
                          type="text"
                          className="su-input-blue"
                          placeholder="Nigeria"
                          value={violator.country}
                          onChange={(e) => updateViolator(violator.id, 'country', e.target.value)}
                          required
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <div className="add-victim-wrap">
                  <button type="button" className="btn-add-victim" onClick={addViolator}>
                    + Add Another Alleged Violator Information
                  </button>
                </div>

                <div className="su-step-nav">
                  <button
                    type="button"
                    className="su-btn-light-pill"
                    onClick={() => setCurrentStep(2)}
                  >
                    Back
                  </button>
                  <button type="submit" className="su-btn-purple-pill">
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 4: COMPLAINT CATEGORY */}
          {currentStep === 4 && (
            <div className="su-step active" id="stepCategory">
              <div className="su-heading left-align">
                <div className="su-step-label">Step 4 of 6</div>
                <h1 className="su-title-dark">Complaint Category</h1>
                <p className="su-subtitle">Select the main classification that best fits your human rights concern.</p>
              </div>

              <div className="green-note">
                <div className="su-note-icon">
                  <Info size={20} />
                </div>
                <div className="su-note-content">
                  <h3>Not sure which category to choose?</h3>
                  <p>Pick the closest option. NHRC legal officers review every submission and will reclassify if needed.</p>
                </div>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setCurrentStep(5); }}>
                <div className="su-category-list">
                  <label className="su-category-item">
                    <input
                      type="radio"
                      name="complaintCategory"
                      value="women_children"
                      className="su-radio-input"
                      checked={category === 'women_children'}
                      onChange={() => setCategory('women_children')}
                    />
                    <span className="su-radio-circle" style={{ marginTop: '2px' }}></span>
                    <span className="su-channel-badge badge-green">
                      <Users size={18} />
                    </span>
                    <div className="su-category-text">
                      <h3>Women & Children Rights</h3>
                      <p>Domestic violence, child labor, custody disputes, gender discrimination, trafficking.</p>
                    </div>
                  </label>

                  <label className="su-category-item">
                    <input
                      type="radio"
                      name="complaintCategory"
                      value="eco_soc"
                      className="su-radio-input"
                      checked={category === 'eco_soc'}
                      onChange={() => setCategory('eco_soc')}
                    />
                    <span className="su-radio-circle" style={{ marginTop: '2px' }}></span>
                    <span className="su-channel-badge badge-pink">
                      <FileText size={18} />
                    </span>
                    <div className="su-category-text">
                      <h3>Economic, Social & Cultural Rights</h3>
                      <p>Unlawful dismissal, denial of education, healthcare access, housing eviction.</p>
                    </div>
                  </label>

                  <label className="su-category-item">
                    <input
                      type="radio"
                      name="complaintCategory"
                      value="vulnerable"
                      className="su-radio-input"
                      checked={category === 'vulnerable'}
                      onChange={() => setCategory('vulnerable')}
                    />
                    <span className="su-radio-circle" style={{ marginTop: '2px' }}></span>
                    <span className="su-channel-badge badge-yellow">
                      <ShieldAlert size={18} />
                    </span>
                    <div className="su-category-text">
                      <h3>Vulnerable Groups</h3>
                      <p>PWD rights, elderly abuse, minority rights, internally displaced persons (IDPs).</p>
                    </div>
                  </label>

                  <label className="su-category-item">
                    <input
                      type="radio"
                      name="complaintCategory"
                      value="civil_political"
                      className="su-radio-input"
                      checked={category === 'civil_political'}
                      onChange={() => setCategory('civil_political')}
                    />
                    <span className="su-radio-circle" style={{ marginTop: '2px' }}></span>
                    <span className="su-channel-badge badge-green">
                      <CheckCircle2 size={18} />
                    </span>
                    <div className="su-category-text">
                      <h3>Civil & Political Rights</h3>
                      <p>Extrajudicial actions, unlawful detention, police brutality, freedom of speech.</p>
                    </div>
                  </label>
                </div>

                <div className="su-step-nav">
                  <button
                    type="button"
                    className="su-btn-light-pill"
                    onClick={() => setCurrentStep(3)}
                  >
                    Back
                  </button>
                  <button type="submit" className="su-btn-purple-pill">
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 5: INCIDENT DESCRIPTION */}
          {currentStep === 5 && (
            <div className="su-step active" id="stepIncident">
              <div className="su-heading left-align">
                <div className="su-step-label">Step 5 of 6</div>
                <h1 className="su-title-dark">Incident Details</h1>
                <p className="su-subtitle">Describe what happened, where, and when the violation occurred.</p>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); setCurrentStep(6); }}>
                <div className="victim-block">
                  <div className="victim-form-grid">
                    <div className="su-field-group full-width">
                      <label className="su-label-dark">
                        Subject / Title <span className="su-req-red">*</span>
                      </label>
                      <input
                        type="text"
                        className="su-input-white"
                        placeholder="Brief title of the incident"
                        value={incident.subject}
                        onChange={(e) => setIncident(prev => ({ ...prev, subject: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="su-field-group col-3">
                      <label className="su-label-dark">Date of Incident</label>
                      <input
                        type="date"
                        className="su-input-white"
                        value={incident.date}
                        onChange={(e) => setIncident(prev => ({ ...prev, date: e.target.value }))}
                      />
                    </div>

                    <div className="su-field-group col-3">
                      <label className="su-label-dark">Victim Ages</label>
                      <input
                        type="text"
                        className="su-input-white"
                        placeholder="e.g. 24, 30"
                        value={incident.victimAges}
                        onChange={(e) => setIncident(prev => ({ ...prev, victimAges: e.target.value }))}
                      />
                    </div>

                    <div className="su-field-group col-3">
                      <label className="su-label-dark">Location</label>
                      <input
                        type="text"
                        className="su-input-white"
                        placeholder="State / L.G.A"
                        value={incident.location}
                        onChange={(e) => setIncident(prev => ({ ...prev, location: e.target.value }))}
                      />
                    </div>

                    <div className="su-field-group full-width">
                      <label className="su-label-dark">
                        Detailed Description <span className="su-req-red">*</span>
                      </label>
                      <textarea
                        className="su-textarea-white"
                        rows="5"
                        placeholder="Explain the events in detail..."
                        value={incident.description}
                        onChange={(e) => setIncident(prev => ({ ...prev, description: e.target.value }))}
                        required
                      ></textarea>
                    </div>

                    <div className="su-field-group full-width">
                      <label className="su-label-dark">Preferred NHRC Office</label>
                      <div className="su-select-wrap">
                        <select
                          className="su-input-white su-select"
                          value={incident.office}
                          onChange={(e) => setIncident(prev => ({ ...prev, office: e.target.value }))}
                        >
                          <option value="">-- Select Office --</option>
                          <option value="abuja">Headquarters - Abuja</option>
                          <option value="lagos">Lagos State Office</option>
                          <option value="kano">Kano State Office</option>
                          <option value="enugu">Enugu State Office</option>
                          <option value="rivers">Rivers State Office</option>
                        </select>
                        <ChevronDown className="su-select-chevron" size={16} />
                      </div>
                    </div>

                    <div className="su-field-group full-width">
                      <label className="su-label-dark">Attach Supporting Document / Evidence</label>
                      <div className="su-file-upload-wrap">
                        <label className="su-file-btn">
                          <Upload size={16} style={{ marginRight: '8px' }} />
                          Choose File
                          <input
                            type="file"
                            className="su-file-input"
                            onChange={handleFileChange}
                          />
                        </label>
                        <span className="su-file-name">
                          {incident.file ? incident.file.name : "No file chosen"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="su-step-nav">
                  <button
                    type="button"
                    className="su-btn-light-pill"
                    onClick={() => setCurrentStep(4)}
                  >
                    Back
                  </button>
                  <button type="submit" className="su-btn-purple-pill">
                    Continue <ArrowRight size={18} />
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 6: ACCOUNT & SUBMISSION */}
          {currentStep === 6 && (
            <div className="su-step active">
              <div className="su-heading left-align">
                <div className="su-step-label">Step 6 of 6</div>
                <h1 className="su-title-dark">Complainant Account & Submit</h1>
                <p className="su-subtitle">Review your contact details and set password to track status.</p>
              </div>

              <form onSubmit={handleSubmit}>
                <div className="victim-block">
                  <div className="victim-form-grid">
                    <div className="su-field-group">
                      <label className="su-label-dark">
                        First Name <span className="su-req-red">*</span>
                      </label>
                      <input
                        type="text"
                        className="su-input-white"
                        value={account.firstName}
                        onChange={(e) => setAccount(prev => ({ ...prev, firstName: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="su-field-group">
                      <label className="su-label-dark">
                        Last Name <span className="su-req-red">*</span>
                      </label>
                      <input
                        type="text"
                        className="su-input-white"
                        value={account.lastName}
                        onChange={(e) => setAccount(prev => ({ ...prev, lastName: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="su-field-group">
                      <label className="su-label-dark">
                        Email Address <span className="su-req-red">*</span>
                      </label>
                      <input
                        type="email"
                        className="su-input-blue"
                        value={account.email}
                        onChange={(e) => setAccount(prev => ({ ...prev, email: e.target.value }))}
                        required
                      />
                    </div>

                    <div className="su-field-group">
                      <label className="su-label-dark">Phone Number</label>
                      <input
                        type="tel"
                        className="su-input-white"
                        value={account.phone}
                        onChange={(e) => setAccount(prev => ({ ...prev, phone: e.target.value }))}
                      />
                    </div>

                    <div className="su-field-group">
                      <label className="su-label-dark">Password <span className="su-req-red">*</span></label>
                      <div className="password-wrapper">
                        <input
                          type={showPassword1 ? 'text' : 'password'}
                          className="su-input-blue"
                          value={account.password}
                          onChange={(e) => setAccount(prev => ({ ...prev, password: e.target.value }))}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword1(!showPassword1)}
                        >
                          {showPassword1 ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="su-field-group">
                      <label className="su-label-dark">Confirm Password <span className="su-req-red">*</span></label>
                      <div className="password-wrapper">
                        <input
                          type={showPassword2 ? 'text' : 'password'}
                          className="su-input-white"
                          value={account.confirmPassword}
                          onChange={(e) => setAccount(prev => ({ ...prev, confirmPassword: e.target.value }))}
                          required
                        />
                        <button
                          type="button"
                          className="password-toggle"
                          onClick={() => setShowPassword2(!showPassword2)}
                        >
                          {showPassword2 ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="su-step-nav">
                  <button
                    type="button"
                    className="su-btn-light-pill"
                    onClick={() => setCurrentStep(5)}
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    className="su-btn-green-submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Submitting...' : 'Submit Complaint'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
