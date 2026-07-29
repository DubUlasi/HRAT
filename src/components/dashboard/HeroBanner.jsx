import React from 'react';
import { Mic } from 'lucide-react';
import { useTypewriter } from '../../hooks/useTypewriter';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// The dashboard's hero: greeting + a rotating typewriter status line, a talking-blob button
// (wired to whatever quick-entry flow the role wants via onOpenBlobAction — voice reporting,
// call center, etc.), and a stats matrix strip along the bottom.
export default function HeroBanner({
  greetingName,
  situationMessages,
  stats,
  onOpenBlobAction,
  blobTitle = 'File a complaint by voice',
  blobAriaLabel = 'Open AI voice report',
  blobIcon: BlobIcon = Mic,
}) {
  const { text } = useTypewriter(situationMessages);

  return (
    <div className="hero-banner-card">
      <div className="hero-banner-main">
        <div className="hero-banner-content">
          <h2 className="hero-banner-title">{getGreeting()}, {greetingName}.</h2>
          <p className="hero-banner-subtitle">
            {text}
            <span className="typewriter-cursor">|</span>
          </p>
        </div>

        <button
          type="button"
          className="voice-blob-btn"
          onClick={onOpenBlobAction}
          title={blobTitle}
          aria-label={blobAriaLabel}
        >
          <span className="voice-blob-ring" />
          <span className="voice-blob-shape">
            <span className="voice-blob-shine" />
          </span>
          <BlobIcon size={24} className="voice-blob-icon" />
        </button>
      </div>

      <div className="hero-stats-matrix">
        {stats.map((stat, i) => (
          <React.Fragment key={stat.label}>
            {i > 0 && <div className="hero-matrix-divider" />}
            <div className="hero-stat-item">
              {stat.icon && (
                <div className="hero-stat-icon-box">
                  <stat.icon size={15} />
                </div>
              )}
              <div className="hero-stat-info">
                <span className="hero-stat-value">{stat.value}</span>
                <span className="hero-stat-label">{stat.label}</span>
              </div>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}
