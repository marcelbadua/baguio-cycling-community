// ============================================================
// src/features/hazards/components/hazard-card.tsx
// ============================================================
'use client'

import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, ThumbsUp, CheckCircle2 } from 'lucide-react'
import { HAZARD_TYPE_CONFIG } from '../constants'
import { formatRelative, getInitials, getDisplayName } from '@/lib/utils'
import type { HazardReportWithReporter } from '@/types/models'

interface Props { report: HazardReportWithReporter }

export function HazardCard({ report }: Props) {
  const reporter = report.reporter
  const cfg      = HAZARD_TYPE_CONFIG[report.hazard_type]
  const isFixed  = report.status === 'fixed'

  return (
    <Link href={`/hazards/${report.id}`}>
      <Card className={`overflow-hidden hover:shadow-md transition-shadow cursor-pointer ${isFixed ? 'opacity-60' : ''}`}>
        {/* Photo or type banner */}
        <div className="relative w-full h-40 bg-muted overflow-hidden">
          {report.photo_url ? (
            <img src={report.photo_url} className="w-full h-full object-cover" alt="" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl">
              {cfg.emoji}
            </div>
          )}
          {/* Status */}
          <div className="absolute top-2 left-2 flex gap-1.5">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg.color}`}>
              {cfg.emoji} {cfg.label}
            </span>
          </div>
          {isFixed && (
            <div className="absolute top-2 right-2">
              <Badge className="gap-1 bg-green-600 hover:bg-green-600 text-white text-xs">
                <CheckCircle2 className="h-3 w-3" /> Fixed
              </Badge>
            </div>
          )}
        </div>

        <CardContent className="p-4 space-y-2">
          {/* Location */}
          <div className="flex items-start gap-1 text-sm font-medium">
            <MapPin className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <span className="line-clamp-1">{report.barangay}</span>
          </div>
          {report.landmark && (
            <p className="text-xs text-muted-foreground line-clamp-1 ml-5">{report.landmark}</p>
          )}

          {/* Description */}
          {report.description && (
            <p className="text-xs text-muted-foreground line-clamp-2">{report.description}</p>
          )}

          {/* Footer */}
          <div className="flex items-center justify-between pt-1 border-t">
            <div className="flex items-center gap-1.5">
              <Avatar className="h-5 w-5">
                <AvatarImage src={reporter?.avatar_url ?? ''} />
                <AvatarFallback className="text-[9px]">
                  {getInitials(reporter?.first_name, reporter?.last_name)}
                </AvatarFallback>
              </Avatar>
              <span className="text-xs text-muted-foreground line-clamp-1">
                {formatRelative(report.created_at)}
              </span>
            </div>
            {(report.confirm_count ?? 0) > 0 && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <ThumbsUp className="h-3.5 w-3.5" />
                <span>{report.confirm_count}</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}