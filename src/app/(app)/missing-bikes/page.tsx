
// ============================================================
// src/app/(app)/missing-bikes/page.tsx
// ============================================================
'use client'

import { useState } from 'react'
import { useActiveMissingBikes, useAllMissingBikes } from '@/features/missing-bikes/hooks'
import { MissingBikeCard } from '@/features/missing-bikes/components/missing-bike-card'
import { EmptyState } from '@/components/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { AlertTriangle, Search } from 'lucide-react'

type Filter = 'active' | 'all'

export default function MissingBikesPage() {
  const [filter, setFilter] = useState<Filter>('active')
  const [search, setSearch] = useState('')

  const { data: active, isLoading: loadingActive } = useActiveMissingBikes()
  const { data: all,    isLoading: loadingAll    } = useAllMissingBikes()

  const isLoading = filter === 'active' ? loadingActive : loadingAll
  const reports   = filter === 'active' ? (active ?? []) : (all ?? [])

  const filtered = search.trim()
    ? reports.filter(r => {
        const bike  = r.bike  as any
        const query = search.toLowerCase()
        return (
          bike?.brand?.toLowerCase().includes(query) ||
          bike?.model?.toLowerCase().includes(query) ||
          bike?.nickname?.toLowerCase().includes(query) ||
          r.last_seen_location?.toLowerCase().includes(query) ||
          r.description?.toLowerCase().includes(query)
        )
      })
    : reports

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <AlertTriangle className="h-6 w-6 text-destructive" />
          Missing Bikes
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Help the community recover stolen or lost bikes. If you spot one, leave a comment on its report.
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by brand, model, location..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Tabs value={filter} onValueChange={v => setFilter(v as Filter)}>
          <TabsList>
            <TabsTrigger value="active">
              Active {active ? `(${active.length})` : ''}
            </TabsTrigger>
            <TabsTrigger value="all">All Reports</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-72 rounded-xl" />
          ))}
        </div>
      ) : filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(r => <MissingBikeCard key={r.id} report={r} />)}
        </div>
      ) : (
        <EmptyState
          emoji={search ? '🔍' : filter === 'active' ? '✅' : '🚲'}
          title={
            search
              ? `No results for "${search}"`
              : filter === 'active'
                ? 'No active missing bikes'
                : 'No reports yet'
          }
          description={
            search
              ? 'Try a different search term.'
              : filter === 'active'
                ? 'Great news — the community has no active missing bike reports right now.'
                : undefined
          }
          action={search ? { label: 'Clear search', onClick: () => setSearch('') } : undefined}
        />
      )}
    </div>
  )
}