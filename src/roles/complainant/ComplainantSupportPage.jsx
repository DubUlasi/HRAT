import React, { useEffect, useState } from 'react';
import { Mail, Phone, MapPin, Send, HelpCircle } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import FormField from '../../components/ui/FormField';
import Input from '../../components/ui/Input';
import TextArea from '../../components/ui/TextArea';
import SuccessModal from '../../components/ui/SuccessModal';
import { useAuth } from '../../context/AuthContext';
import { getComplainantSupport, submitSupportEnquiry } from '../../api/complainantApi';
import { complainantNavItems, complainantBottomNav, complainantUser } from './navConfig';

// Was 100% static/fake before this — hardcoded FAQs, and the "Send a Message" form's submit
// handler just flipped a success flag with nothing actually sent anywhere. Now reads the real
// FAQ/helpdesk content from GET /support and actually submits the enquiry via
// POST /support/enquiries, showing the real reference number it hands back.
export default function ComplainantSupportPage() {
  const { user } = useAuth();
  const person = user || complainantUser;
  const [faqs, setFaqs] = useState([]);
  const [helpdesk, setHelpdesk] = useState(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    getComplainantSupport()
      .then((result) => {
        setFaqs(result.frequentlyAskedQuestions || []);
        setHelpdesk(result.helpdesk || null);
      })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const result = await submitSupportEnquiry(subject, message);
      setSuccessMessage(`Your message has been sent. Your reference number is ${result.referenceNumber} — keep it for follow-up.`);
      setSubject('');
      setMessage('');
    } catch (err) {
      setError(err.problem?.detail || err.message);
    }
    setSubmitting(false);
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
          {faqs.map((item) => (
            <div key={item.question} className="help-faq-item">
              <h3><HelpCircle size={14} style={{ color: 'var(--accent-color)', verticalAlign: -2, marginRight: 6 }} />{item.question}</h3>
              <p>{item.answer}</p>
            </div>
          ))}
        </div>

        <div className="categories-card">
          <h2>NHRC IT Helpdesk</h2>
          <p className="review-summary-line" style={{ marginBottom: 14 }}>
            For technical assistance or direct inquiries, please reach us through the channels below:
          </p>
          {helpdesk && (
            <>
              <a href={`mailto:${helpdesk.email}`} className="help-contact-row">
                <span className="help-contact-icon accent-info"><Mail size={16} /></span>
                <span>{helpdesk.email}</span>
              </a>
              <a href={`tel:${helpdesk.phoneNumber}`} className="help-contact-row">
                <span className="help-contact-icon accent-accent"><Phone size={16} /></span>
                <span>{helpdesk.phoneNumber}</span>
              </a>
              <div className="help-contact-row help-contact-hours">
                <span className="help-contact-icon accent-violet"><MapPin size={16} /></span>
                <span>{helpdesk.address}</span>
              </div>
            </>
          )}
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
          {error && <p className="su-field-hint-dark" style={{ color: 'var(--danger-color)' }}>{error}</p>}
          <div className="modal-actions">
            <Button type="submit" variant="primary" icon={Send} disabled={submitting}>{submitting ? 'Sending...' : 'Send Inquiry'}</Button>
          </div>
        </form>
      </div>

      <SuccessModal
        open={!!successMessage}
        message={successMessage}
        onClose={() => setSuccessMessage('')}
      />
    </AppShell>
  );
}
