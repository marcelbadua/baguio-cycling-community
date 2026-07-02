// ============================================================
// src/app/(app)/missing-bikes/report/page.tsx
// ============================================================
'use client'

import { use, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks'
import { useBikeById } from '@/features/bikes/hooks'
import { useCreateMissingReport, useUploadMissingPhotos } from '@/features/missing-bikes/hooks'
import { ReportMissingForm, type ReportFormData } from '@/features/missing-bikes/components/report-form'
import { createMissingBikePost } from '@/features/feed/auto-post'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import { ArrowLeft, AlertTriangle } from 'lucide-react'

function ReportPageContent() {
  const searchParams = useSearchParams()
  const bikeId = searchParams.get('bikeId') ?? ''
  const router = useRouter()
  const { user } = useAuth()
  const { toast } = useToast()

  const { data: bike, isLoading } = useBikeById(bikeId)
  const createReport = useCreateMissingReport()
  const uploadPhotos = useUploadMissingPhotos()

  const handleSubmit = async (data: ReportFormData, photoFiles: File[]) => {
    if (!user || !bike) return

    // 1. Create the report
    const result = await createReport.mutateAsync({
      bike_id:            bike.id,
      owner_id:           user.id,
      last_seen_location: data.last_seen_location,
      date_missing:       data.date_missing,
      description:        data.description,
      contact_info:       data.contact_info,
      photos:             [],
    })

    if (result.error || !result.data) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }

    // 2. Upload photos and attach to report
    let allPhotos: string[] = bike.photo_url ? [bike.photo_url] : []
    if (photoFiles.length > 0) {
      const { urls } = await uploadPhotos.mutateAsync({
        ownerId:  user.id,
        reportId: result.data.id,
        files:    photoFiles,
      })
      if (urls.length > 0) {
        // Attach photo URLs to the report
        allPhotos = [...allPhotos, ...urls]
        await fetch('/api/missing-bikes/update-photos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reportId: result.data.id, photos: allPhotos }),
        })
      }
    }

    // 3. Auto-post to community feed (carries the report's photos along, if any)
    // 3. Auto-post to community feed (carries the report's photos along, if any)
    const bikeName = bike.nickname
      ? `${bike.nickname} (${bike.brand}${bike.model ? ` ${bike.model}` : ''})`
      : `${bike.brand}${bike.model ? ` ${bike.model}` : ''}`

    const postResult = await createMissingBikePost({
      authorId:      user.id,
      missingBikeId: result.data.id,
      bikeName,
      lastSeen:      data.last_seen_location,
      photos:        allPhotos,
    })

    if (postResult.error) {
      toast({
        title: 'Report saved, but feed post failed',
        description: postResult.error,
        variant: 'destructive',
      })
    }
    toast({
      title: '🚨 Missing bike report submitted!',
      description: 'The community has been alerted. We hope your bike is found soon.',
    })

    router.push(`/missing-bikes/${result.data.id}`)
  }

  if (isLoading) return (
    <div className="max-w-xl mx-auto space-y-4">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-16 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  )

  if (!bike || bike.owner_id !== user?.id) {
    return (
      <div className="max-w-xl mx-auto text-center py-24 space-y-4">
        <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground" />
        <h2 className="font-semibold text-lg">Bike not found</h2>
        <p className="text-muted-foreground text-sm">This bike doesn't exist or doesn't belong to you.</p>
        <Button onClick={() => router.push('/bikes')}>Go to My Bikes</Button>
      </div>
    )
  }

  if (bike.is_missing) {
    return (
      <div className="max-w-xl mx-auto text-center py-24 space-y-4">
        <AlertTriangle className="h-12 w-12 mx-auto text-destructive" />
        <h2 className="font-semibold text-lg">Already reported missing</h2>
        <p className="text-muted-foreground text-sm">
          This bike has already been reported as missing.
        </p>
        <Button onClick={() => router.push('/missing-bikes')}>View Missing Reports</Button>
      </div>
    )
  }

  const isPending = createReport.isPending || uploadPhotos.isPending

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>
      <div>
        <h1 className="text-2xl font-bold text-destructive">Report Missing Bike</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Fill in the details to alert the Baguio Cycling Community.
        </p>
      </div>
      <ReportMissingForm bike={bike} onSubmit={handleSubmit} isPending={isPending} />
    </div>
  )
}

export default function ReportPage() {
  return (
    <Suspense fallback={<div className="max-w-xl mx-auto"><Skeleton className="h-96 w-full" /></div>}>
      <ReportPageContent />
    </Suspense>
  )
}