import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';

// Shared "jump straight to X" card grid for dashboards — one entry per { to, icon, title,
// description, accent? }. `accent` picks the icon-tile color (info/accent/warning/violet/danger,
// same palette as .stat-card's accent-* modifiers elsewhere), defaults to 'accent' (brand green).
export default function QuickLinksGrid({ title, links }) {
  return (
    <div className="quick-links-section">
      {title && <h2 className="quick-links-title">{title}</h2>}
      <div className="quick-links-grid">
        {links.map((link) => (
          <Link key={link.to} to={link.to} className={`quick-link-card accent-${link.accent || 'accent'}`}>
            <div className="quick-link-icon"><link.icon size={19} /></div>
            <div className="quick-link-body">
              <h3>{link.title}</h3>
              <p>{link.description}</p>
            </div>
            <span className="quick-link-arrow"><ArrowRight size={15} /></span>
          </Link>
        ))}
      </div>
    </div>
  );
}
