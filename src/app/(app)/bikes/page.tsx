// ============================================================
// src/app/(app)/bikes/page.tsx
// ============================================================
'use client'

import { useState } from 'react'
import { useAuth } from '@/features/auth/hooks'
import { useMyBikes, useCreateBike, useUpdateBike, useDeleteBike, useUploadBikePhoto } from '@/features/bikes/hooks'
import { BikeCard } from '@/features/bikes/components/bike-card'
import { BikeForm, type BikeFormData } from '@/features/bikes/components/bike-form'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from '@/components/ui/sheet'
import { useToast } from '@/components/ui/use-toast'
import { Plus, Bike } from 'lucide-react'
import type { Bike as BikeType } from '@/types/models'
import { useRouter } from 'next/navigation'

export default function BikesPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const router = useRouter()
  const uid = user?.id ?? ''

  const { data: bikes, isLoading } = useMyBikes(uid)
  const createBike = useCreateBike(uid)
  const updateBike = useUpdateBike(uid)
  const deleteBike = useDeleteBike(uid)
  const uploadPhoto = useUploadBikePhoto(uid)

  const [addOpen, setAddOpen] = useState(false)
  const [editBike, setEditBike] = useState<BikeType | null>(null)
  const [reportBike, setReportBike] = useState<BikeType | null>(null)

  // ── Create ──────────────────────────────────────────────
  const handleCreate = async (data: BikeFormData, photoFile?: File) => {
    const result = await createBike.mutateAsync({
      nickname:   data.nickname || null,
      brand:      data.brand,
      model:      data.model || null,
      year:       data.year ? Number(data.year) : null,
      wheel_size: data.wheel_size || null,
      frame_size: data.frame_size || null,
      notes:      data.notes || null,
    })
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }
    // Upload photo if provided
    if (photoFile && result.data) {
      const photoResult = await uploadPhoto.mutateAsync({ bikeId: result.data.id, file: photoFile })
      if (photoResult.url) {
        await updateBike.mutateAsync({ id: result.data.id, updates: { photo_url: photoResult.url } })
      }
    }
    toast({ title: 'Bike added to your registry!' })
    setAddOpen(false)
  }

  // ── Update ──────────────────────────────────────────────
  const handleUpdate = async (data: BikeFormData, photoFile?: File) => {
    if (!editBike) return
    let photo_url = editBike.photo_url
    if (photoFile) {
      const photoResult = await uploadPhoto.mutateAsync({ bikeId: editBike.id, file: photoFile })
      if (photoResult.url) photo_url = photoResult.url
    }
    const result = await updateBike.mutateAsync({
      id: editBike.id,
      updates: {
        nickname:   data.nickname || null,
        brand:      data.brand,
        model:      data.model || null,
        year:       data.year ? Number(data.year) : null,
        wheel_size: data.wheel_size || null,
        frame_size: data.frame_size || null,
        notes:      data.notes || null,
        photo_url,
      },
    })
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }
    toast({ title: 'Bike updated!' })
    setEditBike(null)
  }

  // ── Delete ──────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    const result = await deleteBike.mutateAsync(id)
    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
    } else {
      toast({ title: 'Bike removed from registry.' })
    }
  }

  // ── Report Missing → navigate to missing-bikes/report ──
  const handleReportMissing = (bike: BikeType) => {
    router.push(`/missing-bikes/report?bikeId=${bike.id}`)
  }

  // ── Render ──────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">My Bikes</h1>
          <p className="text-muted-foreground text-sm">
            Your private bike registry. Only you can see these unless a bike is marked missing.
          </p>
        </div>
        <Button onClick={() => setAddOpen(true)} className="gap-1.5">
          <Plus className="h-4 w-4" /> Add Bike
        </Button>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : bikes && bikes.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {bikes.map(bike => (
            <BikeCard
              key={bike.id}
              bike={bike}
              onEdit={setEditBike}
              onDelete={handleDelete}
              onReportMissing={handleReportMissing}
              isDeleting={deleteBike.isPending}
            />
          ))}
        </div>
      ) : (
        <EmptyState onAdd={() => setAddOpen(true)} />
      )}

      {/* Add Bike Sheet */}
      <Sheet open={addOpen} onOpenChange={setAddOpen}>
        <SheetContent side="right" className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle>Register a Bike</SheetTitle>
            <SheetDescription>
              Add your bike to your private registry. Record its details so you can report it quickly if stolen.
            </SheetDescription>
          </SheetHeader>
          <BikeForm
            onSubmit={handleCreate}
            isPending={createBike.isPending || uploadPhoto.isPending}
            submitLabel="Register Bike"
          />
        </SheetContent>
      </Sheet>

      {/* Edit Bike Dialog */}
      <Dialog open={!!editBike} onOpenChange={v => !v && setEditBike(null)}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Bike</DialogTitle>
          </DialogHeader>
          {editBike && (
            <BikeForm
              defaultValues={editBike}
              onSubmit={handleUpdate}
              isPending={updateBike.isPending || uploadPhoto.isPending}
              submitLabel="Save Changes"
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <div className="rounded-full bg-muted p-6">
        <Bike className="h-12 w-12 text-muted-foreground" />
      </div>
      <div>
        <h3 className="font-semibold text-lg">No bikes registered yet</h3>
        <p className="text-muted-foreground text-sm max-w-xs mt-1">
          Register your bikes to keep a private record. If one gets stolen, you can report it to the community instantly.
        </p>
      </div>
      <Button onClick={onAdd} className="gap-1.5">
        <Plus className="h-4 w-4" /> Register Your First Bike
      </Button>
    </div>
  )
}