import React from 'react';
import { useTypewriter } from '../../hooks/useTypewriter';

function getGreeting() {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  return 'Good evening';
}

// The dashboard's hero: greeting + a rotating typewriter status line, an optional rightSlot
// (whatever quick-entry widget the role wants — a quick complaint tracker, a voice button, etc.),
// and a stats matrix strip along the bottom.
export default function HeroBanner({
  greetingName,
  situationMessages,
  stats,
  rightSlot,
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

        {rightSlot}
      </div>

      <div className="hero-stats-matrix">
        {stats.map((stat, i) => (
          <React.Fragment key={stat.label}>
            {i > 0 && <div className="hero-matrix-divider" />}
            <div className="hero-stat-item">
              {stat.icon && (
                <div className="hero-stat-icon-box">
                  <stat.icon size={17} />
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
