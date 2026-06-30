// ============================================================
// src/features/missing-bikes/components/missing-bike-card.tsx
// ============================================================
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Calendar, AlertTriangle, CheckCircle2 } from 'lucide-react'
import { formatDate, formatRelative, getInitials, getDisplayName } from '@/lib/utils'
import type { MissingBike } from '@/types/database'

interface Props { report: MissingBike }

export function MissingBikeCard({ report }: Props) {
  const bike  = report.bike  as any
  const owner = report.owner as any

  const bikeName = bike?.nickname
    ? `${bike.nickname} (${bike.brand}${bike.model ? ` ${bike.model}` : ''})`
    : `${bike?.brand ?? ''}${bike?.model ? ` ${bike.model}` : ''}`

  // Best photo: first extra photo, or bike's own photo
  const coverPhoto = report.photos?.[0] ?? bike?.photo_url ?? null
  const isRecovered = report.status === 'recovered'

  return (
    <Link href={`/missing-bikes/${report.id}`}>
      <Card className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${isRecovered ? 'opacity-60' : ''}`}>
        {/* Photo */}
        <div className="relative w-full h-44 bg-muted overflow-hidden">
          {coverPhoto ? (
            <img src={coverPhoto} alt={bikeName} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
              <AlertTriangle className="h-10 w-10 opacity-30" />
            </div>
          )}

          {/* Status badge */}
          <div className="absolute top-2 left-2">
            {isRecovered ? (
              <Badge className="gap-1 bg-green-600 hover:bg-green-600">
                <CheckCircle2 className="h-3 w-3" /> Recovered
              </Badge>
            ) : (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" /> Missing
              </Badge>
            )}
          </div>

          {/* Bike ID */}
          <div className="absolute bottom-2 right-2">
            <span className="text-[10px] font-mono bg-black/60 text-white px-1.5 py-0.5 rounded">
              {bike?.bike_id}
            </span>
          </div>
        </div>

        <CardContent className="p-4 space-y-2">
          {/* Bike name */}
          <h3 className="font-semibold leading-tight line-clamp-1">{bikeName}</h3>

          {/* Specs */}
          <div className="flex flex-wrap gap-1">
            {bike?.year && <Badge variant="outline" className="text-xs">{bike.year}</Badge>}
            {bike?.wheel_size && <Badge variant="outline" className="text-xs">{bike.wheel_size}</Badge>}
          </div>

          {/* Last seen */}
          {report.last_seen_location && (
            <p className="text-xs text-muted-foreground flex items-start gap-1">
              <MapPin className="h-3.5 w-3.5 shrink-0 mt-0.5" />
              <span className="line-clamp-1">{report.last_seen_location}</span>
            </p>
          )}

          {/* Date */}
          <p className="text-xs text-muted-foreground flex items-center gap-1">
            <Calendar className="h-3.5 w-3.5" />
            {report.date_missing
              ? `Missing since ${formatDate(report.date_missing)}`
              : `Reported ${formatRelative(report.created_at)}`}
          </p>

          {/* Owner */}
          <div className="flex items-center gap-1.5 pt-1 border-t">
            <Avatar className="h-5 w-5">
              <AvatarImage src={owner?.avatar_url ?? ''} />
              <AvatarFallback className="text-[9px]">
                {getInitials(owner?.first_name, owner?.last_name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-muted-foreground line-clamp-1">
              {getDisplayName(owner ?? { username: 'Unknown' })}
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
