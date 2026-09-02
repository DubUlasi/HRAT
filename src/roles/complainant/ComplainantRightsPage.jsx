import React, { useState } from 'react';
import { ShieldAlert, BookOpen, Scale, ArrowRight, ShieldCheck, HeartPulse } from 'lucide-react';
import AppShell from '../../components/layout/AppShell';
import PageHeader from '../../components/layout/PageHeader';
import Button from '../../components/ui/Button';
import MakeComplaintModal from '../../components/complaints/MakeComplaintModal';
import { useAuth } from '../../context/AuthContext';
import { complainantNavItems, complainantBottomNav, complainantUser } from './navConfig';

const RIGHTS = [
  {
    id: 'life',
    icon: HeartPulse,
    title: 'Right to Life',
    description: 'Every person has a right to life, and no one shall be deprived intentionally of his life, save in execution of the sentence of a court in respect of a criminal offence of which he has been found guilty.',
    article: 'Section 33, Chapter IV',
  },
  {
    id: 'dignity',
    icon: ShieldCheck,
    title: 'Right to Dignity of Human Person',
    description: 'Every individual is entitled to respect for the dignity of his person. No person shall be subjected to torture or to inhuman or degrading treatment, held in slavery or servitude, or required to perform forced labor.',
    article: 'Section 34, Chapter IV',
  },
  {
    id: 'liberty',
    icon: Scale,
    title: 'Right to Personal Liberty',
    description: 'Every person shall be entitled to his personal liberty and no person shall be deprived of such liberty save in specific legal circumstances and in accordance with a procedure permitted by law.',
    article: 'Section 35, Chapter IV',
  },
  {
    id: 'hearing',
    icon: Scale,
    title: 'Right to Fair Hearing',
    description: 'In the determination of his civil rights and obligations, a person shall be entitled to a fair hearing within a reasonable time by a court or other tribunal established by law.',
    article: 'Section 36, Chapter IV',
  },
  {
    id: 'private',
    icon: BookOpen,
    title: 'Right to Private & Family Life',
    description: 'The privacy of citizens, their homes, correspondence, telephone conversations, and telegraphic communications is guaranteed and protected by the State.',
    article: 'Section 37, Chapter IV',
  },
  {
    id: 'expression',
    icon: ShieldAlert,
    title: 'Right to Freedom of Expression',
    description: 'Every person shall be entitled to freedom of expression, including freedom to hold opinions and to receive and impart ideas and information without interference.',
    article: 'Section 39, Chapter IV',
  },
];

export default function ComplainantRightsPage() {
  const { user } = useAuth();
  const person = user || complainantUser;
  const [activeRight, setActiveRight] = useState(RIGHTS[0].id);
  const selectedRight = RIGHTS.find((r) => r.id === activeRight);
  const [showNewModal, setShowNewModal] = useState(false);

  return (
    <AppShell navItems={complainantNavItems} user={person} bottomNavItems={complainantBottomNav} mobileClassName="complainant-mobile-view">
      <PageHeader
        title="Learn About Your Rights"
        subtitle="Understand the fundamental human rights guaranteed to every citizen under Chapter IV of the Constitution."
      />

      <div className="dashboard-grid">
        <div className="categories-card">
          <h2 style={{ fontSize: 16, marginBottom: 14 }}>Guaranteed Civil Rights</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {RIGHTS.map((r) => {
              const Icon = r.icon;
              const isActive = r.id === activeRight;
              return (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setActiveRight(r.id)}
                  className={`rights-list-item ${isActive ? 'active' : ''}`}
                >
                  <div className={`rights-list-icon ${isActive ? 'active' : ''}`}>
                    <Icon size={16} />
                  </div>
                  <div>
                    <div className="rights-list-title">{r.title}</div>
                    <div className="rights-list-article">{r.article}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="categories-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <span className="rights-article-tag">{selectedRight.article}</span>
            <h2 style={{ fontSize: 20, marginTop: 14, fontWeight: 700 }}>{selectedRight.title}</h2>
            <p className="rights-description-box">{selectedRight.description}</p>

            <div style={{ marginTop: 24 }}>
              <h4 style={{ fontSize: 13, fontWeight: 700 }}>What is a human rights violation?</h4>
              <p className="review-summary-line" style={{ marginTop: 6 }}>
                A violation occurs when state actors (such as law enforcement officers or government agencies) or private entities break constitutional guarantees, including illegal arrests, excessive force, or discriminatory actions.
              </p>
            </div>
          </div>

          <div style={{ marginTop: 30, paddingTop: 16, borderTop: '1px solid var(--card-border)' }}>
            <h4 style={{ fontSize: 13.5, fontWeight: 700 }}>Has this right been violated?</h4>
            <p className="review-summary-line" style={{ marginBottom: 14 }}>
              You can instantly file a formal complaint with the National Human Rights Commission.
            </p>
            <Button variant="primary" icon={ArrowRight} onClick={() => setShowNewModal(true)}>
              File a Formal Report
            </Button>
          </div>
        </div>
      </div>

      <MakeComplaintModal open={showNewModal} onClose={() => setShowNewModal(false)} isComplainant />
    </AppShell>
  );
}
