// ============================================================
// src/app/(app)/bikes/[id]/page.tsx
// ============================================================
'use client'

import { use } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { useBikeById } from '@/features/bikes/hooks'
import { useAuth } from '@/features/auth/hooks'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent } from '@/components/ui/card'
import {
  AlertTriangle, ArrowLeft, Bike,
  Calendar, Ruler, Circle,
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

export default function BikeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user } = useAuth()
  const router = useRouter()
  const { data: bike, isLoading } = useBikeById(id)

  if (isLoading) return <BikeSkeleton />
  if (!bike) return notFound()

  // Only owner can view (RLS handles data, this handles UI redirect)
  if (bike.owner_id !== user?.id) return notFound()

  const label = bike.nickname
    ? `${bike.nickname}`
    : `${bike.brand}${bike.model ? ` ${bike.model}` : ''}`

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" /> My Bikes
      </Button>

      {/* Photo */}
      <div className="w-full h-64 md:h-80 rounded-xl overflow-hidden bg-muted">
        {bike.photo_url ? (
          <img src={bike.photo_url} alt={label} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Bike className="h-20 w-20 text-muted-foreground opacity-30" />
          </div>
        )}
      </div>

      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p className="text-xs font-mono text-muted-foreground">{bike.bike_id}</p>
            <h1 className="text-2xl font-bold">{label}</h1>
            {bike.nickname && (
              <p className="text-muted-foreground">{bike.brand}{bike.model ? ` ${bike.model}` : ''}</p>
            )}
          </div>
          {bike.is_missing && (
            <Badge variant="destructive" className="gap-1 shrink-0">
              <AlertTriangle className="h-3 w-3" /> MISSING
            </Badge>
          )}
        </div>
      </div>

      {/* Specs */}
      <Card>
        <CardContent className="pt-4 grid grid-cols-2 gap-4">
          {bike.year && (
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Year</p>
                <p className="text-sm font-medium">{bike.year}</p>
              </div>
            </div>
          )}
          {bike.wheel_size && (
            <div className="flex items-center gap-2">
              <Circle className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Wheel Size</p>
                <p className="text-sm font-medium">{bike.wheel_size}</p>
              </div>
            </div>
          )}
          {bike.frame_size && (
            <div className="flex items-center gap-2">
              <Ruler className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Frame Size</p>
                <p className="text-sm font-medium">{bike.frame_size}</p>
              </div>
            </div>
          )}
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs text-muted-foreground">Registered</p>
              <p className="text-sm font-medium">{formatDate(bike.created_at)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {bike.notes && (
        <div>
          <h2 className="font-semibold mb-2">Notes</h2>
          <p className="text-sm text-muted-foreground leading-relaxed">{bike.notes}</p>
        </div>
      )}

      <Separator />

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="outline" asChild className="flex-1">
          <Link href={`/bikes`}>Back to Registry</Link>
        </Button>
        {!bike.is_missing ? (
          <Button
            variant="destructive"
            className="flex-1 gap-1.5"
            asChild
          >
            <Link href={`/missing-bikes/report?bikeId=${bike.id}`}>
              <AlertTriangle className="h-4 w-4" /> Report as Missing
            </Link>
          </Button>
        ) : (
          <Button variant="secondary" className="flex-1" asChild>
            <Link href={`/missing-bikes?bikeId=${bike.id}`}>
              View Missing Report
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

function BikeSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="w-full h-64 rounded-xl" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-32" />
      <Skeleton className="h-28 w-full rounded-xl" />
    </div>
  )
}