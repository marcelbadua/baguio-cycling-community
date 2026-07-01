'use server'
import { createServerSupabaseClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'

const signUpSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
})
const loginSchema = z.object({ email: z.string().email(), password: z.string().min(1) })

export async function signUp(input: { email: string; password: string; firstName: string; lastName: string }) {
  console.log('signUp received:', input) // debug — remove once confirmed working
  const parsed = signUpSchema.safeParse(input)
  if (!parsed.success) {
    console.log('signUp VALIDATION FAILED:', parsed.error.errors)
    return { error: parsed.error.errors[0].message }
  }

  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        given_name: parsed.data.firstName,
        family_name: parsed.data.lastName,
        full_name: `${parsed.data.firstName} ${parsed.data.lastName}`,
      },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  console.log('SUPABASE SIGNUP DATA:', JSON.stringify(data, null, 2))
  console.log('SUPABASE SIGNUP ERROR:', error)

  if (error) return { error: error.message }
  return { success: 'Check your email to confirm your account.' }
}

export async function login(input: { email: string; password: string }) {
  console.log('login received:', input) // debug — remove once confirmed working
  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  })

  if (error) return { error: error.message }
  redirect('/feed')
}

export async function signInWithGoogle() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  })
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
  if (data.url) redirect(data.url)
}

export async function signInWithFacebook() {
  const supabase = await createServerSupabaseClient()
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: { redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback` },
  })
  if (error) redirect(`/login?error=${encodeURIComponent(error.message)}`)
  if (data.url) redirect(data.url)
}

export async function forgotPassword(input: { email: string }) {
  if (!input.email) return { error: 'Email is required' }
  const supabase = await createServerSupabaseClient()
  const { error } = await supabase.auth.resetPasswordForEmail(input.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  })
  if (error) return { error: error.message }
  return { success: 'Password reset link sent to your email.' }
}

export async function signOut() {
  const supabase = await createServerSupabaseClient()
  await supabase.auth.signOut()
  redirect('/login')
}