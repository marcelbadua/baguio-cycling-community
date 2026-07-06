// ============================================================
// src/components/user-avatar.tsx — Consistent avatar helper
// ============================================================
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import Link from 'next/link'
import { getInitials } from '@/lib/utils'
import { cn } from '@/lib/utils'
import type { Profile } from '@/types/models'

interface Props {
  profile:   Pick<Profile, 'avatar_url' | 'first_name' | 'last_name' | 'username'>
  size?:     'xs' | 'sm' | 'md' | 'lg'
  linkable?: boolean
  className?: string
}

const sizes = {
  xs: 'h-6 w-6',
  sm: 'h-8 w-8',
  md: 'h-10 w-10',
  lg: 'h-14 w-14',
}

const textSizes = { xs: 'text-[9px]', sm: 'text-xs', md: 'text-sm', lg: 'text-base' }

export function UserAvatar({ profile, size = 'md', linkable = false, className }: Props) {
  const initials = getInitials(profile.first_name, profile.last_name)
  const avatar = (
    <Avatar className={cn(sizes[size], className)}>
      <AvatarImage src={profile.avatar_url ?? ''} />
      <AvatarFallback className={textSizes[size]}>{initials}</AvatarFallback>
    </Avatar>
  )
  if (linkable) {
    return <Link href={`/profile/${profile.username}`}>{avatar}</Link>
  }
  return avatar
}