// ============================================================
// src/features/hazards/constants.ts
// ============================================================
import type { HazardType } from '@/types/database'

export const HAZARD_TYPE_CONFIG: Record<HazardType, { label: string; emoji: string; color: string }> = {
  pothole:      { label: 'Pothole',       emoji: '🕳️',  color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  open_manhole: { label: 'Open Manhole',  emoji: '⚠️',  color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'            },
  broken_glass: { label: 'Broken Glass',  emoji: '🪟',  color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  construction: { label: 'Construction',  emoji: '🚧',  color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  landslide:    { label: 'Landslide',     emoji: '🏔️', color: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-400'     },
  flood:        { label: 'Flood',         emoji: '🌊',  color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'         },
  other:        { label: 'Other',         emoji: '❗',  color: 'bg-muted text-muted-foreground'                                           },
}

export const BAGUIO_BARANGAYS = [
  'Abanao-Zandueta-Kayong-Chugum-Otek', 'Alfonso Tabora', 'Ambiong', 'Andres Bonifacio',
  'Asin Road', 'Atok Trail', 'Aurora Hill Proper', 'Bakakeng Central', 'Bakakeng North',
  'Balsigan', 'Bayan Park East', 'Bayan Park Village', 'Bayan Park West', 'BGH Compound',
  'Brookside', 'Cabinet Hill-Teachers Camp', 'Campo Filipino', 'City Camp Central',
  'City Camp Proper', 'Country Club Village', 'Dagsian Lower', 'Dagsian Upper',
  'Dominican Hill-Mirador', 'Dontogan', 'DPS Area', 'Engineers Hill', 'Fairview Village',
  'Fort del Pilar', 'Gabriela Silang', 'Glenwood', 'Guisad Central', 'Guisad Sorong',
  'Happy Hollow', 'Harrison Road', 'Holy Ghost Extension', 'Holy Ghost Proper',
  'Honeymoon (Honeymoon Road)', 'Irisan', 'Kayang-Hilltop', 'Kayang-Kamias', 'Kias',
  'Legarda-Burnham-Kisad', 'Lower Magsaysay', 'Lualhati', 'Lucnab', 'Malcolm Square-Perfecto',
  'Manuel A. Roxas', 'Military Cut-off', 'Mines View Park', 'Modern Site East',
  'New Lucban', 'Outlook Drive', 'Pacdal', 'Padre Burgos', 'Padre Zamora', 'Palma-Urbano',
  'Pinsao Proper', 'Poliwes', 'Pucsusan', 'Quezon Hill Proper', 'Quezon Hill Upper',
  'Quirino Hill East', 'Quirino Hill Lower', 'Quirino Hill Middle', 'Quirino Hill West',
  'Rizal Monument Area', 'Rock Quarry Lower', 'Rock Quarry Middle', 'Rock Quarry Upper',
  'Salisbar', 'San Antonio Village', 'San Luis Village', 'San Roque Village', 'San Vicente',
  'Santa Escolastica', 'Santo Rosario', 'Santo Tomas Proper', 'Session Road Area',
  'Slaughter House Area', 'South Drive', 'Teodora Alonzo', 'Trancoville',
  'Upper Magsaysay', 'Upper Quezon Hill Subdiv.', 'Valencia',
]



