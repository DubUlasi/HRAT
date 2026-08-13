// Sub-category options shown under "What best describes it?" once a top-level category is
// chosen in the complaint wizard. Kept as plain English labels, consistent with
// CATEGORY_LABELS itself never having been run through the i18n layer.
export const SUB_CATEGORIES = {
  gender_based_violence: [
    { value: 'abuse_by_partner', label: 'Abuse by Partner/Spouse' },
    { value: 'rape_sexual_assault', label: 'Rape/Sexual Assault' },
    { value: 'emotional_psychological_abuse', label: 'Emotional/Psychological Abuse' },
    { value: 'financial_abuse', label: 'Financial Abuse' },
    { value: 'fgm', label: 'Female Genital Mutilation (FGM)' },
    { value: 'forced_marriage', label: 'Forced Marriage' },
    { value: 'stalking_online_harassment', label: 'Stalking/Online Harassment' },
    { value: 'workplace_sexual_harassment', label: 'Workplace Sexual Harassment' },
    { value: 'trafficking', label: 'Sold/Trafficked' },
  ],
  police_brutality: [
    { value: 'excessive_force', label: 'Excessive Use of Force' },
    { value: 'assault_during_arrest', label: 'Assault During Arrest' },
    { value: 'custodial_violence', label: 'Custodial Violence' },
    { value: 'shooting_firearm', label: 'Shooting/Use of Firearm' },
    { value: 'extrajudicial_killing', label: 'Extrajudicial Killing' },
  ],
  civil_political: [
    { value: 'unlawful_detention', label: 'Unlawful Detention' },
    { value: 'unlawful_search', label: 'Unlawful Search and Seizure' },
    { value: 'freedom_of_speech', label: 'Freedom of Speech Violation' },
    { value: 'freedom_of_assembly', label: 'Freedom of Assembly Violation' },
    { value: 'electoral_rights', label: 'Electoral Rights Violation' },
    { value: 'abuse_of_office', label: 'Extortion/Abuse of Office' },
  ],
  economic_rights: [
    { value: 'land_eviction', label: 'Land Grab/Forced Eviction' },
    { value: 'denial_healthcare', label: 'Denial of Healthcare Access' },
    { value: 'denial_education', label: 'Denial of Education' },
    { value: 'wage_theft', label: 'Unpaid Wages/Wage Theft' },
    { value: 'housing_rights', label: 'Housing Rights Violation' },
    { value: 'pension_denial', label: 'Pension/Benefits Denial' },
  ],
  discrimination: [
    { value: 'disability_discrimination', label: 'Disability Discrimination' },
    { value: 'gender_discrimination', label: 'Gender Discrimination' },
    { value: 'religious_discrimination', label: 'Religious Discrimination' },
    { value: 'ethnic_discrimination', label: 'Ethnic/Tribal Discrimination' },
    { value: 'age_discrimination', label: 'Age Discrimination' },
    { value: 'denial_of_access', label: 'Denial of Public Access/Accommodation' },
  ],
  child_rights: [
    { value: 'child_labor', label: 'Child Labor' },
    { value: 'child_trafficking', label: 'Child Trafficking' },
    { value: 'child_abuse_neglect', label: 'Child Abuse/Neglect' },
    { value: 'child_denial_education', label: 'Denial of Education' },
    { value: 'custody_dispute', label: 'Custody Dispute' },
    { value: 'child_marriage', label: 'Child Marriage' },
  ],
  labour_abuse: [
    { value: 'unsafe_working_conditions', label: 'Unsafe Working Conditions' },
    { value: 'unlawful_dismissal', label: 'Unlawful Dismissal' },
    { value: 'labour_wage_theft', label: 'Wage Theft/Unpaid Wages' },
    { value: 'forced_labor', label: 'Forced Labor' },
    { value: 'workplace_harassment', label: 'Workplace Harassment (Non-Sexual)' },
  ],
  environmental_rights: [
    { value: 'illegal_dumping', label: 'Illegal Dumping/Pollution' },
    { value: 'deforestation', label: 'Deforestation' },
    { value: 'water_contamination', label: 'Water Contamination' },
    { value: 'oil_spill', label: 'Industrial/Oil Spill Damage' },
    { value: 'land_degradation', label: 'Land Degradation' },
  ],
  others: [
    { value: 'general_inquiry', label: 'General Inquiry' },
    { value: 'uncategorized', label: 'Uncategorized Complaint' },
    { value: 'other_described', label: 'Other (Please Describe in Details)' },
  ],
};

export function getSubCategories(category) {
  return SUB_CATEGORIES[category] || [];
}

// Same lightweight keyword-scan heuristic as suggestCategoryFromText, one level down — once a
// top-level category is known (picked or itself suggested), this narrows to the sub-category
// "What best describes it?" pick.
const SUB_CATEGORY_KEYWORDS = {
  abuse_by_partner: ['husband', 'wife', 'partner', 'spouse', 'boyfriend', 'girlfriend'],
  rape_sexual_assault: ['rape', 'raped', 'sexual assault', 'sexually assaulted'],
  emotional_psychological_abuse: ['emotional abuse', 'psychological abuse', 'threatened me', 'humiliated'],
  financial_abuse: ['financial abuse', 'controlled my money', 'withheld my money'],
  fgm: ['fgm', 'genital mutilation', 'circumcision'],
  forced_marriage: ['forced marriage', 'forced to marry', 'forced me to marry'],
  stalking_online_harassment: ['stalking', 'stalked', 'online harassment', 'cyberstalking'],
  workplace_sexual_harassment: ['sexually harassed at work', 'workplace sexual harassment'],
  trafficking: ['trafficked', 'trafficking', 'sold me'],

  excessive_force: ['excessive force', 'beaten', 'brutalized'],
  assault_during_arrest: ['assaulted me during arrest', 'beaten during arrest', 'assault during arrest'],
  custodial_violence: ['beaten in custody', 'beaten in the cell', 'custodial violence'],
  shooting_firearm: ['shot me', 'shooting', 'gun', 'firearm'],
  extrajudicial_killing: ['killed', 'shot dead', 'extrajudicial'],

  unlawful_detention: ['unlawful detention', 'detained', 'held without charge'],
  unlawful_search: ['searched my house', 'unlawful search', 'raided my house'],
  freedom_of_speech: ['free speech', 'silenced', 'censored'],
  freedom_of_assembly: ['protest', 'assembly', 'rally'],
  electoral_rights: ['election', 'voting', 'voter'],
  abuse_of_office: ['bribe', 'extortion', 'abuse of office'],

  land_eviction: ['evicted', 'eviction', 'land grab'],
  denial_healthcare: ['denied healthcare', 'hospital refused', 'denied medical treatment'],
  denial_education: ['denied education', 'school refused', 'expelled'],
  wage_theft: ['unpaid wages', 'wage theft', 'not paid my salary'],
  housing_rights: ['housing rights', 'landlord', 'my rent'],
  pension_denial: ['pension', 'benefits denied'],

  disability_discrimination: ['disability discrimination', 'because i am disabled'],
  gender_discrimination: ['gender discrimination'],
  religious_discrimination: ['religious discrimination', 'because of my religion'],
  ethnic_discrimination: ['ethnic discrimination', 'tribal discrimination', 'because of my tribe'],
  age_discrimination: ['age discrimination'],
  denial_of_access: ['denied access', 'refused entry'],

  child_labor: ['child labor', 'child labour', 'working children'],
  child_trafficking: ['child trafficking', 'trafficked child'],
  child_abuse_neglect: ['child abuse', 'neglected child'],
  child_denial_education: ['denied education', 'out of school'],
  custody_dispute: ['custody dispute', 'custody battle'],
  child_marriage: ['child marriage', 'married off'],

  unsafe_working_conditions: ['unsafe working conditions', 'workplace safety'],
  unlawful_dismissal: ['fired', 'dismissed', 'terminated'],
  labour_wage_theft: ['unpaid wages', 'wage theft'],
  forced_labor: ['forced labor', 'forced labour'],
  workplace_harassment: ['bullied at work', 'workplace harassment'],

  illegal_dumping: ['illegal dumping', 'dumping waste'],
  deforestation: ['deforestation', 'logging'],
  water_contamination: ['water contamination', 'contaminated water'],
  oil_spill: ['oil spill'],
  land_degradation: ['land degradation', 'erosion'],
};

export function suggestSubCategoryFromText(category, text) {
  if (!category || !text) return null;
  const lower = text.toLowerCase();
  for (const opt of getSubCategories(category)) {
    const keywords = SUB_CATEGORY_KEYWORDS[opt.value] || [];
    if (keywords.some((keyword) => lower.includes(keyword))) return opt.value;
  }
  return null;
}
