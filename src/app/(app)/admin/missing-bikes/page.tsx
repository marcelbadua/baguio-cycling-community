// src/app/(app)/admin/missing-bikes/page.tsx
'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { getAdminMissingBikes, adminUpdateMissingStatus } from '@/features/admin/service'
import { AdminTable } from '@/components/admin/admin-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { useToast } from '@/components/ui/use-toast'
import { MoreHorizontal, Bike, CheckCircle2, AlertTriangle } from 'lucide-react'
import { formatDate, getInitials, getDisplayName } from '@/lib/utils'
import type { MissingBikeWithRelations } from '@/types/models'

export default function AdminMissingBikesPage() {
  const { toast } = useToast()
  const qc = useQueryClient()
  const [page, setPage] = useState(0)
  const [confirmRecover, setConfirmRecover] = useState<MissingBikeWithRelations | null>(null)

  const { data: reports, isLoading } = useQuery({
    queryKey: ['admin', 'missing-bikes', page],
    queryFn: () => getAdminMissingBikes(page),
  })

  const updateStatus = useMutation({
    mutationFn: ({ id, bikeId, status }: { id: string; bikeId: string; status: 'missing' | 'recovered' }) =>
      adminUpdateMissingStatus(id, bikeId, status),
    onSuccess: (_, { status }) => {
      qc.invalidateQueries({ queryKey: ['admin', 'missing-bikes'] })
      toast({ title: status === 'recovered' ? 'Bike marked as recovered.' : 'Bike marked as missing.' })
      setConfirmRecover(null)
    },
    onError: () => toast({ title: 'Error', description: 'Failed to update status.', variant: 'destructive' }),
  })

  const displayed = reports ?? []

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Missing Bikes</h1>
        <p className="text-sm text-muted-foreground">{displayed.length} shown</p>
      </div>

      <AdminTable
        headers={['Bike', 'Owner', 'Location', 'Status', 'Reported', '']}
        isLoading={isLoading}
        rows={displayed.map(report => {
          const bike  = report.bike
          const owner = report.owner
          return (
            <tr key={report.id} className="border-b hover:bg-muted/30">
              {/* Bike */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2.5">
                  {bike?.photo_url ? (
                    <img
                      src={bike.photo_url}
                      alt={bike?.brand}
                      className="h-10 w-10 rounded-md object-cover shrink-0"
                    />
                  ) : (
                    <div className="h-10 w-10 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Bike className="h-5 w-5 text-muted-foreground opacity-50" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">
                      {bike?.brand} {bike?.model ?? ''}
                    </p>
                    <p className="text-xs text-muted-foreground font-mono">{bike?.bike_id}</p>
                  </div>
                </div>
              </td>

              {/* Owner */}
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Avatar className="h-7 w-7 shrink-0">
                    <AvatarImage src={owner?.avatar_url ?? ''} />
                    <AvatarFallback className="text-xs">
                      {getInitials(owner?.first_name, owner?.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="text-sm truncate">{getDisplayName(owner)}</p>
                    <p className="text-xs text-muted-foreground">@{owner?.username}</p>
                  </div>
                </div>
              </td>

              {/* Location */}
              <td className="px-4 py-3 text-sm text-muted-foreground max-w-[160px]">
                <p className="truncate">{report.last_seen_location ?? '—'}</p>
              </td>

              {/* Status */}
              <td className="px-4 py-3">
                <Badge
                  variant={report.status === 'missing' ? 'destructive' : 'outline'}
                  className="text-xs capitalize gap-1"
                >
                  {report.status === 'missing'
                    ? <><AlertTriangle className="h-3 w-3" /> Missing</>
                    : <><CheckCircle2 className="h-3 w-3" /> Recovered</>}
                </Badge>
              </td>

              {/* Date */}
              <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">
                {formatDate(report.created_at)}
              </td>

              {/* Actions */}
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent transition-colors outline-none">
                    <MoreHorizontal className="h-4 w-4" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {report.status === 'missing' ? (
                      <DropdownMenuItem onClick={() => setConfirmRecover(report)}>
                        <CheckCircle2 className="mr-2 h-4 w-4 text-green-500" />
                        Mark as Recovered
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem
                        onClick={() => updateStatus.mutate({
                          id: report.id,
                          bikeId: report.bike_id,
                          status: 'missing',
                        })}
                        disabled={updateStatus.isPending}
                      >
                        <AlertTriangle className="mr-2 h-4 w-4 text-destructive" />
                        Mark as Missing
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          )
        })}
      />

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>
          Previous
        </Button>
        <Button variant="outline" size="sm" disabled={(reports?.length ?? 0) < 20} onClick={() => setPage(p => p + 1)}>
          Next
        </Button>
      </div>

      {/* Confirm recover dialog */}
      <Dialog open={!!confirmRecover} onOpenChange={open => !open && setConfirmRecover(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Mark as Recovered</DialogTitle>
            <DialogDescription>
              Mark{' '}
              <strong>
                {confirmRecover?.bike?.brand} {confirmRecover?.bike?.model ?? ''}
              </strong>{' '}
              owned by <strong>{getDisplayName(confirmRecover?.owner)}</strong> as recovered?
              This will remove it from the active missing bikes list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmRecover(null)}>Cancel</Button>
            <Button
              disabled={updateStatus.isPending}
              onClick={() => confirmRecover && updateStatus.mutate({
                id: confirmRecover.id,
                bikeId: confirmRecover.bike_id,
                status: 'recovered',
              })}
            >
              Mark as Recovered
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}