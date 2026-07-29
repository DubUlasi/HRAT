import { Users, Landmark, HeartHandshake, Gavel } from 'lucide-react';

export const CATEGORY_LABELS = {
  women_children: 'Women & Children Rights',
  eco_soc: 'Economic, Social & Cultural Rights',
  vulnerable: 'Vulnerable Groups',
  civil_political: 'Civil & Political Rights',
};

// Maps each category to one of the app's existing status colors (see .status-* in
// complaints.css) so category pills can read at a glance instead of all sharing one color.
export const CATEGORY_COLOR = {
  women_children: 'violet',
  eco_soc: 'info',
  vulnerable: 'warning',
  civil_political: 'danger',
};

// Icon shown on the category tile in the complaint wizard's "What happened?" step.
export const CATEGORY_ICONS = {
  women_children: Users,
  eco_soc: Landmark,
  vulnerable: HeartHandshake,
  civil_political: Gavel,
};

// Simple keyword scan over free-text (a voice transcript, call notes, etc.) to pre-select a
// likely category — still just a starting point, never locked in, since a human always
// reviews/can change it before submitting. Shared by every flow that offers this suggestion
// (VoiceReportModal, CallCenterModal) so the keyword list only lives in one place.
export const CATEGORY_KEYWORDS = {
  women_children: ['children', 'minor', 'girl', 'boy'],
  eco_soc: ['land', 'property', 'eviction'],
  vulnerable: ['disability', 'elderly', 'displaced'],
  civil_political: ['police', 'arrest', 'detained', 'election'],
};

export function suggestCategoryFromText(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => lower.includes(keyword))) return category;
  }
  return null;
}
