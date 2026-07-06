
// ============================================================
// src/features/hazards/components/hazard-type-picker.tsx
// ============================================================
'use client'

import { HAZARD_TYPE_CONFIG } from '../constants'
import type { HazardType } from '@/types/models'
import { cn } from '@/lib/utils'

interface Props {
  value?: HazardType
  onChange: (t: HazardType) => void
}

export function HazardTypePicker({ value, onChange }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(Object.entries(HAZARD_TYPE_CONFIG) as [HazardType, typeof HAZARD_TYPE_CONFIG[HazardType]][]).map(
        ([type, cfg]) => (
          <button
            key={type}
            type="button"
            onClick={() => onChange(type)}
            className={cn(
              'flex items-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-all',
              value === type
                ? 'border-primary bg-primary/10 text-primary ring-1 ring-primary'
                : 'border-input hover:bg-muted'
            )}
          >
            <span className="text-lg">{cfg.emoji}</span>
            <span>{cfg.label}</span>
          </button>
        )
      )}
    </div>
  )
}