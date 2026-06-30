// ============================================================
// src/components/admin/admin-table.tsx — Reusable table shell
// ============================================================
import { Skeleton } from '@/components/ui/skeleton'

interface Props {
  headers: string[]
  rows: React.ReactNode[]
  isLoading: boolean
  emptyMessage?: string
}

export function AdminTable({ headers, rows, isLoading, emptyMessage = 'No records found.' }: Props) {
  return (
    <div className="rounded-lg border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 border-b">
            <tr>
              {headers.map(h => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground whitespace-nowrap">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => (
                  <tr key={i} className="border-b">
                    {headers.map((_, j) => (
                      <td key={j} className="px-4 py-3">
                        <Skeleton className="h-4 w-full" />
                      </td>
                    ))}
                  </tr>
                ))
              : rows.length > 0
                ? rows
                : (
                  <tr>
                    <td colSpan={headers.length} className="px-4 py-10 text-center text-muted-foreground text-sm">
                      {emptyMessage}
                    </td>
                  </tr>
                )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
