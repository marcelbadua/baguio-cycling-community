'use client'

import { use, useState } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import { HazardForm, type HazardFormData } from '@/features/hazards/components/hazard-form'
import {
  useHazardById, useConfirmHazard,
  useUpdateHazardStatus, useDeleteHazardReport, useUpdateHazardReport,
} from '@/features/hazards/hooks'
import { HAZARD_TYPE_CONFIG } from '@/features/hazards/constants'
import { useAuth } from '@/features/auth/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { useToast } from '@/components/ui/use-toast'
import {
  ArrowLeft, MapPin, Calendar, ThumbsUp,
  CheckCircle2, Trash2, Loader2, AlertTriangle, ShieldCheck, Pencil,
} from 'lucide-react'
import { formatDate, formatRelative, getInitials, getDisplayName } from '@/lib/utils'

import dynamic from 'next/dynamic'

const Map = dynamic(
  () => import('@/components/maps/Map').then(mod => mod.Map),
  {
    ssr: false,
  }
)

export default function HazardDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const { data: report, isLoading } = useHazardById(id)
  const { confirm, remove } = useConfirmHazard(id)
  const updateStatus = useUpdateHazardStatus()
  const deleteReport = useDeleteHazardReport()
  const updateReport = useUpdateHazardReport()

  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [lightbox, setLightbox] = useState(false)
  const [editing, setEditing] = useState(false)

  const handleEditOpen = () => {
    setEditing(true)
  }

  if (isLoading) return <HazardDetailSkeleton />
  if (!report) return notFound()

  const reporter = report.reporter
  const cfg = HAZARD_TYPE_CONFIG[report.hazard_type]
  const isFixed = report.status === 'fixed'
  const isReporter = user?.id === report.reporter_id
  const canManage = isReporter || isAdmin

  const handleConfirm = async (fixed: boolean) => {
    if (!user) return
    if (report.confirmed_by_me) {
      await remove.mutateAsync(user.id)
      toast({ title: 'Confirmation removed.' })
    } else {
      await confirm.mutateAsync({ userId: user.id, fixed })
      toast({
        title: fixed ? '✅ Marked as fixed — thanks!' : '👍 Confirmed as still active.',
        description: fixed && ((report.confirm_count ?? 0) + 1) >= 3
          ? 'Hazard has been auto-resolved after 3 fixed confirmations.'
          : undefined,
      })
    }
  }

  const handleStatusToggle = async () => {
    const newStatus = isFixed ? 'active' : 'fixed'
    await updateStatus.mutateAsync({ id, status: newStatus })
    toast({ title: newStatus === 'fixed' ? '✅ Hazard marked as fixed.' : '⚠️ Hazard re-opened.' })
  }

  const handleDelete = async () => {
    await deleteReport.mutateAsync(id)
    toast({ title: 'Hazard report deleted.' })
    router.push('/hazards')
  }

  const confirmPending = confirm.isPending || remove.isPending

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Road Hazards
      </Button>

      {/* Status banner */}
      {isFixed ? (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">This hazard has been marked as fixed.</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-amber-500/10 text-amber-700 dark:text-amber-400 rounded-lg">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="text-sm font-medium">Active hazard — exercise caution in this area.</p>
        </div>
      )}

      {/* Photo */}
      {report.photo_url && (
        <div
          className="w-full h-56 md:h-72 rounded-xl overflow-hidden bg-muted cursor-zoom-in"
          onClick={() => setLightbox(true)}
        >
          <img
            src={report.photo_url}
            className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            alt="Hazard photo"
          />
        </div>
      )}

      {!report.photo_url && (
        <div className="w-full h-32 rounded-xl bg-muted flex items-center justify-center gap-3">
          <span className="text-5xl">{cfg.emoji}</span>
          <span className="text-xl font-semibold text-muted-foreground">{cfg.label}</span>
        </div>
      )}

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <span className={`inline-flex text-xs font-medium px-2.5 py-1 rounded-full ${cfg.color}`}>
              {cfg.emoji} {cfg.label}
            </span>
            <h1 className="text-xl font-bold">{report.barangay}</h1>
            {report.landmark && (
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" /> {report.landmark}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Badge variant={isFixed ? 'secondary' : 'destructive'} className="gap-1">
              {isFixed
                ? <><CheckCircle2 className="h-3 w-3" /> Fixed</>
                : <><AlertTriangle className="h-3 w-3" /> Active</>}
            </Badge>
            {canManage && (
              <button
                onClick={handleEditOpen}
                className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent transition-colors outline-none"
              >
                <Pencil className="h-4 w-4 text-muted-foreground" />
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            Reported {formatDate(report.created_at)}
          </span>
          <span className="flex items-center gap-1">
            <ThumbsUp className="h-3.5 w-3.5" />
            {report.confirm_count} confirmation{report.confirm_count !== 1 ? 's' : ''}
          </span>
        </div>
      </div>



      {report.latitude != null && report.longitude != null && (
        <>
          <Separator />

          <div className="space-y-3">
            <h2 className="font-semibold">
              Location
            </h2>

            <Map
              latitude={report.latitude}
              longitude={report.longitude}
              title={report.landmark || report.barangay}
            />

            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                asChild
              >
                <a
                  href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Open in Google Maps
                </a>
              </Button>
            </div>
          </div>
        </>
      )}

      {/* Description */}
      {report.description && (
        <>
          <Separator />
          <div>
            <h2 className="font-semibold mb-1.5">Details</h2>
            <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
              {report.description}
            </p>
          </div>
        </>
      )}

      <Separator />

      {/* Reporter */}
      <Card>
        <CardContent className="pt-4">
          <p className="text-xs text-muted-foreground mb-2">Reported by</p>
          <Link href={`/profile/${reporter?.username}`} className="flex items-center gap-2.5 group">
            <Avatar className="h-9 w-9">
              <AvatarImage src={reporter?.avatar_url ?? ''} />
              <AvatarFallback className="text-xs">
                {getInitials(reporter?.first_name, reporter?.last_name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm font-medium group-hover:underline">
                {getDisplayName(reporter ?? { username: 'Unknown' })}
              </p>
              <p className="text-xs text-muted-foreground">{formatRelative(report.created_at)}</p>
            </div>
          </Link>
        </CardContent>
      </Card>

      {/* Community Actions */}
      {!isFixed && (
        <div className="space-y-3">
          <h2 className="font-semibold">Community Confirmation</h2>
          <p className="text-sm text-muted-foreground">
            Seen this hazard? Help the community by confirming it's still there — or mark it as fixed
            if it's been repaired. After 3 "fixed" confirmations, it auto-resolves.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant={report.confirmed_by_me ? 'secondary' : 'outline'}
              className="flex-1 gap-2"
              onClick={() => handleConfirm(false)}
              disabled={confirmPending}
            >
              {confirmPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ThumbsUp className="h-4 w-4" />}
              {report.confirmed_by_me ? 'Confirmed ✓' : 'Still There'}
            </Button>
            <Button
              variant="outline"
              className="flex-1 gap-2 border-green-500 text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
              onClick={() => handleConfirm(true)}
              disabled={confirmPending || !!report.confirmed_by_me}
            >
              {confirmPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              It's Been Fixed
            </Button>
          </div>
        </div>
      )}

      {/* Manager Actions */}
      {canManage && (
        <>
          <Separator />
          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              variant="outline"
              className="flex-1 gap-2"
              onClick={handleStatusToggle}
              disabled={updateStatus.isPending}
            >
              {updateStatus.isPending
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : isFixed
                  ? <AlertTriangle className="h-4 w-4" />
                  : <CheckCircle2 className="h-4 w-4" />}
              {isFixed ? 'Re-open Hazard' : 'Mark as Fixed'}
            </Button>
            <Button
              variant="destructive"
              className="flex-1 gap-2"
              onClick={() => setDeleteConfirm(true)}
            >
              <Trash2 className="h-4 w-4" /> Delete Report
            </Button>
          </div>
        </>
      )}

      {/* Edit Dialog */}

      <Sheet
        open={editing}
        onOpenChange={setEditing}
      >
        <SheetContent
          side="right"
          className="w-full sm:max-w-lg overflow-y-auto"
        >
          <SheetHeader className="mb-6">
            <SheetTitle>Edit Hazard</SheetTitle>

            <SheetDescription>
              Update this hazard report.
            </SheetDescription>
          </SheetHeader>

          <HazardForm
            initialValues={{
              hazard_type: report.hazard_type,
              barangay: report.barangay,
              landmark: report.landmark ?? '',
              description: report.description ?? '',
              latitude: report.latitude ?? undefined,
              longitude: report.longitude ?? undefined,
            }}
            initialPhoto={report.photo_url ?? undefined}
            submitLabel="Save Changes"
            isPending={updateReport.isPending}
            onSubmit={async (data, photoFile) => {
              const result = await updateReport.mutateAsync({
                id,
                updates: {
                  hazard_type: data.hazard_type,
                  barangay: data.barangay,
                  landmark: data.landmark || undefined,
                  description: data.description,

                  latitude: data.latitude,
                  longitude: data.longitude,

                  // later
                  // photo_url
                },
              })

              if (result?.error) {
                toast({
                  title: 'Error',
                  description: result.error,
                  variant: 'destructive',
                })
                return
              }

              toast({
                title: 'Hazard updated.',
              })

              setEditing(false)
            }}
          />
        </SheetContent>
      </Sheet>

      {/* Lightbox */}
      {lightbox && report.photo_url && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightbox(false)}
        >
          <img
            src={report.photo_url}
            className="max-w-full max-h-full object-contain rounded-lg"
            alt="Hazard"
          />
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white text-xl"
            onClick={() => setLightbox(false)}
          >✕</button>
        </div>
      )}
    </div>
  )
}

function HazardDetailSkeleton() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="w-full h-56 rounded-xl" />
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-64" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="flex gap-3">
        <Skeleton className="h-10 flex-1 rounded-lg" />
        <Skeleton className="h-10 flex-1 rounded-lg" />
      </div>
    </div>
  )
}