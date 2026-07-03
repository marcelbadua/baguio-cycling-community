
// ============================================================
// src/app/(app)/search/page.tsx
// ============================================================
'use client'

import { useState, useEffect, useRef } from 'react'
import { useDebounce } from '@/hooks/use-debounce'
import { globalSearch, type SearchResults } from '@/features/search/service'
import { ProfileCard } from '@/features/profile/components/profile-card'
import { EventCard } from '@/features/events/components/event-card'
import { MissingBikeCard } from '@/features/missing-bikes/components/missing-bike-card'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Search, Users, Calendar, Bike } from 'lucide-react'

import Link from "next/link";
import { SITE } from "@/lib/site";

type Tab = 'all' | 'cyclists' | 'events' | 'missing'

export default function SearchPage() {
  const [query,   setQuery]   = useState('')
  const [tab,     setTab]     = useState<Tab>('all')
  const [results, setResults] = useState<SearchResults | null>(null)
  const [loading, setLoading] = useState(false)
  const inputRef              = useRef<HTMLInputElement>(null)
  const debouncedQuery        = useDebounce(query, 350)

  // Auto-focus on mount
  useEffect(() => { inputRef.current?.focus() }, [])

  // Search on debounced query change
  useEffect(() => {
    if (!debouncedQuery.trim()) { setResults(null); return }
    setLoading(true)
    globalSearch(debouncedQuery)
      .then(setResults)
      .finally(() => setLoading(false))
  }, [debouncedQuery])

  const total = results
    ? results.cyclists.length + results.events.length + results.missingBikes.length
    : 0

  const showCyclists    = tab === 'all' || tab === 'cyclists'
  const showEvents      = tab === 'all' || tab === 'events'
  const showMissing     = tab === 'all' || tab === 'missing'

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Search input */}
      <div className="space-y-1">
        <h1 className="text-2xl font-bold">Search</h1>
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            ref={inputRef}
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search cyclists, events, missing bikes..."
            className="pl-10 h-11 text-base"
          />
        </div>
      </div>

      {/* Tabs — shown only when there are results */}
      {results && total > 0 && (
        <Tabs value={tab} onValueChange={v => setTab(v as Tab)}>
          <TabsList>
            <TabsTrigger value="all">
              All ({total})
            </TabsTrigger>
            {results.cyclists.length > 0 && (
              <TabsTrigger value="cyclists" className="gap-1.5">
                <Users className="h-3.5 w-3.5" />
                Cyclists ({results.cyclists.length})
              </TabsTrigger>
            )}
            {results.events.length > 0 && (
              <TabsTrigger value="events" className="gap-1.5">
                <Calendar className="h-3.5 w-3.5" />
                Events ({results.events.length})
              </TabsTrigger>
            )}
            {results.missingBikes.length > 0 && (
              <TabsTrigger value="missing" className="gap-1.5">
                <Bike className="h-3.5 w-3.5" />
                Missing ({results.missingBikes.length})
              </TabsTrigger>
            )}
          </TabsList>
        </Tabs>
      )}

      {/* Loading */}
      {loading && (
        <div className="space-y-6">
          <SearchSectionSkeleton title="Cyclists" count={3} compact />
          <SearchSectionSkeleton title="Events" count={2} />
        </div>
      )}

      {/* Results */}
      {!loading && results && (
        <div className="space-y-8">
          {/* Cyclists */}
          {showCyclists && results.cyclists.length > 0 && (
            <section className="space-y-2">
              <SectionHeader icon={<Users className="h-4 w-4" />} label="Cyclists" count={results.cyclists.length} />
              <div className="border rounded-xl divide-y overflow-hidden">
                {results.cyclists.map(p => (
                  <ProfileCard key={p.id} profile={p} />
                ))}
              </div>
            </section>
          )}

          {/* Events */}
          {showEvents && results.events.length > 0 && (
            <section className="space-y-2">
              <SectionHeader icon={<Calendar className="h-4 w-4" />} label="Upcoming Events" count={results.events.length} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.events.map(e => (
                  <EventCard key={e.id} event={e} compact />
                ))}
              </div>
            </section>
          )}

          {/* Missing bikes */}
          {showMissing && results.missingBikes.length > 0 && (
            <section className="space-y-2">
              <SectionHeader icon={<Bike className="h-4 w-4" />} label="Missing Bikes" count={results.missingBikes.length} />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {results.missingBikes.map(r => (
                  <MissingBikeCard key={r.id} report={r} />
                ))}
              </div>
            </section>
          )}

          {/* No results */}
          {total === 0 && (
            <div className="text-center py-20 space-y-3">
              <p className="text-4xl">🔍</p>
              <h3 className="font-semibold text-lg">No results for "{debouncedQuery}"</h3>
              <p className="text-muted-foreground text-sm">
                Try a different search term or check the spelling.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty state — before any search */}
      {!loading && !results && (
        <div className="text-center py-24 space-y-3">
          <p className="text-5xl">🚵</p>
          <h3 className="font-semibold text-lg">Find anything in {SITE.name}</h3>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">
            Search for cyclists by name or username, upcoming events, or missing bikes.
          </p>
          <div className="flex flex-wrap justify-center gap-2 pt-2">
            {['MTB riders', 'Saturday rides', 'Burnham Park', 'Trek'].map(s => (
              <button
                key={s}
                onClick={() => setQuery(s)}
                className="text-xs px-3 py-1.5 rounded-full border hover:bg-muted transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function SectionHeader({ icon, label, count }: { icon: React.ReactNode; label: string; count: number }) {
  return (
    <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
      {icon}
      <span>{label}</span>
      <span className="text-xs font-normal">({count})</span>
    </div>
  )
}

function SearchSectionSkeleton({ title, count, compact }: { title: string; count: number; compact?: boolean }) {
  return (
    <div className="space-y-2">
      <Skeleton className="h-4 w-24" />
      {compact ? (
        <div className="border rounded-xl divide-y overflow-hidden">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3">
              <Skeleton className="h-10 w-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-1.5">
                <Skeleton className="h-3.5 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: count }).map((_, i) => (
            <Skeleton key={i} className="h-52 rounded-xl" />
          ))}
        </div>
      )}
    </div>
  )
}