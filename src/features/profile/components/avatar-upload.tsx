
// ============================================================
// src/features/profile/components/avatar-upload.tsx
// ============================================================
'use client'

import { useRef, useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Camera, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Props {
  currentUrl?: string | null
  initials: string
  onUpload: (file: File) => Promise<void>
  isPending?: boolean
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'h-16 w-16',
  md: 'h-24 w-24',
  lg: 'h-32 w-32',
}

export function AvatarUpload({ currentUrl, initials, onUpload, isPending, size = 'lg' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    await onUpload(file)
  }

  return (
    <div className="relative inline-block">
      <Avatar className={cn(sizeMap[size], 'ring-4 ring-background')}>
        <AvatarImage src={preview ?? currentUrl ?? ''} />
        <AvatarFallback className="text-xl">{initials}</AvatarFallback>
      </Avatar>
      <Button
        type="button"
        size="icon"
        variant="secondary"
        className="absolute bottom-0 right-0 h-7 w-7 rounded-full"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
      >
        {isPending
          ? <Loader2 className="h-3 w-3 animate-spin" />
          : <Camera className="h-3 w-3" />}
      </Button>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}