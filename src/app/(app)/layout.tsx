import { Navbar } from '@/components/navigation/navbar'
import { OnboardingGuard } from '@/components/guards/onboarding-guard'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <OnboardingGuard>
      <div className="min-h-screen bg-background">
        <Navbar />
        <main className="max-w-6xl mx-auto px-4 py-6 pb-20 md:pb-6">
          {children}
        </main>
      </div>
    </OnboardingGuard>
  )
}