// ============================================================
// src/features/profile/components/cyclist-type-selector.tsx
// ============================================================
'use client'

import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import type { CyclistType } from '@/types/database'

const CYCLIST_TYPE_LABELS: Record<CyclistType, string> = {
  bike_to_work:   'Bike to Work',
  bike_to_school: 'Bike to School',
  leisure:        'Leisure',
  road:           'Road',
  gravel:         'Gravel',
  mtb:            'MTB',
  downhill:       'Downhill',
  enduro:         'Enduro',
  bmx:            'BMX',
  touring:        'Touring',
  athlete:        'Athlete',
  errand:        'Errand',
}

interface Props {
  value: CyclistType[]
  onChange: (v: CyclistType[]) => void
  disabled?: boolean
}

export function CyclistTypeSelector({ value, onChange, disabled }: Props) {
  const toggle = (type: CyclistType) => {
    onChange(
      value.includes(type)
        ? value.filter(t => t !== type)
        : [...value, type]
    )
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {(Object.keys(CYCLIST_TYPE_LABELS) as CyclistType[]).map(type => (
        <div key={type} className="flex items-center space-x-2">
          <Checkbox
            id={`ct-${type}`}
            checked={value.includes(type)}
            onCheckedChange={() => toggle(type)}
            disabled={disabled}
          />
          <Label htmlFor={`ct-${type}`} className="text-sm font-normal cursor-pointer">
            {CYCLIST_TYPE_LABELS[type]}
          </Label>
        </div>
      ))}
    </div>
  )
}

export { CYCLIST_TYPE_LABELS }

