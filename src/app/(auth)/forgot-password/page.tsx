'use client'
import { useTransition, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { forgotPassword } from '@/features/auth/actions'
import { Loader2 } from 'lucide-react'

export default function ForgotPasswordPage() {
  const [msg, setMsg] = useState<{ type: 'error' | 'success'; text: string } | null>(null)
  const [isPending, startTransition] = useTransition()
  const [email, setEmail] = useState('')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    startTransition(async () => {
      const result = await forgotPassword({ email })
      if (result?.error) setMsg({ type: 'error', text: result.error })
      if (result?.success) setMsg({ type: 'success', text: result.success })
    })
  }

  return (
    <Card>
      <CardHeader><CardTitle>Reset Password</CardTitle></CardHeader>
      <CardContent className="space-y-4">
        {msg && <p className={`text-sm ${msg.type === 'error' ? 'text-destructive' : 'text-green-600'}`}>{msg.text}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <Label htmlFor="email">Email address</Label>
            <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <Button type="submit" className="w-full" disabled={isPending}>{isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Send Reset Link'}</Button>
        </form>
        <p className="text-center text-sm"><Link href="/login" className="text-primary hover:underline">Back to login</Link></p>
      </CardContent>
    </Card>
  )
}