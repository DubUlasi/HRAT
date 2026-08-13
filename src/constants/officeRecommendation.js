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
