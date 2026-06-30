// ============================================================
// src/components/empty-state.tsx — Generic empty state
// ============================================================
import { Button } from '@/components/ui/button'

interface EmptyProps {
  emoji:        string
  title:        string
  description?: string
  action?:      { label: string; onClick: () => void }
}

export function EmptyState({ emoji, title, description, action }: EmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
      <p className="text-5xl">{emoji}</p>
      <div>
        <h3 className="font-semibold text-lg">{title}</h3>
        {description && (
          <p className="text-muted-foreground text-sm max-w-xs mt-1">{description}</p>
        )}
      </div>
      {action && (
        <Button onClick={action.onClick}>{action.label}</Button>
      )}
    </div>
  )
}