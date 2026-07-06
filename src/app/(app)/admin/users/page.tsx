
// ============================================================
// src/app/(app)/admin/users/page.tsx
// ============================================================
'use client'

import { useState } from 'react'
import {
  useAdminUsers, useSearchUsers,
  useSetUserRole, useSetUserActive,
} from '@/features/admin/hooks'
import { AdminTable } from '@/components/admin/admin-table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useToast } from '@/components/ui/use-toast'
import { MoreHorizontal, Search, ShieldCheck, ShieldOff, UserX, UserCheck } from 'lucide-react'
import { formatDate, getInitials, getDisplayName } from '@/lib/utils'
import type { Profile } from '@/types/models'

export default function AdminUsersPage() {
  const { toast } = useToast()
  const [query,   setQuery]   = useState('')
  const [page,    setPage]    = useState(0)

  const { data: users,   isLoading: loadingAll }    = useAdminUsers(page)
  const { data: results, isLoading: loadingSearch } = useSearchUsers(query)
  const setRole   = useSetUserRole()
  const setActive = useSetUserActive()

  const displayed  = query.length > 1 ? (results ?? []) : (users ?? [])
  const isLoading  = query.length > 1 ? loadingSearch   : loadingAll

  const handleRole = async (user: Profile) => {
    const newRole = user.role === 'admin' ? 'member' : 'admin'
    const result  = await setRole.mutateAsync({ userId: user.id, role: newRole })
    if (result.error) toast({ title: 'Error', description: result.error, variant: 'destructive' })
    else toast({ title: `${getDisplayName(user)} is now ${newRole}.` })
  }

  const handleActive = async (user: Profile) => {
    const result = await setActive.mutateAsync({ userId: user.id, isActive: !user.is_active })
    if (result.error) toast({ title: 'Error', description: result.error, variant: 'destructive' })
    else toast({ title: user.is_active ? 'User deactivated.' : 'User reactivated.' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Members</h1>
        <div className="relative w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search members..."
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(0) }}
            className="pl-9"
          />
        </div>
      </div>

      <AdminTable
        headers={['Member', 'Username', 'Barangay', 'Joined', 'Role', 'Status', '']}
        isLoading={isLoading}
        rows={displayed.map(u => (
          <tr key={u.id} className="border-b hover:bg-muted/30">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Avatar className="h-8 w-8 shrink-0">
                  <AvatarImage src={u.avatar_url ?? ''} />
                  <AvatarFallback className="text-xs">{getInitials(u.first_name, u.last_name)}</AvatarFallback>
                </Avatar>
                <span className="font-medium whitespace-nowrap">{getDisplayName(u)}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-muted-foreground">@{u.username}</td>
            <td className="px-4 py-3 text-muted-foreground">{u.barangay ?? '—'}</td>
            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{formatDate(u.created_at)}</td>
            <td className="px-4 py-3">
              <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                {u.role}
              </Badge>
            </td>
            <td className="px-4 py-3">
              <Badge variant={u.is_active ? 'outline' : 'destructive'}>
                {u.is_active ? 'Active' : 'Suspended'}
              </Badge>
            </td>
            <td className="px-4 py-3">
              <DropdownMenu>
                <DropdownMenuTrigger className="inline-flex items-center justify-center h-7 w-7 rounded-md hover:bg-accent transition-colors outline-none">
  <MoreHorizontal className="h-4 w-4" />
</DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleRole(u)}>
                    {u.role === 'admin'
                      ? <><ShieldOff className="mr-2 h-4 w-4" /> Remove Admin</>
                      : <><ShieldCheck className="mr-2 h-4 w-4" /> Make Admin</>}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className={u.is_active ? 'text-destructive' : ''}
                    onClick={() => handleActive(u)}
                  >
                    {u.is_active
                      ? <><UserX className="mr-2 h-4 w-4" /> Suspend</>
                      : <><UserCheck className="mr-2 h-4 w-4" /> Reactivate</>}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </td>
          </tr>
        ))}
      />

      {/* Pagination — only when not searching */}
      {!query && (
        <div className="flex justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page === 0} onClick={() => setPage(p => p - 1)}>Previous</Button>
          <Button variant="outline" size="sm" disabled={(users?.length ?? 0) < 20} onClick={() => setPage(p => p + 1)}>Next</Button>
        </div>
      )}
    </div>
  )
}