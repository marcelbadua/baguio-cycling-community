
// ============================================================
// src/features/hazards/components/hazard-form.tsx
// ============================================================
'use client'

import { useRef, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { HazardTypePicker } from './hazard-type-picker'
import { BARANGAYS } from "@/lib/constants/barangays"
import { Upload, X, Loader2 } from 'lucide-react'
import type { HazardType } from '@/types/database'
import { Input } from '@/components/ui/input'

const hazardSchema = z.object({
  hazard_type: z.enum([
    'pothole','open_manhole','broken_glass','construction','landslide','flood','other',
  ] as const, { message: 'Please select a hazard type' }),
  barangay:    z.string().min(1, 'Barangay is required'),
  landmark:    z.string().optional(),
  description: z.string().min(5, 'Please describe the hazard (min 5 characters)'),
})

export type HazardFormData = z.infer<typeof hazardSchema>

interface Props {
  onSubmit: (data: HazardFormData, photoFile?: File) => Promise<void>
  isPending?: boolean
}

export function HazardForm({ onSubmit, isPending }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const { control, register, handleSubmit, formState: { errors }, watch } = useForm<HazardFormData>({
    resolver: zodResolver(hazardSchema),
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPreview(URL.createObjectURL(file))
  }

  return (
    <form onSubmit={handleSubmit(d => onSubmit(d, photoFile ?? undefined))} className="space-y-5 px-4 mb-6">

      {/* Hazard type */}
      <div className="space-y-2">
        <Label>Hazard Type *</Label>
        <Controller
          name="hazard_type"
          control={control}
          render={({ field }) => (
            <HazardTypePicker value={field.value} onChange={field.onChange} />
          )}
        />
        {errors.hazard_type && (
          <p className="text-xs text-destructive">{errors.hazard_type.message}</p>
        )}
      </div>

      {/* Photo */}
      <div className="space-y-2">
        <Label>Photo <span className="text-muted-foreground text-xs">(strongly recommended)</span></Label>
        {preview ? (
          <div className="relative w-full h-44 rounded-lg overflow-hidden bg-muted">
            <img src={preview} className="w-full h-full object-cover" alt="" />
            <button
              type="button"
              onClick={() => { setPhotoFile(null); setPreview(null) }}
              className="absolute top-2 right-2 bg-background/80 rounded-full p-1"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 transition-colors"
          >
            <Upload className="h-5 w-5" />
            <span className="text-sm">Upload hazard photo</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
      </div>

      {/* Barangay */}
      <div className="space-y-1">
        <Label>Barangay *</Label>
        <Controller
          name="barangay"
          control={control}
          render={({ field }) => (
            <select
              {...field}
              className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
>
              <option value="" className="bg-background text-foreground">Select barangay...</option>
              {BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
          )}
        />
        {errors.barangay && <p className="text-xs text-destructive">{errors.barangay.message}</p>}
      </div>

      {/* Landmark */}
      <div className="space-y-1">
        <Label>Landmark / Street <span className="text-muted-foreground text-xs">(optional)</span></Label>
        <Input
          {...register('landmark')}
          placeholder="e.g. Near BenCab Museum, km 6 Asin Road"
        />
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Label>Description *</Label>
        <Textarea
          {...register('description')}
          placeholder="Describe the hazard — size, severity, how long it's been there..."
          rows={3}
          className="resize-none"
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      <Button type="submit" className="w-full gap-2" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : '⚠️'}
        {isPending ? 'Submitting...' : 'Submit Hazard Report'}
      </Button>
    </form>
  )
}