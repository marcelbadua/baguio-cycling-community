'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useAuth } from '@/features/auth/hooks'
import { signOut } from '@/features/auth/actions'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Home, Calendar, AlertTriangle, Bike, Search, LogOut, Settings, User, Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useTheme } from 'next-themes'
import { useRouter } from 'next/navigation'

const navItems = [
  { href: '/feed',          icon: Home,          label: 'Feed'    },
  { href: '/events',        icon: Calendar,      label: 'Events'  },
  { href: '/missing-bikes', icon: Bike,          label: 'Missing' },
  { href: '/hazards',       icon: AlertTriangle, label: 'Hazards' },
  { href: '/search',        icon: Search,        label: 'Search'  },
]

export function Navbar() {
  const { user, profile, loading } = useAuth()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const router = useRouter()
  const initials = [profile?.first_name?.[0], profile?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?'

  return (
    <>
      <header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/feed" className="font-bold text-lg text-primary">🚵 BCC</Link>

          <nav className="hidden md:flex items-center gap-1">
            {navItems.map(({ href, icon: Icon, label }) => (
              <Link key={href} href={href}>
                <Button variant={pathname.startsWith(href) ? 'secondary' : 'ghost'} size="sm">
                  <Icon className="h-4 w-4 mr-1.5" />{label}
                </Button>
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* Theme toggle */}
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="h-9 w-9 inline-flex items-center justify-center rounded-md hover:bg-accent transition-colors"
              aria-label="Toggle theme"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 transition-all" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 dark:rotate-0 dark:scale-100 transition-all" />
            </button>

            {/* Auth section */}
            {!loading && !user ? (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" onClick={() => router.push('/login')}>
                  Sign In
                </Button>
                <Button size="sm" onClick={() => router.push('/signup')}>
                  Sign Up
                </Button>
              </div>
            ) : !loading && user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <div className="h-8 w-8 rounded-full cursor-pointer hover:opacity-80 transition-opacity">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url ?? ''} />
                      <AvatarFallback className="text-xs">{initials}</AvatarFallback>
                    </Avatar>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium truncate">{profile?.display_name || profile?.username}</p>
                    <p className="text-xs text-muted-foreground">@{profile?.username}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => router.push(`/profile/${profile?.username}`)}>
                    <User className="mr-2 h-4 w-4" /> Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => router.push('/profile/settings')}>
                    <Settings className="mr-2 h-4 w-4" /> Settings
                  </DropdownMenuItem>
                  {profile?.role === 'admin' && (
                    <DropdownMenuItem onClick={() => router.push('/admin')}>
                      <Settings className="mr-2 h-4 w-4" /> Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive cursor-pointer"
                    onClick={async () => {
                      await signOut()
                      router.push('/login')
                    }}
                  >
                    <LogOut className="mr-2 h-4 w-4" /> Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : null}
          </div>
        </div>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 border-t bg-background/95 backdrop-blur">
        <div className="flex justify-around items-center h-14">
          {navItems.map(({ href, icon: Icon, label }) => (
            <Link key={href} href={href} className="flex flex-col items-center gap-0.5 px-2">
              <Icon className={cn('h-5 w-5', pathname.startsWith(href) ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('text-[10px]', pathname.startsWith(href) ? 'text-primary' : 'text-muted-foreground')}>
                {label}
              </span>
            </Link>
          ))}
        </div>
      </nav>
        

    </>
  )
}