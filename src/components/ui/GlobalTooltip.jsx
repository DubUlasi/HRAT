import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

const SHOW_DELAY = 350;
const GAP = 8;

// Replaces the browser's native `title` tooltip everywhere in the app — mounted once at the
// root (App.jsx), it delegates mouseover/focusin on `document` for any element with a `title`
// attribute rather than requiring every icon button/nav item to be individually converted to a
// dedicated tooltip component. The `title` attribute is temporarily removed while shown (so the
// native tooltip never renders underneath this one) and restored on hide, so anything else
// reading the DOM (screen readers, tests) still sees it normally.
export default function GlobalTooltip() {
  const [tooltip, setTooltip] = useState(null); // { text, top, left, placement }
  const targetRef = useRef(null);
  const savedTitleRef = useRef(null);
  const showTimerRef = useRef(null);

  useEffect(() => {
    const clearShowTimer = () => {
      if (showTimerRef.current) {
        clearTimeout(showTimerRef.current);
        showTimerRef.current = null;
      }
    };

    const hide = () => {
      clearShowTimer();
      if (targetRef.current && savedTitleRef.current != null) {
        targetRef.current.setAttribute('title', savedTitleRef.current);
      }
      targetRef.current = null;
      savedTitleRef.current = null;
      setTooltip(null);
    };

    const show = (el) => {
      if (targetRef.current === el) return;
      hide();
      const title = el.getAttribute('title');
      if (!title) return;
      targetRef.current = el;
      savedTitleRef.current = title;
      el.removeAttribute('title');
      showTimerRef.current = setTimeout(() => {
        const rect = el.getBoundingClientRect();
        const placement = rect.top < 48 ? 'bottom' : 'top';
        setTooltip({
          text: title,
          left: rect.left + rect.width / 2,
          top: placement === 'top' ? rect.top - GAP : rect.bottom + GAP,
          placement,
        });
      }, SHOW_DELAY);
    };

    const handleOver = (e) => {
      const el = e.target.closest('[title]');
      if (el) show(el);
    };
    const handleOut = (e) => {
      if (!targetRef.current) return;
      if (targetRef.current.contains(e.relatedTarget)) return;
      if (e.target === targetRef.current || targetRef.current.contains(e.target)) hide();
    };
    const handleFocusIn = (e) => {
      const el = e.target.closest('[title]');
      if (el) show(el);
    };
    const handleFocusOut = (e) => {
      if (targetRef.current && (e.target === targetRef.current || targetRef.current.contains(e.target))) hide();
    };

    document.addEventListener('mouseover', handleOver);
    document.addEventListener('mouseout', handleOut);
    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);
    window.addEventListener('scroll', hide, true);
    window.addEventListener('resize', hide);
    document.addEventListener('mousedown', hide);

    return () => {
      document.removeEventListener('mouseover', handleOver);
      document.removeEventListener('mouseout', handleOut);
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
      window.removeEventListener('scroll', hide, true);
      window.removeEventListener('resize', hide);
      document.removeEventListener('mousedown', hide);
      clearShowTimer();
    };
  }, []);

  if (!tooltip) return null;

  return createPortal(
    <div
      className={`global-tooltip global-tooltip-${tooltip.placement}`}
      style={{ top: tooltip.top, left: tooltip.left }}
      role="tooltip"
    >
      {tooltip.text}
    </div>,
    document.body
  );
}
