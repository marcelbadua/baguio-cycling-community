// ============================================================
// src/features/missing-bikes/components/report-form.tsx
// ============================================================
'use client'

import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { ImagePlus, X, Loader2, AlertTriangle } from 'lucide-react'
import type { Bike } from '@/types/database'

const reportSchema = z.object({
  last_seen_location: z.string().min(1, 'Last seen location is required'),
  date_missing:       z.string().min(1, 'Date is required'),
  description:        z.string().min(10, 'Please provide more detail (min 10 characters)'),
  contact_info:       z.string().min(1, 'Contact information is required'),
})

export type ReportFormData = z.infer<typeof reportSchema>

interface Props {
  bike: Bike
  onSubmit: (data: ReportFormData, photos: File[]) => Promise<void>
  isPending?: boolean
}

export function ReportMissingForm({ bike, onSubmit, isPending }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])

  const { register, handleSubmit, formState: { errors } } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: { date_missing: new Date().toISOString().split('T')[0] },
  })

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, 6 - photoFiles.length)
    setPhotoFiles(p => [...p, ...files])
    setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))])
    if (fileRef.current) fileRef.current.value = ''
  }

  const removePhoto = (i: number) => {
    setPhotoFiles(p => p.filter((_, idx) => idx !== i))
    setPreviews(p => p.filter((_, idx) => idx !== i))
  }

  const bikeName = bike.nickname
    ? `${bike.nickname} (${bike.brand}${bike.model ? ` ${bike.model}` : ''})`
    : `${bike.brand}${bike.model ? ` ${bike.model}` : ''}`

  return (
    <form onSubmit={handleSubmit(d => onSubmit(d, photoFiles))} className="space-y-5">

      {/* Bike preview */}
      <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
        {bike.photo_url
          ? <img src={bike.photo_url} className="h-14 w-14 rounded-md object-cover shrink-0" alt="" />
          : <div className="h-14 w-14 rounded-md bg-muted-foreground/10 shrink-0" />
        }
        <div>
          <p className="font-medium text-sm">{bikeName}</p>
          <p className="text-xs text-muted-foreground font-mono">{bike.bike_id}</p>
          {bike.year && <Badge variant="outline" className="text-xs mt-1">{bike.year}</Badge>}
        </div>
      </div>

      {/* Alert */}
      <div className="flex items-start gap-2 p-3 bg-destructive/10 text-destructive rounded-lg text-sm">
        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
        <p>
          Submitting this report will mark your bike as missing and post a community alert
          to the feed. Other members will be able to help with sightings.
        </p>
      </div>

      {/* Last seen location */}
      <div className="space-y-1">
        <Label>Last Seen Location *</Label>
        <Input
          {...register('last_seen_location')}
          placeholder="e.g. Near Burnham Park, Session Road area"
        />
        {errors.last_seen_location && (
          <p className="text-xs text-destructive">{errors.last_seen_location.message}</p>
        )}
      </div>

      {/* Date missing */}
      <div className="space-y-1">
        <Label>Date Missing *</Label>
        <Input {...register('date_missing')} type="date" max={new Date().toISOString().split('T')[0]} />
        {errors.date_missing && (
          <p className="text-xs text-destructive">{errors.date_missing.message}</p>
        )}
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Label>Description *</Label>
        <Textarea
          {...register('description')}
          placeholder="Describe the circumstances — where it was last seen, any identifying marks, what was happening at the time..."
          rows={4}
          className="resize-none"
        />
        {errors.description && (
          <p className="text-xs text-destructive">{errors.description.message}</p>
        )}
      </div>

      {/* Contact info */}
      <div className="space-y-1">
        <Label>Contact Information *</Label>
        <Input
          {...register('contact_info')}
          placeholder="Phone number, Facebook, or other way to reach you"
        />
        {errors.contact_info && (
          <p className="text-xs text-destructive">{errors.contact_info.message}</p>
        )}
      </div>

      {/* Additional photos */}
      <div className="space-y-2">
        <Label>
          Additional Photos{' '}
          <span className="text-muted-foreground text-xs">(up to 6 — different angles, serial number, etc.)</span>
        </Label>
        {previews.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {previews.map((src, i) => (
              <div key={i} className="relative aspect-square rounded-lg overflow-hidden bg-muted">
                <img src={src} className="w-full h-full object-cover" alt="" />
                <button
                  type="button"
                  onClick={() => removePhoto(i)}
                  className="absolute top-1 right-1 bg-black/60 rounded-full p-0.5"
                >
                  <X className="h-3 w-3 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}
        {photoFiles.length < 6 && (
          <button
            type="button"
            onClick={() => fileRef.current?.click()}
            className="w-full h-16 border-2 border-dashed border-muted-foreground/30 rounded-lg flex items-center justify-center gap-2 text-muted-foreground text-sm hover:border-primary/50 transition-colors"
          >
            <ImagePlus className="h-4 w-4" /> Add Photos ({photoFiles.length}/6)
          </button>
        )}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handlePhotoChange}
        />
      </div>

      <Button type="submit" variant="destructive" className="w-full gap-2" disabled={isPending}>
        {isPending
          ? <Loader2 className="h-4 w-4 animate-spin" />
          : <AlertTriangle className="h-4 w-4" />}
        {isPending ? 'Submitting Report...' : 'Submit Missing Bike Report'}
      </Button>
    </form>
  )
}
