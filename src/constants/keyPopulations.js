import { HeartHandshake, Users2, Syringe, HeartPulse, Lock, UserCircle } from 'lucide-react';

// Shown in the "Which group do they belong to?" bottom sheet when a complainant marks the
// victim as belonging to a key population, for vulnerability tracking. No such list existed
// anywhere else in the app (checked mockComplaints.js and the constants/ directory) — this is
// the single source of truth for it.
export const KEY_POPULATIONS = [
  {
    value: 'sex_worker',
    label: 'Sex Worker',
    icon: HeartHandshake,
    description: 'Engaged in sex work, currently or in the past.',
  },
  {
    value: 'lgbtq',
    label: 'LGBTQ+ Person',
    icon: Users2,
    description: 'Identifies as lesbian, gay, bisexual, transgender, or queer.',
  },
  {
    value: 'person_who_uses_drugs',
    label: 'Person Who Uses Drugs',
    icon: Syringe,
    description: 'Currently or previously used non-prescribed drugs.',
  },
  {
    value: 'person_living_with_hiv',
    label: 'Person Living with HIV',
    icon: HeartPulse,
    description: 'Living with HIV or AIDS.',
  },
  {
    value: 'person_in_detention',
    label: 'Person in Prison/Detention',
    icon: Lock,
    description: 'Currently or recently held in a correctional or detention facility.',
  },
  {
    value: 'other',
    label: 'Other/Prefer to Describe',
    icon: UserCircle,
    description: 'Belongs to a key population not listed above.',
  },
];

export function getKeyPopulation(value) {
  return KEY_POPULATIONS.find((p) => p.value === value) || null;
}
