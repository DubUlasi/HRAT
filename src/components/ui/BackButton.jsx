import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Goes back to wherever this record conceptually belongs — the `from` nav path stamped onto
// the link that led here (ComplaintsTable/ActionQueueList/ComplaintCard; see Sidebar.jsx's
// resolveActiveNavPath, which reads the exact same signal to decide what to highlight) —
// falling back to `fallbackTo` when there's no such signal (a direct URL, a bookmark, a page
// refresh). The label is looked up from `navItems` so it always names the page it's actually
// about to go to, instead of a hardcoded string that can silently drift out of sync with where
// the button really lands (e.g. arriving from the Dashboard but the button still claiming
// "Back to Complaints").
export default function BackButton({ navItems, fallbackTo }) {
  const location = useLocation();
  const navigate = useNavigate();
  const target = location.state?.from || fallbackTo;
  const label = navItems.find((item) => item.to === target)?.label || 'Back';

  return (
    <button type="button" className="back-to-cases-btn" onClick={() => navigate(target)}>
      <ArrowLeft size={16} /> Back to {label}
    </button>
  );
}
