

// ============================================================
// src/features/profile/components/cover-upload.tsx
// ============================================================
'use client'

import { useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Camera, Loader2 } from 'lucide-react'

interface Props {
  currentUrl?: string | null
  onUpload: (file: File) => Promise<void>
  isPending?: boolean
}

export function CoverUpload({ currentUrl, onUpload, isPending }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const bg = preview ?? currentUrl

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setPreview(URL.createObjectURL(file))
    await onUpload(file)
  }

  return (
    <div
      className="relative w-full h-40 md:h-56 bg-muted rounded-t-xl overflow-hidden"
      style={bg ? { backgroundImage: `url(${bg})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
    >
      {!bg && (
        <div className="absolute inset-0 flex items-center justify-center text-muted-foreground text-sm">
          No cover photo
        </div>
      )}
      <Button
        type="button"
        size="sm"
        variant="secondary"
        className="absolute bottom-3 right-3 gap-1.5"
        onClick={() => inputRef.current?.click()}
        disabled={isPending}
      >
        {isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Camera className="h-3 w-3" />}
        {isPending ? 'Uploading...' : 'Change Cover'}
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