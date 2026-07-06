'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Dialog, DialogContent, DialogHeader,
  DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog'
import { Bike, MoreVertical, Pencil, Trash2, AlertTriangle } from 'lucide-react'
import type { Bike as BikeType } from '@/types/models'
import { formatDate } from '@/lib/utils'

interface Props {
  bike: BikeType
  onEdit: (bike: BikeType) => void
  onDelete: (id: string) => void
  onReportMissing: (bike: BikeType) => void
  isDeleting?: boolean
}

export function BikeCard({ bike, onEdit, onDelete, onReportMissing, isDeleting }: Props) {
  const [confirmDelete, setConfirmDelete] = useState(false)

  const label = bike.nickname
    ? `${bike.nickname} (${bike.brand}${bike.model ? ` ${bike.model}` : ''})`
    : `${bike.brand}${bike.model ? ` ${bike.model}` : ''}`

  return (
    <>
      <Card className="overflow-hidden hover:shadow-md transition-shadow">
        {/* Photo */}
        <div className="relative w-full h-44 bg-muted">
          {bike.photo_url ? (
            <img
              src={bike.photo_url}
              alt={label}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <Bike className="h-12 w-12 opacity-30" />
            </div>
          )}
          {bike.is_missing && (
            <div className="absolute top-2 left-2">
              <Badge variant="destructive" className="text-xs gap-1">
                <AlertTriangle className="h-3 w-3" /> MISSING
              </Badge>
            </div>
          )}
          {/* Menu */}
          <div className="absolute top-2 right-2">
            <DropdownMenu>
              <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-secondary hover:bg-secondary/80 transition-colors outline-none">
                <MoreVertical className="h-4 w-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onEdit(bike)}>
                  <Pencil className="mr-2 h-4 w-4" /> Edit
                </DropdownMenuItem>
                {!bike.is_missing && (
                  <DropdownMenuItem
                    className="text-amber-600"
                    onClick={() => onReportMissing(bike)}
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" /> Report Missing
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-destructive"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Trash2 className="mr-2 h-4 w-4" /> Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <CardContent className="p-4 space-y-2">
          <p className="text-[11px] font-mono text-muted-foreground">{bike.bike_id}</p>
          <h3 className="font-semibold leading-tight truncate">{label}</h3>
          <div className="flex flex-wrap gap-1.5">
            {bike.year && (
              <Badge variant="outline" className="text-xs">{bike.year}</Badge>
            )}
            {bike.wheel_size && (
              <Badge variant="outline" className="text-xs">{bike.wheel_size}</Badge>
            )}
            {bike.frame_size && (
              <Badge variant="outline" className="text-xs">Frame {bike.frame_size}</Badge>
            )}
          </div>
          {bike.notes && (
            <p className="text-xs text-muted-foreground line-clamp-2">{bike.notes}</p>
          )}
          <p className="text-xs text-muted-foreground">Added {formatDate(bike.created_at)}</p>
        </CardContent>
      </Card>

      {/* Delete Confirm Dialog */}
      <Dialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Bike</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{label}</strong>? This cannot be undone.
              {bike.is_missing && (
                <span className="block mt-2 text-destructive font-medium">
                  ⚠️ This bike is currently marked as missing. Deleting it will also remove the missing report.
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={() => setConfirmDelete(false)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={isDeleting}
              onClick={() => { onDelete(bike.id); setConfirmDelete(false) }}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}