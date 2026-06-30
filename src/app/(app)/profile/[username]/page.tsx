// ============================================================
// src/app/(app)/profile/[username]/page.tsx
// ============================================================
'use client'

import { use } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { useProfileByUsername } from '@/features/profile/hooks'
import { useAuth } from '@/features/auth/hooks'
import { CYCLIST_TYPE_LABELS } from '@/features/profile/components/cyclist-type-selector'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Separator } from '@/components/ui/separator'
import { Link2, MapPin, Route, Settings, ExternalLink, Bike } from 'lucide-react'
// Strava icon (SVG inline since lucide doesn't have it)
function StravaIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
    </svg>
  )
}

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params)
  const { data: profile, isLoading } = useProfileByUsername(username)
  const { profile: myProfile } = useAuth()

  if (isLoading) return <ProfileSkeleton />
  if (!profile) return notFound()

  const isOwner = myProfile?.id === profile.id
  const initials = [profile.first_name?.[0], profile.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?'
  const name = profile.display_name || `${profile.first_name ?? ''} ${profile.last_name ?? ''}`.trim() || profile.username

  return (
    <div className="max-w-3xl mx-auto">
      {/* Cover */}
      <div
        className="w-full h-40 md:h-56 bg-muted rounded-t-xl"
        style={
          profile.cover_url
            ? { backgroundImage: `url(${profile.cover_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : {}
        }
      />

      {/* Avatar + Actions row */}
      <div className="relative bg-card border-x border-b rounded-b-xl px-4 pb-4">
        <div className="flex items-end justify-between -mt-12 mb-3">
          <Avatar className="h-24 w-24 ring-4 ring-background">
            <AvatarImage src={profile.avatar_url ?? ''} />
            <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
          </Avatar>
          {isOwner && (
            <Link href="/profile/settings">
              <Button variant="outline" size="sm" className="gap-1.5">
                <Settings className="h-4 w-4" /> Edit Profile
              </Button>
            </Link>
          )}
        </div>

        {/* Name & username */}
        <h1 className="text-xl font-bold">{name}</h1>
        <p className="text-sm text-muted-foreground">@{profile.username}</p>

        {/* Location */}
        {profile.barangay && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
            <MapPin className="h-3.5 w-3.5" />
            <span>{profile.barangay}, Baguio City</span>
          </div>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="mt-3 text-sm leading-relaxed">{profile.bio}</p>
        )}

        {/* Cyclist types */}
        {profile.cyclist_types.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {profile.cyclist_types.map(t => (
              <Badge key={t} variant="secondary">
                {CYCLIST_TYPE_LABELS[t]}
              </Badge>
            ))}
          </div>
        )}

        <Separator className="my-4" />

        {/* Daily route */}
        {profile.daily_route && (
          <div className="mb-4">
            <div className="flex items-center gap-1.5 text-sm font-medium mb-1">
              <Route className="h-4 w-4" /> Typical Daily Route
            </div>
            <p className="text-sm text-muted-foreground">{profile.daily_route}</p>
          </div>
        )}

        {/* Social links */}
        <div className="flex flex-wrap gap-2">
          {profile.facebook_url && <a href={profile.facebook_url} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm" className="gap-1.5"><Link2 className="h-4 w-4" /> Facebook</Button></a>}
{profile.instagram_url && <a href={profile.instagram_url} target="_blank" rel="noopener noreferrer"><Button variant="outline" size="sm" className="gap-1.5"><Link2 className="h-4 w-4" /> Instagram</Button></a>}
          {profile.strava_url && (
            <a href={profile.strava_url} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="sm" className="gap-1.5">
                <StravaIcon className="h-4 w-4" /> Strava
              </Button>
            </a>
          )}
        </div>

        {/* Owner-only: bikes shortcut */}
        {isOwner && (
          <div className="mt-4">
            <Separator className="mb-4" />
            <Link href="/bikes">
              <Button variant="ghost" size="sm" className="gap-1.5 text-muted-foreground">
                <Bike className="h-4 w-4" /> Manage My Bikes
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}

function ProfileSkeleton() {
  return (
    <div className="max-w-3xl mx-auto">
      <Skeleton className="w-full h-40 md:h-56 rounded-t-xl" />
      <div className="bg-card border-x border-b rounded-b-xl px-4 pb-4">
        <div className="flex items-end justify-between -mt-12 mb-3">
          <Skeleton className="h-24 w-24 rounded-full" />
        </div>
        <Skeleton className="h-6 w-48 mb-2" />
        <Skeleton className="h-4 w-24 mb-4" />
        <Skeleton className="h-16 w-full" />
      </div>
    </div>
  )
}