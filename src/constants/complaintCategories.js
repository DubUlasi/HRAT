import { HeartCrack, Siren, Gavel, Landmark, Scale, Baby, HardHat, Leaf, MoreHorizontal } from 'lucide-react';

export const CATEGORY_LABELS = {
  gender_based_violence: 'Gender-Based Violence',
  police_brutality: 'Police Brutality',
  civil_political: 'Civil & Political Rights',
  economic_rights: 'Economic Rights',
  discrimination: 'Discrimination',
  child_rights: 'Child Rights',
  labour_abuse: 'Labour Abuse',
  environmental_rights: 'Environmental Rights',
  others: 'Others',
};

// Maps each category to one of the app's existing status colors (see .status-* in
// complaints.css) so category pills can read at a glance instead of all sharing one color.
// Only 5 colors exist, so a few categories intentionally share one.
export const CATEGORY_COLOR = {
  gender_based_violence: 'danger',
  police_brutality: 'danger',
  civil_political: 'violet',
  economic_rights: 'info',
  discrimination: 'warning',
  child_rights: 'violet',
  labour_abuse: 'warning',
  environmental_rights: 'accent',
  others: 'info',
};

// Icon shown on the category tile in the complaint wizard's "What happened?" step.
export const CATEGORY_ICONS = {
  gender_based_violence: HeartCrack,
  police_brutality: Siren,
  civil_political: Gavel,
  economic_rights: Landmark,
  discrimination: Scale,
  child_rights: Baby,
  labour_abuse: HardHat,
  environmental_rights: Leaf,
  others: MoreHorizontal,
};

// Simple keyword scan over free-text (a voice transcript, call notes, etc.) to pre-select a
// likely category — still just a starting point, never locked in, since a human always
// reviews/can change it before submitting. Shared by every flow that offers this suggestion
// (VoiceReportModal, CallCenterModal) so the keyword list only lives in one place. "Others" has
// no keywords on purpose — it's a manual fallback choice, never auto-suggested.
export const CATEGORY_KEYWORDS = {
  gender_based_violence: ['rape', 'sexual assault', 'domestic violence', 'harassment', 'trafficked', 'fgm', 'forced marriage'],
  police_brutality: ['police brutality', 'beaten', 'battery', 'baton', 'excessive force'],
  civil_political: ['arrest', 'detained', 'detention', 'unlawful search', 'election', 'protest', 'free speech'],
  economic_rights: ['land', 'property', 'eviction', 'wage', 'pension', 'healthcare', 'housing'],
  discrimination: ['discrimination', 'disability', 'disabled'],
  child_rights: ['child', 'children', 'minor', 'girl', 'boy', 'child labor', 'child labour'],
  labour_abuse: ['labour', 'labor', 'workplace', 'working conditions', 'unpaid wages'],
  environmental_rights: ['pollution', 'environment', 'oil spill', 'deforestation', 'contamination'],
  others: [],
};

export function suggestCategoryFromText(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((keyword) => lower.includes(keyword))) return category;
  }
  return null;
}
