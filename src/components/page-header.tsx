
// ============================================================
// src/components/page-header.tsx — Consistent page headers
// ============================================================
import { cn } from '@/lib/utils'

interface Props {
  title:       string
  description?: string
  action?:      React.ReactNode
  icon?:        React.ReactNode
  className?:   string
}

export function PageHeader({ title, description, action, icon, className }: Props) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          {icon}
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground text-sm mt-1">{description}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}