// ============================================================
// src/features/feed/components/post-composer.tsx
// ============================================================
'use client'

import { useRef, useState } from 'react'
import { useAuth } from '@/features/auth/hooks'
import { useCreatePost, useUploadPostPhotos } from '@/features/feed/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { ImagePlus, X, Loader2, Send } from 'lucide-react'
import { getInitials, getDisplayName } from '@/lib/utils'

const MAX_PHOTOS = 4

export function PostComposer() {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const fileRef = useRef<HTMLInputElement>(null)
  const [content, setContent] = useState('')
  const [photoFiles, setPhotoFiles] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const [focused, setFocused] = useState(false)

  const createPost = useCreatePost(user?.id ?? '')
  const uploadPhotos = useUploadPostPhotos()

  const isPending = createPost.isPending || uploadPhotos.isPending

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []).slice(0, MAX_PHOTOS - photoFiles.length)
    const newPreviews = files.map(f => URL.createObjectURL(f))
    setPhotoFiles(prev => [...prev, ...files])
    setPreviews(prev => [...prev, ...newPreviews])
    if (fileRef.current) fileRef.current.value = ''
  }

  const removePhoto = (idx: number) => {
    setPhotoFiles(prev => prev.filter((_, i) => i !== idx))
    setPreviews(prev => prev.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    if (!content.trim() && photoFiles.length === 0) return
    if (!user) return

    let photoUrls: string[] = []
    if (photoFiles.length > 0) {
      const result = await uploadPhotos.mutateAsync({ userId: user.id, files: photoFiles })
      photoUrls = result
    }

    const result = await createPost.mutateAsync({
      author_id: user.id,
      content: content.trim() || undefined,
      photos: photoUrls,
      post_type: photoUrls.length > 0 ? 'photo' : 'text',
    })

    if (result.error) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' })
      return
    }

    setContent('')
    setPhotoFiles([])
    setPreviews([])
    setFocused(false)
    toast({ title: 'Post shared!' })
  }

  const initials = getInitials(profile?.first_name, profile?.last_name)
  const displayName = profile ? getDisplayName(profile) : ''
  const canPost = (content.trim().length > 0 || photoFiles.length > 0) && !isPending

  return (
    <Card>
      <CardContent className="pt-4 space-y-3">
        <div className="flex gap-3">
          <Avatar className="h-9 w-9 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? ''} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <Textarea
            placeholder={`What's on your mind, ${profile?.first_name ?? 'cyclist'}?`}
            value={content}
            onChange={e => setContent(e.target.value)}
            onFocus={() => setFocused(true)}
            rows={focused ? 3 : 1}
            className="resize-none border-0 shadow-none focus-visible:ring-0 p-0 text-sm p-2"
          />
        </div>

        {/* Photo previews */}
        {previews.length > 0 && (
          <div className={`grid gap-2 ${previews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
            {previews.map((src, i) => (
              <div key={i} className="relative rounded-lg overflow-hidden aspect-video bg-muted">
                <img src={src} alt="" className="w-full h-full object-cover" />
                <button
                  onClick={() => removePhoto(i)}
                  className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-0.5 hover:bg-black/80"
                >
                  <X className="h-3.5 w-3.5 text-white" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Actions row */}
        {(focused || content || previews.length > 0) && (
          <div className="flex items-center justify-between pt-1 border-t">
            <div className="flex items-center gap-1">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="gap-1.5 text-muted-foreground"
                onClick={() => fileRef.current?.click()}
                disabled={photoFiles.length >= MAX_PHOTOS || isPending}
              >
                <ImagePlus className="h-4 w-4" />
                <span className="text-xs">Photo</span>
              </Button>
              {photoFiles.length > 0 && (
                <span className="text-xs text-muted-foreground">{photoFiles.length}/{MAX_PHOTOS}</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  setContent(''); setPhotoFiles([]); setPreviews([]); setFocused(false)
                }}
                disabled={isPending}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleSubmit} disabled={!canPost} className="gap-1.5">
                {isPending
                  ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  : <Send className="h-3.5 w-3.5" />}
                Post
              </Button>
            </div>
          </div>
        )}

        <input
          ref={fileRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          className="hidden"
          onChange={handlePhotoSelect}
        />
      </CardContent>
    </Card>
  )
}