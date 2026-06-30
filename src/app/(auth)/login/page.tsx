'use client'
import { useTransition, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { login, signInWithGoogle, signInWithFacebook } from '@/features/auth/actions'
import { Loader2 } from 'lucide-react'

const schema = z.object({ email: z.string().email(), password: z.string().min(1) })
type F = z.infer<typeof schema>

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const { register, handleSubmit, formState: { errors } } = useForm<F>({ resolver: zodResolver(schema) })

  const onSubmit = (data: F) => {
    setError(null)
    startTransition(async () => {
      const result = await login({ email: data.email, password: data.password })
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <Card>
      <CardHeader><CardTitle>Sign In</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {error && <p className="text-sm text-destructive">{error}</p>}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1">
            <Label>Email</Label><Input type="email" {...register('email')} />
            {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
          </div>
          <div className="space-y-1">
            <div className="flex justify-between"><Label>Password</Label><Link href="/forgot-password" className="text-xs text-primary hover:underline">Forgot?</Link></div>
            <Input type="password" {...register('password')} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Sign In'}</Button>
        </form>
        <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div><div className="relative flex justify-center text-xs uppercase"><span className="bg-background px-2 text-muted-foreground">Or</span></div></div>
        <div className="grid grid-cols-2 gap-3">
          <form action={signInWithGoogle}><Button variant="outline" className="w-full" type="submit">Google</Button></form>
          <form action={signInWithFacebook}><Button variant="outline" className="w-full" type="submit">Facebook</Button></form>
        </div>
        <p className="text-center text-sm text-muted-foreground">No account? <Link href="/signup" className="text-primary hover:underline">Sign up</Link></p>
      </CardContent>
    </Card>
  )
}