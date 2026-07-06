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
import { useUpdateProfile, useUploadAvatar } from '@/features/profile/hooks'
import { CyclistTypeSelector } from '@/features/profile/components/cyclist-type-selector'
import { AvatarUpload } from '@/features/profile/components/avatar-upload'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react'
import { getInitials } from '@/lib/utils'
import type { CyclistType } from '@/types/models'

import Link from "next/link";
import { SITE } from "@/lib/site";

const STEPS = ['Welcome', 'Your Info', 'Cyclist Type', 'Usual Route', 'Photo & Socials', 'Done']

const step1Schema = z.object({
  username:     z.string().min(3).regex(/^[a-z0-9_]+$/, 'Lowercase, numbers, underscores only'),
  first_name:   z.string().min(1, 'Required'),
  last_name:    z.string().min(1, 'Required'),
  display_name: z.string().optional(),
  barangay:     z.string().optional(),
  bio:          z.string().max(300).optional(),
})
type Step1Data = z.infer<typeof step1Schema>

const routeSchema = z.object({
  daily_route: z.string().max(300).optional(),
})
type RouteData = z.infer<typeof routeSchema>

const step4Schema = z.object({
  facebook_url:  z.string().url('Enter a full URL').optional().or(z.literal('')),
  instagram_url: z.string().url('Enter a full URL').optional().or(z.literal('')),
  strava_url:    z.string().url('Enter a full URL').optional().or(z.literal('')),
})
type Step4Data = z.infer<typeof step4Schema>

const BARANGAY_SAMPLE = [
  'Session Road Area', 'Burnham-Legarda', 'Aurora Hill Proper', 'Irisan',
  'Bakakeng Central', 'Camp 7', 'Trancoville', 'Engineers Hill',
  'Pacdal', 'Mines View Park', 'Upper Quezon Hill Subdiv.', 'Kias',
]

export default function OnboardingPage() {
  const { user, profile, refetchProfile } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState(0)
  const [cyclistTypes, setCyclistTypes] = useState<CyclistType[]>([])
  const updateProfile = useUpdateProfile(user?.id ?? '')
  const uploadAvatar = useUploadAvatar(user?.id ?? '')

  const { register, handleSubmit, formState: { errors } } = useForm<Step1Data>({
    resolver: zodResolver(step1Schema),
    defaultValues: {
      username:     profile?.username ?? '',
      first_name:   profile?.first_name ?? '',
      last_name:    profile?.last_name ?? '',
      display_name: profile?.display_name ?? '',
    },
  })

  const {
    register: registerRoute,
    handleSubmit: handleRouteSubmit,
  } = useForm<RouteData>({
    resolver: zodResolver(routeSchema),
    defaultValues: {
      daily_route: profile?.daily_route ?? '',
    },
  })

  const {
    register: registerStep4,
    handleSubmit: handleStep4Submit,
    formState: { errors: step4Errors },
  } = useForm<Step4Data>({
    resolver: zodResolver(step4Schema),
    defaultValues: {
      facebook_url:  profile?.facebook_url ?? '',
      instagram_url: profile?.instagram_url ?? '',
      strava_url:    profile?.strava_url ?? '',
    },
  })

  const onStep1Submit = async (data: Step1Data) => {
    const result = await updateProfile.mutateAsync(data)
    if (result.error) {
      toast({ title: 'Could not save', description: result.error, variant: 'destructive' })
      return
    }
    setStep(2)
  }

  const onRouteSubmit = async (data: RouteData) => {
    const result = await updateProfile.mutateAsync({ daily_route: data.daily_route || null })
    if (result.error) {
      toast({ title: 'Could not save', description: result.error, variant: 'destructive' })
      return
    }
    setStep(4)
  }

  const onStep4Submit = async (data: Step4Data) => {
    const result = await updateProfile.mutateAsync({
      facebook_url:  data.facebook_url || null,
      instagram_url: data.instagram_url || null,
      strava_url:    data.strava_url || null,
    })
    if (result.error) {
      toast({ title: 'Could not save', description: result.error, variant: 'destructive' })
      return
    }
    setStep(5)
  }

  const finish = async () => {
    const result = await updateProfile.mutateAsync({ cyclist_types: cyclistTypes, onboarding_completed: true })
    if (result.error) {
      toast({
        title: 'Could not finish onboarding',
        description: result.error,
        variant: 'destructive',
      })
      return
    }
    await refetchProfile()
    router.push('/feed')
  }

  const progress = ((step + 1) / STEPS.length) * 100
  const initials = getInitials(profile?.first_name, profile?.last_name)

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg space-y-6">
        {/* Header */}
        <div className="text-center space-y-1">
          <p className="text-4xl">🚵</p>
          <h1 className="text-2xl font-bold">Welcome to {SITE.name}!</h1>
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

        {/* Step 3 — Usual Route */}
        {step === 3 && (
          <Card>
            <CardHeader>
              <CardTitle>What's your usual route?</CardTitle>
              <CardDescription>
                Tell the community the route you ride most often — helps others recognize you out on the road.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleRouteSubmit(onRouteSubmit)} className="space-y-4">
                <div className="space-y-1">
                  <Label>Typical Daily Route <span className="text-muted-foreground text-xs">(optional)</span></Label>
                  <Textarea
                    {...registerRoute('daily_route')}
                    placeholder="e.g. Session Road to Camp John Hay loop"
                    rows={3}
                    className="resize-none"
                  />
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(2)} className="flex-1">
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Next <ChevronRight className="ml-1 h-4 w-4" /></>}
                  </Button>
                </div>
                <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => setStep(4)}>
                  Skip this step
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 4 — Photo & Socials */}
        {step === 4 && (
          <Card>
            <CardHeader>
              <CardTitle>Add a photo & socials</CardTitle>
              <CardDescription>All optional — you can skip and add these later in Settings.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleStep4Submit(onStep4Submit)} className="space-y-4">
                <div className="flex justify-center py-2">
                  <AvatarUpload
                    currentUrl={profile?.avatar_url}
                    initials={initials}
                    isPending={uploadAvatar.isPending}
                    onUpload={async (file) => {
                      const result = await uploadAvatar.mutateAsync(file)
                      if (result.error) {
                        toast({ title: 'Photo upload failed', description: result.error, variant: 'destructive' })
                      }
                    }}
                  />
                </div>
                <div className="space-y-1">
                  <Label>Facebook</Label>
                  <Input {...registerStep4('facebook_url')} placeholder="https://facebook.com/yourname" />
                  {step4Errors.facebook_url && <p className="text-xs text-destructive">{step4Errors.facebook_url.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Instagram</Label>
                  <Input {...registerStep4('instagram_url')} placeholder="https://instagram.com/yourname" />
                  {step4Errors.instagram_url && <p className="text-xs text-destructive">{step4Errors.instagram_url.message}</p>}
                </div>
                <div className="space-y-1">
                  <Label>Strava</Label>
                  <Input {...registerStep4('strava_url')} placeholder="https://strava.com/athletes/..." />
                  {step4Errors.strava_url && <p className="text-xs text-destructive">{step4Errors.strava_url.message}</p>}
                </div>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setStep(3)} className="flex-1">
                    <ChevronLeft className="mr-1 h-4 w-4" /> Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={updateProfile.isPending}>
                    {updateProfile.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Next <ChevronRight className="ml-1 h-4 w-4" /></>}
                  </Button>
                </div>
                <Button type="button" variant="ghost" size="sm" className="w-full" onClick={() => setStep(5)}>
                  Skip this step
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Step 5 — Done */}
        {step === 5 && (
          <Card>
            <CardHeader>
              <CardTitle>You're all set! 🎉</CardTitle>
              <CardDescription>
                Your profile is ready. Head to the feed to explore the community.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>✅ Register your bikes in My Bikes</li>
                <li>✅ Join or create a cycling event</li>
                <li>✅ Explore the community feed</li>
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
