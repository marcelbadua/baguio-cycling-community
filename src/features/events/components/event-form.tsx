// ============================================================
// src/features/events/components/event-form.tsx
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
import { Checkbox } from '@/components/ui/checkbox'
import { Upload, X, Loader2 } from 'lucide-react'
import type { Event, EventDifficulty, EventPace } from '@/types/database'

const PACE_OPTIONS: { value: EventPace; label: string }[] = [
  { value: 'casual',   label: 'Casual — easy going, no drop' },
  { value: 'moderate', label: 'Moderate — steady pace'        },
  { value: 'fast',     label: 'Fast — push the pace'          },
  { value: 'race',     label: 'Race — competitive'            },
]

const DIFFICULTY_OPTIONS: { value: EventDifficulty; label: string }[] = [
  { value: 'easy',     label: 'Easy'     },
  { value: 'moderate', label: 'Moderate' },
  { value: 'hard',     label: 'Hard'     },
  { value: 'expert',   label: 'Expert'   },
]

const eventSchema = z.object({
  title:              z.string().min(1, 'Title is required'),
  description:        z.string().optional(),
  event_date:         z.string().min(1, 'Date is required'),
  event_time:         z.string().optional(),
  meeting_point:      z.string().optional(),
  distance_km:        z.coerce.number().positive().optional().or(z.literal('')),
  elevation_m:        z.coerce.number().positive().optional().or(z.literal('')),
  pace:               z.enum(['casual','moderate','fast','race']).optional(),
  difficulty:         z.enum(['easy','moderate','hard','expert']).optional(),
  max_participants:   z.coerce.number().int().positive().optional().or(z.literal('')),
  requires_approval:  z.boolean().default(false),
})

export type EventFormData = z.infer<typeof eventSchema>

interface Props {
  defaultValues?: Partial<Event>
  onSubmit: (data: EventFormData, coverFile?: File) => Promise<void>
  isPending?: boolean
  submitLabel?: string
}

export function EventForm({ defaultValues, onSubmit, isPending, submitLabel = 'Create Event' }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(defaultValues?.cover_url ?? null)

  const { register, handleSubmit, formState: { errors }, reset, watch, setValue } = useForm<EventFormData>({
    resolver: zodResolver(eventSchema) as any,
    defaultValues: {
      title:             defaultValues?.title ?? '',
      description:       defaultValues?.description ?? '',
      event_date:        defaultValues?.event_date ?? '',
      event_time:        defaultValues?.event_time ?? '',
      meeting_point:     defaultValues?.meeting_point ?? '',
      distance_km:       defaultValues?.distance_km ?? '',
      elevation_m:       defaultValues?.elevation_m ?? '',
      pace:              defaultValues?.pace ?? undefined,
      difficulty:        defaultValues?.difficulty ?? undefined,
      max_participants:  defaultValues?.max_participants ?? '',
      requires_approval: defaultValues?.requires_approval ?? false,
    },
  })

  useEffect(() => { if (defaultValues) reset(defaultValues as any) }, [defaultValues, reset])

  const requiresApproval = watch('requires_approval')

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setCoverFile(file)
    setCoverPreview(URL.createObjectURL(file))
  }

  return (
    <form onSubmit={handleSubmit(d => onSubmit(d, coverFile ?? undefined))} className="space-y-5 px-4 mb-6">

      {/* Cover Image */}
      <div className="space-y-2">
        <Label>Cover Image</Label>
        {coverPreview ? (
          <div className="relative w-full h-40 rounded-lg overflow-hidden bg-muted">
            <img src={coverPreview} className="w-full h-full object-cover" alt="Cover" />
            <button
              type="button"
              onClick={() => { setCoverFile(null); setCoverPreview(null) }}
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
            <span className="text-sm">Upload cover image</span>
          </button>
        )}
        <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleCoverChange} />
      </div>

      {/* Title */}
      <div className="space-y-1">
        <Label>Event Title *</Label>
        <Input {...register('title')} placeholder="e.g. Saturday Morning Ride to Tam-awan" />
        {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
      </div>

      {/* Description */}
      <div className="space-y-1">
        <Label>Description</Label>
        <Textarea
          {...register('description')}
          placeholder="Tell riders what to expect — route highlights, things to bring, difficulty notes..."
          rows={4}
          className="resize-none"
        />
      </div>

      {/* Date & Time */}
      
        <div className="space-y-1">
          <Label>Date *</Label>
          <Input {...register('event_date')} type="date" />
          {errors.event_date && <p className="text-xs text-destructive">{errors.event_date.message}</p>}
        </div>
        <div className="space-y-1">
          <Label>Time</Label>
          <Input {...register('event_time')} type="time" />
        </div>
      

      {/* Meeting Point */}
      <div className="space-y-1">
        <Label>Meeting Point</Label>
        <Input
          {...register('meeting_point')}
          placeholder="e.g. Burnham Park Main Entrance, beside the boats"
        />
      </div>

      {/* Distance & Elevation */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <Label>Distance (km)</Label>
          <Input {...register('distance_km')} type="number" step="0.1" min="0" placeholder="e.g. 35" />
        </div>
        <div className="space-y-1">
          <Label>Elevation (m)</Label>
          <Input {...register('elevation_m')} type="number" step="1" min="0" placeholder="e.g. 850" />
        </div>
      </div>

      {/* Pace */}
      <div className="space-y-1">
        <Label>Ride Pace</Label>
        <select
          {...register('pace')}
className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="" className="bg-background text-foreground">Select pace...</option>
          {PACE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </div>

      {/* Difficulty */}
      <div className="space-y-1">
        <Label>Difficulty</Label>
        <div className="grid grid-cols-4 gap-2">
          {DIFFICULTY_OPTIONS.map(o => {
            const current = watch('difficulty')
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => setValue('difficulty', o.value)}
                className={`py-1.5 px-2 rounded-md border text-xs font-medium transition-colors ${
                  current === o.value
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-input hover:bg-muted'
                }`}
              >
                {o.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Max Participants */}
      <div className="space-y-1">
        <Label>
          Max Participants{' '}
          <span className="text-muted-foreground text-xs">(leave blank for unlimited)</span>
        </Label>
        <Input {...register('max_participants')} type="number" min="1" placeholder="e.g. 30" />
      </div>

      {/* Requires Approval */}
      <div className="flex items-start gap-3 p-3 border rounded-lg">
        <Checkbox
          id="requires_approval"
          checked={requiresApproval}
          onCheckedChange={v => setValue('requires_approval', !!v)}
        />
        <div>
          <Label htmlFor="requires_approval" className="cursor-pointer font-medium">
            Require organizer approval
          </Label>
          <p className="text-xs text-muted-foreground mt-0.5">
            Participants must be approved before they are confirmed for this event.
          </p>
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={isPending}>
        {isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : submitLabel}
      </Button>
    </form>
  )
}