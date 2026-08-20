// Recommends a handling office from an incident's "City, State" location, grouped along
// Nigeria's geopolitical zones onto the 4 state offices — headquarters (Abuja) is only ever
// recommended for an FCT incident, matching how head office is actually meant to be used.
export const STATE_TO_OFFICE = {
  FCT: 'abuja',

  // South West -> Lagos office
  Lagos: 'lagos',
  Ogun: 'lagos',
  Oyo: 'lagos',
  Osun: 'lagos',
  Ondo: 'lagos',
  Ekiti: 'lagos',
  // North Central (west-adjacent) -> Lagos office
  Niger: 'lagos',
  Kwara: 'lagos',

  // South East -> Enugu office
  Abia: 'enugu',
  Anambra: 'enugu',
  Ebonyi: 'enugu',
  Enugu: 'enugu',
  Imo: 'enugu',
  // North Central (east-adjacent) -> Enugu office
  Benue: 'enugu',
  Kogi: 'enugu',
  Nasarawa: 'enugu',
  Plateau: 'enugu',

  // South South -> Rivers office
  'Akwa Ibom': 'rivers',
  Bayelsa: 'rivers',
  'Cross River': 'rivers',
  Delta: 'rivers',
  Edo: 'rivers',
  Rivers: 'rivers',

  // North West + North East -> Kano office
  Kaduna: 'kano',
  Katsina: 'kano',
  Kano: 'kano',
  Jigawa: 'kano',
  Sokoto: 'kano',
  Zamfara: 'kano',
  Kebbi: 'kano',
  Adamawa: 'kano',
  Bauchi: 'kano',
  Borno: 'kano',
  Gombe: 'kano',
  Taraba: 'kano',
  Yobe: 'kano',
};

// `location` is a "City, State" string (see nigeriaLocations.js) — the state is always the
// last comma-separated segment.
export function suggestOfficeFromLocation(location) {
  if (!location) return null;
  const state = location.split(',').pop().trim();
  return STATE_TO_OFFICE[state] || null;
}

export const OFFICE_ORDER = ['abuja', 'lagos', 'kano', 'enugu', 'rivers'];

// Which offices are actually worth offering for a given complaint: head office (a safe,
// universal fallback/escalation point) plus whichever state offices cover where the incident
// happened, where the victim(s) are, or where the alleged violator(s) are — a case can easily
// span more than one of these (victim in one state, incident or violator in another), so this
// is a union across all three sources, not just the incident's own location.
export function relevantOfficesForComplaint(incidentLocation, victims = [], violators = []) {
  const relevant = new Set(['abuja']);
  const consider = (location) => {
    const office = suggestOfficeFromLocation(location);
    if (office) relevant.add(office);
  };
  consider(incidentLocation);
  victims.forEach((v) => consider(v.address));
  violators.forEach((v) => consider(v.address));
  return OFFICE_ORDER.filter((id) => relevant.has(id));
}

// The single best-guess office to pre-select — incident location first (the strongest signal
// of where intervention is physically needed), falling back to a victim's or violator's own
// address when the incident location wasn't given.
export function recommendedOfficeForComplaint(incidentLocation, victims = [], violators = []) {
  const fromIncident = suggestOfficeFromLocation(incidentLocation);
  if (fromIncident) return fromIncident;
  const fromVictim = victims.map((v) => suggestOfficeFromLocation(v.address)).find(Boolean);
  if (fromVictim) return fromVictim;
  return violators.map((v) => suggestOfficeFromLocation(v.address)).find(Boolean) || null;
}
