'use client'

import { useAuth } from '@/features/auth/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { MapPin } from 'lucide-react'
import { getInitials, getDisplayName } from '@/lib/utils'

// ── Sidebar: Left ─────────────────────────────────────────────
export function LeftSidebar() {
  const { user, profile } = useAuth()

  // Hide entire sidebar for guests
  if (!user) return null

  const initials = getInitials(profile?.first_name, profile?.last_name)
  const name = profile ? getDisplayName(profile) : ''

  return (
    <aside className="hidden lg:flex flex-col gap-4 w-64 shrink-0">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="flex flex-col items-center text-center gap-2">
            <Avatar className="h-20 w-20 ring-4 ring-primary/20">
              <AvatarImage src={profile?.avatar_url ?? ''} />
              <AvatarFallback className="text-lg">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div>
              <p className="font-bold text-base">{name}</p>
              <p className="text-sm text-muted-foreground">
                @{profile?.username}
              </p>

              {profile?.barangay && (
                <p className="text-xs text-muted-foreground flex items-center justify-center gap-1 mt-0.5">
                  <MapPin className="h-3 w-3" />
                  {profile.barangay}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </aside>
  )
}