// Sub-category options shown under "What best describes it?" once a top-level category is
// chosen in the complaint wizard. Kept as plain English labels, consistent with
// CATEGORY_LABELS itself never having been run through the i18n layer.
export const SUB_CATEGORIES = {
  women_children: [
    { value: 'abuse_by_partner', label: 'Abuse by Partner/Spouse' },
    { value: 'rape_sexual_assault', label: 'Rape/Sexual Assault' },
    { value: 'emotional_psychological_abuse', label: 'Emotional/Psychological Abuse' },
    { value: 'financial_abuse', label: 'Financial Abuse' },
    { value: 'fgm', label: 'Female Genital Mutilation (FGM)' },
    { value: 'forced_marriage', label: 'Forced Marriage' },
    { value: 'stalking_online_harassment', label: 'Stalking/Online Harassment' },
    { value: 'trafficking', label: 'Sold/Trafficked' },
    { value: 'child_labor', label: 'Child Labor' },
    { value: 'custody_dispute', label: 'Custody Dispute' },
  ],
  eco_soc: [
    { value: 'unlawful_dismissal', label: 'Unlawful Dismissal' },
    { value: 'land_eviction', label: 'Land Grab/Forced Eviction' },
    { value: 'denial_education', label: 'Denial of Education' },
    { value: 'denial_healthcare', label: 'Denial of Healthcare Access' },
    { value: 'wage_theft', label: 'Unpaid Wages/Wage Theft' },
    { value: 'unsafe_working_conditions', label: 'Unsafe Working Conditions' },
    { value: 'housing_rights', label: 'Housing Rights Violation' },
  ],
  vulnerable: [
    { value: 'disability_discrimination', label: 'Disability Discrimination' },
    { value: 'elderly_abuse', label: 'Elderly Abuse/Neglect' },
    { value: 'minority_rights', label: 'Minority Rights Violation' },
    { value: 'idp_rights', label: 'Internally Displaced Persons (IDP) Rights' },
    { value: 'refugee_rights', label: 'Refugee Rights' },
    { value: 'denial_of_access', label: 'Denial of Public Access/Accommodation' },
  ],
  civil_political: [
    { value: 'unlawful_detention', label: 'Unlawful Detention' },
    { value: 'police_brutality', label: 'Police Brutality' },
    { value: 'extrajudicial_action', label: 'Extrajudicial Action' },
    { value: 'freedom_of_speech', label: 'Freedom of Speech Violation' },
    { value: 'freedom_of_assembly', label: 'Freedom of Assembly Violation' },
    { value: 'electoral_rights', label: 'Electoral Rights Violation' },
    { value: 'torture', label: 'Torture/Inhumane Treatment' },
  ],
};

export function getSubCategories(category) {
  return SUB_CATEGORIES[category] || [];
}
