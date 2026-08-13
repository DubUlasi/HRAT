import { NIGERIA_LOCATIONS } from './nigeriaLocations';
import { STATE_TO_OFFICE } from './officeRecommendation';

// Same "lightweight keyword/regex heuristic" style as suggestCategoryFromText and
// suggestOfficeFromLocation — a starting point pre-filled from the voice transcript, never
// locked in, since a human always reviews every field before submitting.

const NAME_STOPWORDS = new Set([
  'and', 'who', 'which', 'was', 'is', 'were', 'the', 'a', 'an', 'that', 'to', 'me', 'my',
  'i', 'he', 'she', 'they', 'it', 'his', 'her', 'their', 'so', 'but', 'because', 'when', 'at',
]);

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function cleanCapturedName(raw) {
  const words = raw.trim().split(/\s+/).filter(Boolean);
  while (words.length > 1 && NAME_STOPWORDS.has(words[words.length - 1].toLowerCase())) {
    words.pop();
  }
  if (!words.length) return null;
  return words
    .slice(0, 3)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}

function firstMatch(text, patterns) {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      const cleaned = cleanCapturedName(match[1]);
      if (cleaned) return cleaned;
    }
  }
  return null;
}

const NAME_GROUP = "([a-zA-Z'-]+(?:\\s+[a-zA-Z'-]+){0,2})";

const VICTIM_NAME_PATTERNS = [
  new RegExp(`my name is ${NAME_GROUP}`, 'i'),
  new RegExp(`the victim'?s? name (?:is|was) ${NAME_GROUP}`, 'i'),
  new RegExp(`victim'?s? name,? ${NAME_GROUP}`, 'i'),
];

const VIOLATOR_NAME_PATTERNS = [
  new RegExp(`(?:the )?(?:officer|policeman|police officer|perpetrator|accused|violator)'?s? name (?:is|was) ${NAME_GROUP}`, 'i'),
  new RegExp(`(?:his|her|their) name (?:is|was) ${NAME_GROUP}`, 'i'),
];

// Looks for the victim explicitly identifying themselves ("my name is ...") or being named
// ("the victim's name is ..."). Checked before the violator patterns are even relevant since
// callers only run the one they need.
export function extractVictimNameFromText(text) {
  if (!text) return null;
  return firstMatch(text, VICTIM_NAME_PATTERNS);
}

// Looks for the alleged violator being named — "the officer's name was ...", "his name is ...".
export function extractViolatorNameFromText(text) {
  if (!text) return null;
  return firstMatch(text, VIOLATOR_NAME_PATTERNS);
}

// Splits a "First Last" (or "First Middle Last") guess into { firstName, lastName } — the
// wizard's person fields are always split first/last, never a single combined name.
export function splitName(fullName) {
  if (!fullName) return { firstName: '', lastName: '' };
  const words = fullName.trim().split(/\s+/);
  return { firstName: words[0] || '', lastName: words.slice(1).join(' ') };
}

// Scans for a mentioned Nigerian city (preferred, since it comes with its state attached) or,
// failing that, a bare state name — same source lists the location autocomplete and the office
// recommendation map already use, so anything found here plugs straight into both.
export function extractLocationFromText(text) {
  if (!text) return null;

  let best = null;
  for (const entry of NIGERIA_LOCATIONS) {
    const city = entry.split(',')[0].trim();
    const pattern = new RegExp(`\\b${escapeRegExp(city)}\\b`, 'i');
    if (pattern.test(text) && (!best || city.length > best.city.length)) {
      best = { city, entry };
    }
  }
  if (best) return best.entry;

  let bestState = null;
  for (const state of Object.keys(STATE_TO_OFFICE)) {
    const pattern = new RegExp(`\\b${escapeRegExp(state)}\\b`, 'i');
    if (pattern.test(text) && (!bestState || state.length > bestState.length)) {
      bestState = state;
    }
  }
  return bestState;
}

// Builds a short subject/title from the first sentence (or first ~10 words) of the transcript —
// the same "give this a short title" field the typed flow's Incident step asks for, pre-filled
// here instead of left for the complainant to type themselves.
export function extractSubjectFromText(text) {
  if (!text) return '';
  const trimmed = text.trim();
  if (!trimmed) return '';

  const sentenceMatch = trimmed.match(/^[^.!?\n]+/);
  let subject = sentenceMatch ? sentenceMatch[0].trim() : trimmed;

  const words = subject.split(/\s+/);
  if (words.length > 10) subject = `${words.slice(0, 10).join(' ')}...`;

  return subject.charAt(0).toUpperCase() + subject.slice(1);
}
