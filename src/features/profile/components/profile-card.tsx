

// ============================================================
// src/features/profile/components/profile-card.tsx
// Compact card used in search results / sidebars
// ============================================================
import Link from 'next/link'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import type { Profile } from '@/types/database'
import { CYCLIST_TYPE_LABELS } from './cyclist-type-selector'

interface Props { profile: Profile }

export function ProfileCard({ profile }: Props) {
  const initials = [profile.first_name?.[0], profile.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?'
  const name = profile.display_name || `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || profile.username

  return (
    <Link href={`/profile/${profile.username}`}>
      <div className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors">
        <Avatar className="h-10 w-10">
          <AvatarImage src={profile.avatar_url ?? ''} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-medium text-sm truncate">{name}</p>
          <p className="text-xs text-muted-foreground">@{profile.username}</p>
          {profile.cyclist_types.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-1">
              {profile.cyclist_types.slice(0, 3).map(t => (
                <Badge key={t} variant="secondary" className="text-[10px] px-1.5 py-0">
                  {CYCLIST_TYPE_LABELS[t]}
                </Badge>
              ))}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}