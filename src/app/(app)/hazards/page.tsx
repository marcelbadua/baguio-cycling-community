// ============================================================
// src/app/(app)/hazards/page.tsx
// ============================================================
'use client'

import { useState } from 'react'
import { useAuth } from '@/features/auth/hooks'
import { useAllHazards, useCreateHazardReport, useUploadHazardPhoto } from '@/features/hazards/hooks'
import { HazardCard } from '@/features/hazards/components/hazard-card'
import { HazardForm, type HazardFormData } from '@/features/hazards/components/hazard-form'
import { HAZARD_TYPE_CONFIG } from '@/features/hazards/constants'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Sheet, SheetContent, SheetHeader,
  SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { useToast } from '@/components/ui/use-toast'
import { Plus, AlertTriangle } from 'lucide-react'
import type { HazardStatus, HazardType } from '@/types/models'

type Filter = 'active' | 'fixed' | 'all'

export default function HazardsPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const [filter, setFilter]         = useState<Filter>('active')
  const [typeFilter, setTypeFilter] = useState<HazardType | 'all'>('all')
  const [reportOpen, setReportOpen] = useState(false)

  const { data: hazards, isLoading } = useAllHazards(
    filter === 'all' ? undefined : (filter as HazardStatus)
  )
  const createReport  = useCreateHazardReport()
  const uploadPhoto   = useUploadHazardPhoto()

  const filtered = typeFilter === 'all'
    ? (hazards ?? [])
    : (hazards ?? []).filter(h => h.hazard_type === typeFilter)

  const handleSubmit = async (data: HazardFormData, photoFile?: File) => {
    if (!user) return

    let photo_url: string | undefined
    if (photoFile) {
      const res = await uploadPhoto.mutateAsync({ userId: user.id, file: photoFile })
      if (res.error) {
        toast({ title: 'Photo upload failed', description: res.error, variant: 'destructive' })
        return
      }
      photo_url = res.url
    }

    const result = await createReport.mutateAsync({
  reporter_id: user.id,
  hazard_type: data.hazard_type,
  barangay: data.barangay,
  landmark: data.landmark || undefined,
  description: data.description,

  latitude: data.latitude,
  longitude: data.longitude,

  photo_url,
})

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }

    toast({ title: '⚠️ Hazard reported!', description: 'Thank you for keeping the community safe.' })
    setReportOpen(false)
  }

  const isPending = createReport.isPending || uploadPhoto.isPending

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            Road Hazards
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Report and track road hazards to keep Baguio cyclists safe.
          </p>
        </div>
        <Button onClick={() => setReportOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Report Hazard
        </Button>
      </div>

      {/* Status tabs */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Tabs value={filter} onValueChange={v => setFilter(v as Filter)} className="flex-1">
          <TabsList className="w-full sm:w-auto">
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="fixed">Fixed</TabsTrigger>
            <TabsTrigger value="all">All</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Hazard type filter */}
        <select
          value={typeFilter}
          onChange={e => setTypeFilter(e.target.value as HazardType | 'all')}
          className="h-9 rounded-md border border-input bg-background text-foreground px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
        >
          <option value="all" className="bg-background text-foreground">All Types</option>
          {(Object.entries(HAZARD_TYPE_CONFIG) as [HazardType, any][]).map(([t, cfg]) => (
            <option key={t} value={t}>{cfg.emoji} {cfg.label}</option>
          ))}
        </select>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 rounded-xl" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => <HazardCard key={r.id} report={r} />)}
        </div>
      ) : (
        <EmptyState filter={filter} typeFilter={typeFilter} onReport={() => setReportOpen(true)} />
      )}

      {/* Report Sheet */}
      <Sheet open={reportOpen} onOpenChange={setReportOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Report a Road Hazard</SheetTitle>
            <SheetDescription>
              Help keep fellow cyclists safe by reporting hazards in Baguio City.
            </SheetDescription>
          </SheetHeader>
          <HazardForm onSubmit={handleSubmit} isPending={isPending} />
        </SheetContent>
      </Sheet>
    </div>
  )
}

function EmptyState({
  filter, typeFilter, onReport,
}: { filter: Filter; typeFilter: string; onReport: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <p className="text-5xl">
        {filter === 'fixed' ? '✅' : typeFilter !== 'all'
          ? HAZARD_TYPE_CONFIG[typeFilter as HazardType]?.emoji ?? '⚠️'
          : '🛣️'}
      </p>
      <div>
        <h3 className="font-semibold text-lg">
          {filter === 'fixed' ? 'No fixed hazards yet'
            : filter === 'active' ? 'No active hazards reported'
            : 'No reports found'}
        </h3>
        <p className="text-muted-foreground text-sm max-w-xs mt-1">
          {filter === 'active'
            ? 'Great news — no active hazards! If you spot one, report it to keep the community safe.'
            : 'Try changing the filters above.'}
        </p>
      </div>
      {filter !== 'fixed' && (
        <Button onClick={onReport} className="gap-1.5">
          <Plus className="h-4 w-4" /> Report a Hazard
        </Button>
      )}
    </div>
  )
}
