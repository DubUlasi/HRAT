import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, CheckCircle2 } from 'lucide-react';
import StatusBadge from '../ui/StatusBadge';
import EmptyState from '../ui/EmptyState';

// The dashboard's "here's what actually needs you, right now" list — every role's dashboard
// already computed its own needsX(...) predicates for the hero's stat pills; this just makes
// those same complaints clickable instead of leaving the reader to cross-reference a number
// against the general Recent Complaints table below. Reuses RelatedComplaintsPanel's row
// styling (.related-complaint-row) so it doesn't introduce a third list-row visual language.
//
// `getNavFrom(complaint)`: which nav item this row *represents*, stamped onto the link so the
// sidebar highlights it once you're on the complaint's own detail page (see Sidebar.jsx) —
// defaults to the current URL (correct for a real list page), but the Dashboard's version of
// this list needs to override it, since every row here is really "this belongs to some other
// nav item" (Needs My Action, To Assign, ...), never literally the Dashboard itself. Some
// roles' queues mix rows from two different nav pages (e.g. Director's merges New Assignments
// and Review Findings), so this is a per-row function, not a single static path.
export default function ActionQueueList({ title, items, getHref, getReason, getNavFrom, emptyMessage, viewAllHref, viewAllLabel = 'View All' }) {
  const location = useLocation();

  return (
    <div className="recent-complaints-card action-queue-card">
      <div className="section-header-flex">
        <h2>
          {title}
          {items.length > 0 && <span className="count-badge">{items.length}</span>}
        </h2>
        {viewAllHref && items.length > 0 && (
          <Link to={viewAllHref} className="btn-link">{viewAllLabel}</Link>
        )}
      </div>

      {items.length === 0 ? (
        <EmptyState icon={CheckCircle2} message={emptyMessage || "You're all caught up, nothing needs your attention right now."} />
      ) : (
        <div className="related-complaints-list">
          {items.slice(0, 6).map((c) => (
            <Link key={c.id} to={getHref(c)} state={{ from: getNavFrom ? getNavFrom(c) : location.pathname }} className="related-complaint-row">
              <div className="related-complaint-main">
                <span className="related-complaint-subject">{c.subject}</span>
                <span className="related-complaint-date">{c.complaintNumber || 'No number yet'} · Filed {new Date(c.dateFiled).toDateString()}</span>
                {getReason && <span className="related-complaint-outcome">{getReason(c)}</span>}
              </div>
              <div className="related-complaint-side">
                <StatusBadge status={c.subStatus} />
                <ChevronRight size={15} className="related-complaint-chevron" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
