import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import SuccessModal from '../../components/ui/SuccessModal';
import { useAuth } from '../../context/AuthContext';
import { complainantNavItems, complainantBottomNav, complainantUser } from './navConfig';

const FAQS = [
  { q: 'How long does an investigation take?', a: 'Investigation times vary based on case complexity and evidence availability. On average, admissibility checks take 5-7 business days, while full investigations may take 4-8 weeks.' },
  { q: 'Can I submit evidence after filing a complaint?', a: 'Yes. If you need to submit additional documents or recordings, you can send them to our support team referencing your Complaint Number, or hand them in at the nearest NHRC state office.' },
  { q: 'Is my personal information kept confidential?', a: 'Absolutely. The NHRC treats all complainant information with strict confidentiality. Identity details are only shared with relevant investigators and legal officers as permitted by the Commission guidelines.' },
];

export default function ComplainantSupportPage() {
  const { user } = useAuth();
  const person = user || complainantUser;
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuccess(true);
    setSubject('');
    setMessage('');
  };

  return (
    <AppShell navItems={complainantNavItems} user={person} bottomNavItems={complainantBottomNav} mobileClassName="complainant-mobile-view">
      <PageHeader
        title="Contact Support"
        subtitle="Get in touch with the NHRC desk officers, check FAQs, or report issues with the portal."
      />

      <div className="dashboard-grid">
        <div className="categories-card">
          <h2>Frequently Asked Questions</h2>
          {FAQS.map((item) => (
            <div key={item.q} className="help-faq-item">
              <h3><HelpCircle size={14} style={{ color: 'var(--accent-color)', verticalAlign: -2, marginRight: 6 }} />{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>

        <div className="categories-card">
          <h2>NHRC IT Helpdesk</h2>
          <p className="review-summary-line" style={{ marginBottom: 14 }}>
            For technical assistance or direct inquiries, please reach us through the channels below:
          </p>
          <a href="mailto:support@nhrc.gov.ng" className="help-contact-row">
            <span className="help-contact-icon accent-info"><Mail size={16} /></span>
            <span>support@nhrc.gov.ng</span>
          </a>
          <a href="tel:+2348000000000" className="help-contact-row">
            <span className="help-contact-icon accent-accent"><Phone size={16} /></span>
            <span>+234 800 000 0000</span>
          </a>
          <div className="help-contact-row help-contact-hours">
            <span className="help-contact-icon accent-violet"><MapPin size={16} /></span>
            <span>National Human Rights Commission HQ, 19 Aguiyi Ironsi Street, Maitama, Abuja.</span>
          </div>
        </div>
      </div>

      <div className="categories-card" style={{ marginTop: 14 }}>
        <h2>Send a Message</h2>
        <p className="review-summary-line" style={{ marginBottom: 14 }}>
          Have a specific question about your case? Send us a direct query and our officers will respond via email.
        </p>

        <form onSubmit={handleSubmit}>
          <FormField label="Subject / Reference Number" required>
            <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g. Question about case NHRC/2026/0412" required />
          </FormField>
          <FormField label="Your Message" required>
            <TextArea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Type details of your request here..." required />
          </FormField>
          <div className="modal-actions">
            <Button type="submit" variant="primary" icon={Send}>Send Inquiry</Button>
          </div>
        </form>
      </div>

      <SuccessModal
        open={showSuccess}
        message="Your message has been sent successfully. A support officer will review and respond shortly."
        onClose={() => setShowSuccess(false)}
      />
    </AppShell>
  );
}
