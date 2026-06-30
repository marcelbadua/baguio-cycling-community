// ============================================================
// src/app/(app)/admin/page.tsx — Overview / Dashboard
// ============================================================
'use client'

import { useDashboardStats } from '@/features/admin/hooks'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Users, FileText, Calendar, Bike,
  AlertTriangle, UserPlus, TrendingUp,
} from 'lucide-react'

interface StatCardProps {
  label: string
  value: number | undefined
  icon: React.ReactNode
  sub?: string
  highlight?: boolean
}

function StatCard({ label, value, icon, sub, highlight }: StatCardProps) {
  return (
    <Card className={highlight ? 'border-destructive/50 bg-destructive/5' : ''}>
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs text-muted-foreground font-medium">{label}</p>
            {value === undefined
              ? <Skeleton className="h-8 w-16 mt-1" />
              : <p className="text-3xl font-bold mt-1">{value.toLocaleString()}</p>}
            {sub && <p className="text-xs text-muted-foreground mt-0.5">{sub}</p>}
          </div>
          <div className={`p-2 rounded-lg ${highlight ? 'bg-destructive/10 text-destructive' : 'bg-muted text-muted-foreground'}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AdminOverviewPage() {
  const { data: stats, isLoading } = useDashboardStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Overview of the Baguio Cycling Community.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Members"
          value={isLoading ? undefined : stats?.totalUsers}
          icon={<Users className="h-5 w-5" />}
          sub="registered cyclists"
        />
        <StatCard
          label="New This Week"
          value={isLoading ? undefined : stats?.newUsersThisWeek}
          icon={<UserPlus className="h-5 w-5" />}
          sub="new sign-ups"
        />
        <StatCard
          label="Total Posts"
          value={isLoading ? undefined : stats?.totalPosts}
          icon={<FileText className="h-5 w-5" />}
        />
        <StatCard
          label="Events"
          value={isLoading ? undefined : stats?.totalEvents}
          icon={<Calendar className="h-5 w-5" />}
        />
        <StatCard
          label="Active Hazards"
          value={isLoading ? undefined : stats?.activeHazards}
          icon={<AlertTriangle className="h-5 w-5" />}
          highlight={(stats?.activeHazards ?? 0) > 0}
          sub="need attention"
        />
        <StatCard
          label="Active Missing Bikes"
          value={isLoading ? undefined : stats?.activeMissingBikes}
          icon={<Bike className="h-5 w-5" />}
          highlight={(stats?.activeMissingBikes ?? 0) > 0}
          sub="unrecovered"
        />
        <StatCard
          label="Total Missing Reports"
          value={isLoading ? undefined : stats?.totalMissingBikes}
          icon={<TrendingUp className="h-5 w-5" />}
          sub="all time"
        />
      </div>

      {/* Quick links */}
      <div>
        <h2 className="font-semibold mb-3">Quick Actions</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            { href: '/admin/users',         label: 'Manage Users',         icon: <Users className="h-4 w-4" />         },
            { href: '/admin/posts',         label: 'Moderate Posts',       icon: <FileText className="h-4 w-4" />      },
            { href: '/admin/events',        label: 'Review Events',        icon: <Calendar className="h-4 w-4" />      },
            { href: '/admin/hazards',       label: 'Review Hazards',       icon: <AlertTriangle className="h-4 w-4" /> },
            { href: '/admin/missing-bikes', label: 'Missing Bikes',        icon: <Bike className="h-4 w-4" />          },
            { href: '/admin/announce',      label: 'Post Announcement',    icon: <TrendingUp className="h-4 w-4" />    },
          ].map(({ href, label, icon }) => (
            <a
              key={href}
              href={href}
              className="flex items-center gap-2 p-3 rounded-lg border hover:bg-muted transition-colors text-sm font-medium"
            >
              <span className="text-muted-foreground">{icon}</span>
              {label}
            </a>
          ))}
        </div>
      </div>
    </div>
  )
}
