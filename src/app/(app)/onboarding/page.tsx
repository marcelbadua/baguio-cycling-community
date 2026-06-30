// ============================================================
// src/app/(app)/onboarding/page.tsx
// Shown after first sign-up via OAuth (Google/Facebook)
// when profile is incomplete
// ============================================================
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/features/auth/hooks'
import { useUpdateProfile } from '@/features/profile/hooks'
import { CyclistTypeSelector } from '@/features/profile/components/cyclist-type-selector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react'
import type { CyclistType } from '@/types/database'

const STEPS = ['Welcome', 'Your Info', 'Cyclist Type', 'Done']

const step1Schema = z.object({
  username:     z.string().min(3).regex(/^[a-z0-9_]+$/, 'Lowercase, numbers, underscores only'),
  first_name:   z.string().min(1, 'Required'),
  last_name:    z.string().min(1, 'Required'),
  display_name: z.string().optional(),
  barangay:     z.string().optional(),
  bio:          z.string().max(300).optional(),
})
type Step1Data = z.infer<typeof step1Schema>

const BARANGAY_SAMPLE = [
  'Session Road Area', 'Burnham-Legarda', 'Aurora Hill Proper', 'Irisan',
  'Bakakeng Central', 'Camp 7', 'Trancoville', 'Engineers Hill',
  'Pacdal', 'Mines View Park', 'Upper Quezon Hill Subdiv.', 'Kias',
]

export default function OnboardingPage() {
  const { user, profile } = useAuth()
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [cyclistTypes, setCyclistTypes] = useState<CyclistType[]>([])
  const updateProfile = useUpdateProfile(user?.id ?? '')

  const { register, handleSubmit, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      username:     profile?.username ?? '',
      first_name:   profile?.first_name ?? '',
      last_name:    profile?.last_name ?? '',
      display_name: profile?.display_name ?? '',
    },
  })

  const onStep1Submit = (data: Step1Data) => {
    updateProfile.mutate(data)
    setStep(2)
  }

  const finish = async () => {
    await updateProfile.mutateAsync({ cyclist_types: cyclistTypes })
    router.push('/feed')
  }

  const progress = ((step + 1) / STEPS.length) * 100

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-4xl">🚵</p>
          <h1 className="text-2xl font-bold">Welcome to BCC!</h1>
          <p className="text-muted-foreground text-sm">Let's set up your profile — it only takes a minute.</p>
        </div>

        {/* Progress */}
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            {STEPS.map((s, i) => (
              <span key={s} className={i === step ? 'text-primary font-medium' : ''}>{s}</span>
            ))}
          </div>
          <Progress value={progress} className="h-1.5" />
        </div>

        {/* Step 0 — Welcome */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Welcome to the Community 👋</CardTitle>
              <CardDescription>
                Baguio Cycling Community is a hub for local cyclists — find events, report hazards,
                and help recover stolen bikes.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="text-sm text-muted-foreground space-y-2">
                <li>🗓️ <strong>Discover</strong> local rides and events</li>
                <li>📢 <strong>Share</strong> cycling posts and updates</li>
                <li>⚠️ <strong>Report</strong> road hazards to keep everyone safe</li>
                <li>🔍 <strong>Help</strong> recover missing bikes</li>
              </ul>
              <Button className="w-full" onClick={() => setStep(1)}>
                Get Started <ChevronRight className="ml-1 h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Step 1 — Your Info */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Info</CardTitle>
              <CardDescription>This is how other cyclists will find you.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onStep1Submit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <Label>First Name *</Label>
                    <Input {...register('first_name')} />
                    {errors.first_name && <p className="text-xs text-destructive">{errors.first_name.message}</p>}
                  </div>
                  <div className="space-y-1">
                    <Label>Last Name *</Label>
                    <Input {...register('last_name')} />
                    {errors.last_name && <p className="text-xs text-destructive">{errors.last_name.message}</p>}
                  </div>
                </div>
                <div className="space-y-1">
                  <Label>Username *</Label>
                  <div className="flex items-center">
                    <span className="text-sm text-muted-foreground bg-muted border border-r-0 rounded-l-md px-3 h-9 flex items-center">@</span>
                    <Input {...register('username')} className="rounded-l-none" />
                  </div>
                  {errors.username && <p className="text-xs text-destructive">{errors.username.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Barangay <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <select
                    {...register('barangay')}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                  >
                    <option value="">Select barangay...</option>
                    {BARANGAY_SAMPLE.map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="space-y-1">
                  <Label>Bio <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Textarea {...register('bio')} placeholder="Tell the community about yourself..." rows={2} className="resize-none" />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(0)} className="flex-1">
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Next <ChevronRight className="ml-1 h-4 w-4" /></>}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Cyclist Type */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>What kind of cyclist are you?</CardTitle>
              <CardDescription>Select all that apply. You can change this later.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CyclistTypeSelector value={cyclistTypes} onChange={setCyclistTypes} />
              <div className="flex gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setStep(1)} className="flex-1">
                  <ChevronLeft className="mr-1 h-4 w-4" /> Back
                </Button>
                <Button className="flex-1" onClick={() => setStep(3)}>
                  Next <ChevronRight className="ml-1 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 — Done */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>You're all set! 🎉</CardTitle>
              <CardDescription>
                Your profile is ready. Head to the feed to explore the community.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✅ Add a profile photo in Settings</li>
                <li>✅ Register your bikes in My Bikes</li>
                <li>✅ Join or create a cycling event</li>
              </ul>
              <Button className="w-full mt-2" onClick={finish} disabled={updateProfile.isPending}>
                {updateProfile.isPending
                  ? <Loader2 className="h-4 w-4 animate-spin" />
                  : 'Go to Community Feed 🚴'}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}