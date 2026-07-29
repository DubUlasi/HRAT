import React from 'react';
import { Mail, Phone, FileText, ShieldCheck, Users, Send } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import { registryHeadNavItems, registryHeadUser } from './navConfig';

const PIPELINE_STEPS = [
  { icon: FileText, title: 'Assign a Complaint Number', text: 'New complaints need a Registry Officer assigned to give them a tracking number.' },
  { icon: ShieldCheck, title: 'Assign for Admissibility Check', text: 'Once numbered, assign an officer to determine whether the complaint is admissible.' },
  { icon: Users, title: 'Confirm Admissibility', text: 'Review the officer\'s decision and confirm it before the case can move forward.' },
  { icon: Send, title: 'Assign to a Department', text: 'Admissible complaints get routed to the office and department that will investigate.' },
];

const FAQS = [
  { q: 'Why can\'t I assign a department yet?', a: 'A complaint must be confirmed admissible first, the "Assign To Department" action only appears once that step is complete.' },
  { q: 'What happens after I assign a department?', a: 'The Department Director takes over from there, assigning a supervisor, then an investigator, until findings come back to the registry.' },
  { q: 'Can a complainant withdraw a complaint?', a: 'Yes, from their own dashboard. Withdrawn complaints stay visible here for your records but drop out of active pipelines.' },
];

export default function RegistryHeadHelpPage() {
  return (
    <AppShell navItems={registryHeadNavItems} user={registryHeadUser}>
      <PageHeader title="Help" subtitle="How the registry pipeline works, and how to reach support." />

      <div className="categories-card">
        <h2>The Complaint Pipeline</h2>
        <div className="help-steps-grid">
          {PIPELINE_STEPS.map((step, i) => (
            <div className="help-step" key={step.title}>
              <div className="help-step-icon"><step.icon size={18} /></div>
              <div>
                <h3>{i + 1}. {step.title}</h3>
                <p>{step.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="categories-card">
          <h2>Frequently Asked Questions</h2>
          {FAQS.map((item) => (
            <div className="help-faq-item" key={item.q}>
              <h3>{item.q}</h3>
              <p>{item.a}</p>
            </div>
          ))}
        </div>

        <div className="categories-card">
          <h2>Contact Support</h2>
          <div className="help-contact-row">
            <Mail size={16} />
            <span>support@nhrc.gov.ng</span>
          </div>
          <div className="help-contact-row">
            <Phone size={16} />
            <span>+234 800 000 0000</span>
          </div>
          <p className="help-contact-note">Available weekdays, 9am – 5pm WAT.</p>
        </div>
      </div>
    </AppShell>
  );
}
