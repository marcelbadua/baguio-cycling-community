// ============================================================
// src/app/(auth)/layout.tsx
// ============================================================
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary">Baguio Cycling Community</h1>
          <p className="text-muted-foreground text-sm mt-1">Share rides, discover events, report road hazards, post missing bike alerts, and connect with cyclists across Baguio City.</p>
        </div>
        {children}
      </div>
    </div>
  )
}

