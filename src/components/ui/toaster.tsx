
// ============================================================
// STEP 2: src/components/ui/toaster.tsx
// Replace entire file contents with this — re-exports sonner
// so all your existing `import { useToast } from
// '@/components/ui/use-toast'` calls can be swapped easily.
// ============================================================
"use client"

import { Toaster as Sonner } from "sonner"

export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      toastOptions={{
        classNames: {
          toast:
            "bg-background text-foreground border border-border shadow-lg",
          description: "text-muted-foreground",
          actionButton: "bg-primary text-primary-foreground",
          cancelButton: "bg-muted text-muted-foreground",
        },
      }}
    />
  )
}