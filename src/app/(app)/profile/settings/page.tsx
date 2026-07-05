'use client'

import { useEffect, useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useAuth } from '@/features/auth/hooks'
import { useUpdateProfile, useUploadAvatar, useUploadCover } from '@/features/profile/hooks'
import { CyclistTypeSelector } from '@/features/profile/components/cyclist-type-selector'
import { AvatarUpload } from '@/features/profile/components/avatar-upload'
import { CoverUpload } from '@/features/profile/components/cover-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { LoadingSpinner } from '@/components/loading-spinner'
import { Loader2 } from 'lucide-react'
import type { CyclistType } from '@/types/database'

import { BARANGAYS } from "@/lib/constants/barangays"

const settingsSchema = z.object({
  first_name:    z.string().min(1, 'Required'),
  last_name:     z.string().min(1, 'Required'),
  display_name:  z.string().optional(),
  username:      z.string().min(3, 'At least 3 characters').regex(/^[a-z0-9_]+$/, 'Lowercase letters, numbers, underscores only'),
  bio:           z.string().max(300, 'Max 300 characters').optional(),
  barangay:      z.string().optional(),
  facebook_url:  z.string().url('Must be a valid URL').optional().or(z.literal('')),
  instagram_url: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  strava_url:    z.string().url('Must be a valid URL').optional().or(z.literal('')),
  daily_route:   z.string().optional(),
})

type FormData = z.infer<typeof settingsSchema>

export default function ProfileSettingsPage() {
  const { user, profile, loading } = useAuth()
  const { toast } = useToast()
  const [cyclistTypes, setCyclistTypes] = useState<CyclistType[]>([])

  const updateProfile = useUpdateProfile(user?.id ?? '')
  const uploadAvatar  = useUploadAvatar(user?.id ?? '')
  const uploadCover   = useUploadCover(user?.id ?? '')

  const { register, handleSubmit, reset, control, formState: { errors } } =
    useForm<FormData>({ resolver: zodResolver(settingsSchema) })

  useEffect(() => {
    if (profile) {
      reset({
        first_name:    profile.first_name ?? '',
        last_name:     profile.last_name ?? '',
        display_name:  profile.display_name ?? '',
        username:      profile.username,
        bio:           profile.bio ?? '',
        barangay:      profile.barangay ?? '',
        facebook_url:  profile.facebook_url ?? '',
        instagram_url: profile.instagram_url ?? '',
        strava_url:    profile.strava_url ?? '',
        daily_route:   profile.daily_route ?? '',
      })
      setCyclistTypes(profile.cyclist_types ?? [])
    }
  }, [profile, reset])

  const onSubmit = async (data: FormData) => {
    const result = await updateProfile.mutateAsync({ ...data, cyclist_types: cyclistTypes })
    if (result?.error) toast({ title: 'Error', description: result.error, variant: 'destructive' })
    else toast({ title: 'Profile updated!' })
  }

  const initials = [profile?.first_name?.[0], profile?.last_name?.[0]].filter(Boolean).join('').toUpperCase() || '?'

  if (loading) return <LoadingSpinner className="h-48 py-0" />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Profile Settings</h1>
        <p className="text-muted-foreground text-sm">Manage your public profile information.</p>
      </div>

      {/* Photos */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile Photos</CardTitle>
          <CardDescription>Your cover photo and profile picture.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-2 block">Cover Photo</Label>
            <CoverUpload
              currentUrl={profile?.cover_url}
              onUpload={async (file) => { await uploadCover.mutateAsync(file) }}
              isPending={uploadCover.isPending}
            />
          </div>
          <div>
            <Label className="text-sm font-medium mb-2 block">Profile Picture</Label>
            <AvatarUpload
              currentUrl={profile?.avatar_url}
              initials={initials}
              onUpload={async (file) => { await uploadAvatar.mutateAsync(file) }}
              isPending={uploadAvatar.isPending}
              size="lg"
            />
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Basic Info */}
        <Card>
          <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
              <Label>Display Name</Label>
              <Input {...register('display_name')} placeholder="How you want to be called" />
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
              <Label>Bio</Label>
              <Textarea {...register('bio')} placeholder="Tell the community about yourself..." className="resize-none" rows={3} />
              {errors.bio && <p className="text-xs text-destructive">{errors.bio.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Barangay</Label>
              <Controller name="barangay" control={control} render={({ field }) => (
                <select {...field} className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
                  <option value="" className="bg-background text-foreground">Select barangay...</option>
                  {BARANGAYS.map(b => <option key={b} value={b}>{b}</option>)}
                </select>
              )} />
            </div>
          </CardContent>
        </Card>

        {/* Cyclist Types */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Cyclist Type</CardTitle>
            <CardDescription>Select all that apply.</CardDescription>
          </CardHeader>
          <CardContent>
            <CyclistTypeSelector value={cyclistTypes} onChange={setCyclistTypes} />
          </CardContent>
        </Card>

        {/* Daily Route */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Typical Daily Route</CardTitle>
            <CardDescription>Describe your usual cycling route in Baguio.</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea {...register('daily_route')} placeholder="e.g. Burnham Park → Session Road → Mines View → Camp John Hay → back" rows={3} className="resize-none" />
          </CardContent>
        </Card>

        {/* Social Links */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Social Links</CardTitle>
            <CardDescription>Connect your cycling profiles.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Facebook URL</Label>
              <Input {...register('facebook_url')} placeholder="https://facebook.com/yourprofile" />
              {errors.facebook_url && <p className="text-xs text-destructive">{errors.facebook_url.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Instagram URL</Label>
              <Input {...register('instagram_url')} placeholder="https://instagram.com/yourhandle" />
              {errors.instagram_url && <p className="text-xs text-destructive">{errors.instagram_url.message}</p>}
            </div>
            <div className="space-y-1">
              <Label>Strava URL</Label>
              <Input {...register('strava_url')} placeholder="https://strava.com/athletes/yourprofile" />
              {errors.strava_url && <p className="text-xs text-destructive">{errors.strava_url.message}</p>}
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateProfile.isPending}>
            {updateProfile.isPending ? <><Loader2 className="h-4 w-4 animate-spin mr-2" />Saving...</> : 'Save Changes'}
          </Button>
        </div>
      </form>

      <Separator />

      {/* Account */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account</CardTitle>
          <CardDescription>Email and password settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium">Email Address</p>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium">Password</p>
              <p className="text-sm text-muted-foreground">Change your account password.</p>
            </div>
            <Button variant="outline" size="sm" asChild>
              <a href="/forgot-password">Reset Password</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
