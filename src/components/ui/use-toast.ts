

// ============================================================
// STEP 3: src/components/ui/use-toast.ts
// Replace entire file contents with this shim — keeps the
// SAME `useToast()` API you already used everywhere
// (e.g. `toast({ title, description, variant })`)
// so you don't have to touch any other file in the project.
// ============================================================
import { toast as sonnerToast } from "sonner"

interface ToastOptions {
  title?: string
  description?: string
  variant?: "default" | "destructive"
}

function toast({ title, description, variant }: ToastOptions) {
  if (variant === "destructive") {
    return sonnerToast.error(title, { description })
  }
  return sonnerToast(title, { description })
}

export function useToast() {
  return { toast }
}

export { toast }