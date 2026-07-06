// ============================================================
// src/app/(app)/admin/hazards/page.tsx
// ============================================================
'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  useAdminHazards, useAdminDeleteHazard, useAdminSetHazardStatus,
} from '@/features/admin/hooks'
import { HAZARD_TYPE_CONFIG } from '@/features/hazards/constants'
import { AdminTable } from '@/components/admin/admin-table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { CheckCircle2, ExternalLink, RefreshCw, Trash2 } from 'lucide-react'
import { formatRelative, getDisplayName } from '@/lib/utils'
import type { HazardType } from '@/types/models'

export default function AdminHazardsPage() {
  const { toast } = useToast()
  const [page, setPage] = useState(0)
  const { data: hazards, isLoading } = useAdminHazards(page)
  const deleteHazard = useAdminDeleteHazard()
  const setStatus    = useAdminSetHazardStatus()

  const handleStatus = async (id: string, current: 'active' | 'fixed') => {
    const next = current === 'active' ? 'fixed' : 'active'
    await setStatus.mutateAsync({ id, status: next })
    toast({ title: next === 'fixed' ? '✅ Marked as fixed.' : '⚠️ Re-opened.' })
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Hazard Reports</h1>
      <AdminTable
        headers={['Type', 'Barangay', 'Reporter', 'Confirms', 'Status', 'Reported', '']}
        isLoading={isLoading}
        rows={(hazards ?? []).map(h => {
          const reporter = h.reporter
          const cfg      = HAZARD_TYPE_CONFIG[h.hazard_type as HazardType]
          return (
            <tr key={h.id} className={`border-b hover:bg-muted/30 ${h.is_deleted ? 'opacity-40' : ''}`}>
              <td className="px-4 py-3 whitespace-nowrap">
                <span className="flex items-center gap-1.5 text-sm">
                  {cfg.emoji} {cfg.label}
                </span>
              </td>
              <td className="px-4 py-3 text-muted-foreground max-w-[160px]">
                <p className="truncate">{h.barangay}</p>
                {h.landmark && <p className="text-xs truncate">{h.landmark}</p>}
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                {reporter ? getDisplayName(reporter) : '—'}
              </td>
              <td className="px-4 py-3 text-center text-muted-foreground">
                {h.confirm_count}
              </td>
              <td className="px-4 py-3">
                <Badge variant={h.is_deleted ? 'destructive' : h.status === 'fixed' ? 'secondary' : 'default'}>
                  {h.is_deleted ? 'Deleted' : h.status}
                </Badge>
              </td>
              <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                {formatRelative(h.created_at)}
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                    <Link href={`/hazards/${h.id}`}><ExternalLink className="h-3.5 w-3.5" /></Link>
                  </Button>
                  {!h.is_deleted && (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        title={h.status === 'fixed' ? 'Re-open' : 'Mark Fixed'}
                        onClick={() => handleStatus(h.id, h.status ?? 'active')}
                      >
                        {h.status === 'fixed'
                          ? <RefreshCw className="h-3.5 w-3.5" />
                          : <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={() => {
                          deleteHazard.mutate(h.id)
                          toast({ title: 'Hazard deleted.' })
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              </td>
            </tr>
          )
        })}
      />
      <div className="flex justify-center gap-2">
        <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
        <Button variant="outline" size="sm" disabled={(hazards?.length ?? 0) < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
      </div>
    </div>
  )
}
