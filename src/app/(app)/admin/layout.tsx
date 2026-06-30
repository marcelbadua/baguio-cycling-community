// ============================================================
// src/app/(app)/admin/layout.tsx
// ============================================================
'use client'

import { useAuth } from '@/features/auth/hooks'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Loader2, LayoutDashboard, Users, FileText, Calendar, AlertTriangle, Bike, Megaphone } from 'lucide-react'

const NAV = [
  { href: '/admin',              icon: LayoutDashboard, label: 'Overview'      },
  { href: '/admin/users',        icon: Users,           label: 'Users'         },
  { href: '/admin/posts',        icon: FileText,        label: 'Posts'         },
  { href: '/admin/events',       icon: Calendar,        label: 'Events'        },
  { href: '/admin/hazards',      icon: AlertTriangle,   label: 'Hazards'       },
  { href: '/admin/missing-bikes',icon: Bike,            label: 'Missing Bikes' },
  { href: '/admin/announce',     icon: Megaphone,       label: 'Announce'      },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { profile, loading } = useAuth()
  const router  = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    if (!loading && profile && profile.role !== 'admin') router.replace('/feed')
    if (!loading && !profile) router.replace('/login')
  }, [loading, profile, router])

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
    </div>
  )

  if (profile?.role !== 'admin') return null

  return (
    <div className="flex min-h-screen">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-56 border-r bg-muted/30 p-4 gap-1 shrink-0">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
          Admin Panel
        </p>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors',
                active
                  ? 'bg-primary text-primary-foreground font-medium'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground'
              )}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          )
        })}
      </aside>

      {/* Mobile top nav */}
      <div className="md:hidden fixed top-14 left-0 right-0 z-40 bg-background border-b overflow-x-auto">
        <div className="flex gap-1 px-3 py-2 w-max">
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href || (href !== '/admin' && pathname.startsWith(href))
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs whitespace-nowrap transition-colors',
                  active
                    ? 'bg-primary text-primary-foreground font-medium'
                    : 'text-muted-foreground hover:bg-muted'
                )}
              >
                <Icon className="h-3.5 w-3.5" /> {label}
              </Link>
            )
          })}
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 p-6 md:p-8 mt-10 md:mt-0 overflow-auto">
        {children}
      </main>
    </div>
  )
}