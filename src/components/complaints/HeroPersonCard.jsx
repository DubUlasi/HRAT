import React from 'react';
import { Phone, Mail, MapPin, Cake } from 'lucide-react';
import Avatar from '../ui/Avatar';

// A compact, contact-card-style presentation of a victim/violator, purpose-built for the
// complaint detail hero's "People Involved" section. Also reused by Track Complaint so both
// surfaces present victim/violator details identically.
export default function HeroPersonCard({ roleLabel, person, tagVariant = 'default' }) {
  return (
    <div className="hero-person-card">
      <div className="hero-person-top">
        <Avatar name={person.name} size={44} />
        <div className="hero-person-identity">
          <span className="hero-person-name">{person.name}</span>
          {(person.gender || person.ageAtIncident) && (
            <span className="hero-person-subline">
              {[person.gender, person.ageAtIncident ? `Age ${person.ageAtIncident}` : null].filter(Boolean).join(' · ')}
            </span>
          )}
        </div>
        <span className={`hero-person-tag tag-${tagVariant}`}>{roleLabel}</span>
      </div>

      <div className="hero-person-contact">
        <span><Phone size={12} /> {person.phone || '—'}</span>
        <span><Mail size={12} /> {person.email || '—'}</span>
        <span><Cake size={12} /> {person.dob || '—'}</span>
        <span className="hero-person-contact-wide"><MapPin size={12} /> {person.address || '—'}</span>
      </div>
    </div>
  );
}
