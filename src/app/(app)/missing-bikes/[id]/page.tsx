'use client'

import { use, useState, useRef } from 'react'
import { notFound, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  useMissingBikeById, useMarkAsRecovered, useUpdateMissingReport,
  useUploadMissingPhotos, useMissingBikeComments, useAddMissingBikeComment,
} from '@/features/missing-bikes/hooks'
import { useAuth } from '@/features/auth/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertTriangle, CheckCircle2, ArrowLeft, MapPin,
  Calendar, Phone, ImagePlus, Send, Loader2,
} from 'lucide-react'
import { formatDate, formatRelative, getInitials, getDisplayName } from '@/lib/utils'

export default function MissingBikeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { user, isAdmin } = useAuth()
  const { toast } = useToast()
  const router = useRouter()

  const { data: report, isLoading } = useMissingBikeById(id)
  const { data: comments = [] } = useMissingBikeComments(id)
  const markRecovered = useMarkAsRecovered()
  const uploadPhotos  = useUploadMissingPhotos()
  const updateReport  = useUpdateMissingReport(id)
  const addComment    = useAddMissingBikeComment(id)

  const [recoverConfirm, setRecoverConfirm] = useState(false)
  const [commentText, setCommentText]       = useState('')
  const [lightbox, setLightbox]             = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  if (isLoading) return <DetailSkeleton />
  if (!report)   return notFound()

  const bike      = report.bike  as any
  const owner     = report.owner as any
  const isOwner   = user?.id === report.owner_id
  const canManage = isOwner || isAdmin
  const isActive  = report.status === 'missing'

  const bikeName = bike?.nickname
    ? `${bike.nickname} (${bike?.brand}${bike?.model ? ` ${bike.model}` : ''})`
    : `${bike?.brand ?? ''}${bike?.model ? ` ${bike.model}` : ''}`

  const allPhotos = [
    ...(bike?.photo_url ? [bike.photo_url] : []),
    ...(report.photos ?? []),
  ]

  const handleRecover = async () => {
    const result = await markRecovered.mutateAsync({ reportId: id, bikeId: report.bike_id })
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: '🎉 Bike marked as recovered!' })
      setRecoverConfirm(false)
    }
  }

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (!files.length || !user) return
    const { urls } = await uploadPhotos.mutateAsync({ ownerId: user.id, reportId: id, files })
    if (urls.length) {
      await updateReport.mutateAsync({ photos: [...(report.photos ?? []), ...urls] })
      toast({ title: `${urls.length} photo(s) added.` })
    }
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim() || !user) return
    const result = await addComment.mutateAsync({
      missing_bike_id: id,
      author_id: user.id,
      content: commentText.trim(),
    })
    if (!result.error) setCommentText('')
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Button variant="ghost" size="sm" onClick={() => router.back()} className="gap-1.5 -ml-2">
        <ArrowLeft className="h-4 w-4" /> Missing Bikes
      </Button>

      {isActive ? (
        <div className="flex items-center gap-2 p-3 bg-destructive/10 text-destructive rounded-lg">
          <AlertTriangle className="h-5 w-5 shrink-0" />
          <p className="font-medium text-sm">This bike is currently missing. Please help if you have any information.</p>
        </div>
      ) : (
        <div className="flex items-center gap-2 p-3 bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <p className="font-medium text-sm">
            This bike has been recovered.{' '}
            {report.recovered_at && <span className="font-normal">{formatDate(report.recovered_at)}</span>}
          </p>
        </div>
      )}

      {allPhotos.length > 0 && (
        <div className={`grid gap-2 rounded-xl overflow-hidden ${allPhotos.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {allPhotos.slice(0, 4).map((src, i) => (
            <div
              key={i}
              className={`relative overflow-hidden cursor-zoom-in bg-muted ${allPhotos.length === 1 ? 'aspect-video' : 'aspect-square'} ${allPhotos.length === 3 && i === 0 ? 'row-span-2' : ''}`}
              onClick={() => setLightbox(src)}
            >
              <img src={src} className="w-full h-full object-cover hover:scale-105 transition-transform duration-300" alt="" />
              {i === 3 && allPhotos.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <span className="text-white text-xl font-bold">+{allPhotos.length - 4}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <div className="space-y-2">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-mono text-muted-foreground">{bike?.bike_id}</p>
            <h1 className="text-2xl font-bold">{bikeName}</h1>
          </div>
          <Badge variant={isActive ? 'destructive' : 'secondary'} className="gap-1 shrink-0">
            {isActive
              ? <><AlertTriangle className="h-3 w-3" /> Missing</>
              : <><CheckCircle2 className="h-3 w-3" /> Recovered</>}
          </Badge>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {bike?.year       && <Badge variant="outline">{bike.year}</Badge>}
          {bike?.wheel_size && <Badge variant="outline">{bike.wheel_size}</Badge>}
          {bike?.frame_size && <Badge variant="outline">Frame {bike.frame_size}</Badge>}
        </div>
      </div>

      <Separator />

      <div className="grid sm:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4 space-y-3">
            {report.last_seen_location && (
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Last Seen Location</p>
                  <p className="text-sm font-medium">{report.last_seen_location}</p>
                </div>
              </div>
            )}
            {report.date_missing && (
              <div className="flex items-start gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Date Missing</p>
                  <p className="text-sm font-medium">{formatDate(report.date_missing)}</p>
                </div>
              </div>
            )}
            {report.contact_info && (
              <div className="flex items-start gap-2">
                <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-muted-foreground">Contact</p>
                  <p className="text-sm font-medium">{report.contact_info}</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2 pt-4">
            <CardTitle className="text-sm text-muted-foreground font-normal">Reported by</CardTitle>
          </CardHeader>
          <CardContent>
            <Link href={`/profile/${owner?.username}`} className="flex items-center gap-2.5 group">
              <Avatar className="h-10 w-10">
                <AvatarImage src={owner?.avatar_url ?? ''} />
                <AvatarFallback>{getInitials(owner?.first_name, owner?.last_name)}</AvatarFallback>
              </Avatar>
              <div>
                <p className="text-sm font-medium group-hover:underline">{getDisplayName(owner ?? { username: 'Unknown' })}</p>
                <p className="text-xs text-muted-foreground">@{owner?.username}</p>
              </div>
            </Link>
            <p className="text-xs text-muted-foreground mt-2">Reported {formatRelative(report.created_at)}</p>
          </CardContent>
        </Card>
      </div>

      {report.description && (
        <div>
          <h2 className="font-semibold mb-2">Description</h2>
          <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{report.description}</p>
        </div>
      )}

      {canManage && isActive && (
        <div className="flex flex-col sm:flex-row gap-3">
          {isOwner && (
            <>
              <Button variant="outline" className="flex-1 gap-1.5" onClick={() => fileRef.current?.click()} disabled={uploadPhotos.isPending}>
                {uploadPhotos.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <ImagePlus className="h-4 w-4" />}
                Add Photos
              </Button>
              <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
            </>
          )}
          <Button className="flex-1 gap-1.5 bg-green-600 hover:bg-green-700 text-white" onClick={() => setRecoverConfirm(true)}>
            <CheckCircle2 className="h-4 w-4" /> Mark as Recovered
          </Button>
        </div>
      )}

      <Separator />

      <div className="space-y-4">
        <h2 className="font-semibold">
          Sightings & Comments{' '}
          <span className="text-muted-foreground font-normal text-sm">({comments.length})</span>
        </h2>

        {comments.length > 0 ? (
          <div className="space-y-3">
            {(comments as any[]).map((comment: any) => {
              const a = comment.author
              return (
                <div key={comment.id} className="flex gap-2.5">
                  <Link href={`/profile/${a?.username}`} className="shrink-0">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={a?.avatar_url ?? ''} />
                      <AvatarFallback className="text-xs">{getInitials(a?.first_name, a?.last_name)}</AvatarFallback>
                    </Avatar>
                  </Link>
                  <div className="flex-1">
                    <div className="bg-muted/50 rounded-2xl px-3 py-2">
                      <Link href={`/profile/${a?.username}`}>
                        <span className="text-xs font-semibold hover:underline">{getDisplayName(a ?? { username: 'Unknown' })}</span>
                      </Link>
                      <p className="text-sm mt-0.5 whitespace-pre-line">{comment.content}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5 ml-2">{formatRelative(comment.created_at)}</p>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            No sightings reported yet. If you've seen this bike, please leave a comment!
          </p>
        )}

        <form onSubmit={handleComment} className="flex items-end gap-2 pt-2">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarImage src="" />
            <AvatarFallback className="text-xs">
              {getInitials((user?.user_metadata as any)?.given_name, (user?.user_metadata as any)?.family_name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 relative">
            <textarea
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Share a sighting or helpful information..."
              rows={1}
              className="w-full rounded-2xl border bg-muted/50 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-ring pr-9"
              style={{ minHeight: '38px', maxHeight: '120px' }}
            />
            <button
              type="submit"
              disabled={!commentText.trim() || addComment.isPending}
              className="absolute right-2.5 bottom-2 text-primary disabled:text-muted-foreground"
            >
              {addComment.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </button>
          </div>
        </form>
      </div>

      <Dialog open={recoverConfirm} onOpenChange={setRecoverConfirm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Recovered</DialogTitle>
            <DialogDescription>
              Has your <strong>{bikeName}</strong> been found? This will remove it from the active missing bikes list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setRecoverConfirm(false)}>Cancel</Button>
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleRecover} disabled={markRecovered.isPending}>
              {markRecovered.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <CheckCircle2 className="h-4 w-4 mr-2" />}
              Yes, It's Recovered!
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {lightbox && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4" onClick={() => setLightbox(null)}>
          <img src={lightbox} className="max-w-full max-h-full object-contain rounded-lg" alt="" />
          <button className="absolute top-4 right-4 text-white/80 hover:text-white text-xl" onClick={() => setLightbox(null)}>✕</button>
        </div>
      )}
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Skeleton className="h-8 w-24" />
      <Skeleton className="h-12 w-full rounded-lg" />
      <Skeleton className="w-full h-64 rounded-xl" />
      <Skeleton className="h-8 w-2/3" />
      <div className="grid sm:grid-cols-2 gap-4">
        <Skeleton className="h-36 rounded-xl" />
        <Skeleton className="h-36 rounded-xl" />
      </div>
      <Skeleton className="h-24 w-full" />
    </div>
  )
}