// Lightweight mocked "AI" department suggester — same keyword-scan pattern as
// suggestCategoryFromText in complaintCategories.js. A starting point only, never locked in;
// shown as a suggestion chip wherever Registry Head or a Department Director is picking (or
// re-picking, after a rejection) a department for a complaint.
export const DEPARTMENT_KEYWORDS = {
  'women-children': ['child', 'children', 'minor', 'girl', 'boy', 'maternity', 'pregnant', 'pregnancy', 'custody', 'trafficking', 'domestic violence'],
  'civil-political': ['arrest', 'detained', 'detention', 'unlawful search', 'protest', 'election', 'checkpoint', 'police', 'extrajudicial', 'free speech'],
  'eco-soc': ['eviction', 'land', 'pension', 'healthcare', 'hospital', 'housing', 'wage', 'workplace', 'labour', 'labor', 'employment'],
  'vulnerable-groups': ['disability', 'disabled', 'wheelchair', 'elderly', 'aged', 'care home', 'mobility aid'],
};

export function suggestDepartmentFromText(text) {
  if (!text) return null;
  const lower = text.toLowerCase();
  for (const [department, keywords] of Object.entries(DEPARTMENT_KEYWORDS)) {
    if (keywords.some((keyword) => lower.includes(keyword))) return department;
  }
  return null;
}
