// ============================================================
// src/features/hazards/constants.ts
// ============================================================
import type { HazardType } from '@/types/database'

export const HAZARD_TYPE_CONFIG: Record<HazardType, { label: string; emoji: string; color: string }> = {
  pothole:      { label: 'Pothole',       emoji: '🕳️',  color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  open_manhole: { label: 'Open Manhole',  emoji: '⚠️',  color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'            },
  drainage_grill:{ label: 'Drainage Grill', emoji: '🔪',  color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  broken_glass: { label: 'Broken Glass',  emoji: '🪟',  color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  construction: { label: 'Construction',  emoji: '🚧',  color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  landslide:    { label: 'Landslide',     emoji: '🏔️', color: 'bg-stone-100 text-stone-800 dark:bg-stone-900/30 dark:text-stone-400'     },
  flood:        { label: 'Flood',         emoji: '🌊',  color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'         },
  other:        { label: 'Other',         emoji: '❗',  color: 'bg-muted text-muted-foreground'                                           },
}


