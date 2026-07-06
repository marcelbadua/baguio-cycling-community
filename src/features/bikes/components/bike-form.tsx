// ============================================================
// src/features/bikes/components/bike-form.tsx
// Used for both Create and Edit
// ============================================================
'use client'

import { useRef, useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Upload, X } from 'lucide-react'
import type { Bike } from '@/types/models'

const WHEEL_SIZES = ['20"', '24"', '26"', '27.5"', '29"', '700c', '650b', 'Other']
const FRAME_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '13"', '15"', '17"', '19"', '21"', 'Other']

const bikeSchema = z.object({
  nickname:   z.string().optional(),
  brand:      z.string().min(1, 'Brand is required'),
  model:      z.string().optional(),
  year:       z.coerce.number().int().min(1980).max(new Date().getFullYear() + 1).optional().or(z.literal('')),
  wheel_size: z.string().optional(),
  frame_size: z.string().optional(),
  notes:      z.string().max(500).optional(),
})

export type BikeFormData = z.infer<typeof bikeSchema>

interface Props {
  defaultValues?: Partial<Bike>
  onSubmit: (data: BikeFormData, photoFile?: File) => Promise<void>
  isPending?: boolean
  submitLabel?: string
}

export function BikeForm({ defaultValues, onSubmit, isPending, submitLabel = 'Save Bike' }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoPreview, setPhotoPreview] = useState<string | null>(defaultValues?.photo_url ?? null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm<BikeFormData>({
    resolver: zodResolver(bikeSchema) as any,
    defaultValues: {
      nickname:   defaultValues?.nickname ?? '',
      brand:      defaultValues?.brand ?? '',
      model:      defaultValues?.model ?? '',
      year:       defaultValues?.year ?? '',
      wheel_size: defaultValues?.wheel_size ?? '',
      frame_size: defaultValues?.frame_size ?? '',
      notes:      defaultValues?.notes ?? '',
    },
  })

  useEffect(() => {
    if (defaultValues) {
      reset({
        nickname:   defaultValues.nickname ?? '',
        brand:      defaultValues.brand ?? '',
        model:      defaultValues.model ?? '',
        year:       defaultValues.year ?? '',
        wheel_size: defaultValues.wheel_size ?? '',
        frame_size: defaultValues.frame_size ?? '',
        notes:      defaultValues.notes ?? '',
      })
      setPhotoPreview(defaultValues.photo_url ?? null)
    }
  }, [defaultValues, reset])

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPhotoFile(file)
    setPhotoPreview(URL.createObjectURL(file))
  }

  const clearPhoto = () => {
    setPhotoFile(null)
    setPhotoPreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleFormSubmit = async (data: BikeFormData) => {
    await onSubmit(data, photoFile ?? undefined)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5 px-4 mb-6">
      {/* Photo Upload */}
      <div className="space-y-2">
        <Label>Bike Photo</Label>
        {photoPreview ? (
          <div className="relative w-full h-48 rounded-lg overflow-hidden bg-muted">
            <img src={photoPreview} alt="Bike preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={clearPhoto}
              className="absolute top-2 right-2 bg-background/80 rounded-full p-1 hover:bg-background"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-36 border-2 border-dashed border-muted-foreground/30 rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/50 hover:text-primary transition-colors"
          >
            <Upload className="h-6 w-6" />
            <span className="text-sm">Click to upload photo</span>
            <span className="text-xs">JPEG, PNG, WebP — max 10MB</span>
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={handlePhotoChange}
        />
      </div>

      {/* Nickname */}
      <div className="space-y-1">
        <Label>Nickname <span className="text-muted-foreground text-xs">(optional)</span></Label>
        <Input {...register('nickname')} placeholder='e.g. "The Beast", "Silver Arrow"' />
      </div>

      {/* Brand & Model */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Brand *</Label>
          <Input {...register('brand')} placeholder="Trek, Giant, Merida..." />
          {errors.brand && <p className="text-xs text-destructive">{errors.brand.message}</p>}
        </div>
        <div className="space-y-1">
          <Label>Model</Label>
          <Input {...register('model')} placeholder="Marlin 5, Reign 29..." />
        </div>
      </div>

      {/* Year, Wheel Size, Frame Size */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-1">
          <Label>Year</Label>
          <Input
            {...register('year')}
            type="number"
            placeholder={String(new Date().getFullYear())}
            min={1980}
            max={new Date().getFullYear() + 1}
          />
          {errors.year && <p className="text-xs text-destructive">{errors.year.message}</p>}
        </div>
        <div className="space-y-1">
          <Label>Wheel Size</Label>
          <select
            {...register('wheel_size')}
            className="flex h-9 w-full rounded-md border border-input bg-background text-foreground  px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="" className="bg-background text-foreground">Select...</option>
            {WHEEL_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div className="space-y-1">
          <Label>Frame Size</Label>
          <select
            {...register('frame_size')}
            className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
          >
            <option value="" className="bg-background text-foreground">Select...</option>
            {FRAME_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1">
        <Label>Notes <span className="text-muted-foreground text-xs">(optional)</span></Label>
        <Textarea
          {...register('notes')}
          placeholder="Serial number, unique markings, mods, accessories — useful if reported missing."
          rows={3}
          className="resize-none"
        />
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
        {isPending ? 'Saving...' : submitLabel}
      </Button>
    </form>
  )
}