'use client'

import { useRef, useState } from 'react'
import { useAuth } from '@/features/auth/hooks'
import { useToast } from '@/components/ui/use-toast'
import { useCreatePost, useUploadPostPhotos } from '@/features/feed/hooks'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Image, X, Loader2 } from 'lucide-react'
import { getInitials } from '@/lib/utils'

// ── Post Composer ─────────────────────────────────────────────
export function PostComposer() {
  const { user, profile } = useAuth()
  const { toast } = useToast()
  const [content, setContent] = useState('')
  const [focused, setFocused] = useState(false)
  const [photos, setPhotos] = useState<File[]>([])
  const [previews, setPreviews] = useState<string[]>([])
  const fileRef = useRef<HTMLInputElement>(null)
  const createPost = useCreatePost(user?.id ?? '')
  const uploadPhotos = useUploadPostPhotos()
  const isPending = createPost.isPending || uploadPhotos.isPending
  const initials = getInitials(profile?.first_name, profile?.last_name)

  const handleSubmit = async () => {
    if (!content.trim() && photos.length === 0 || !user) return
    let photoUrls: string[] = []
    if (photos.length > 0) photoUrls = await uploadPhotos.mutateAsync({ userId: user.id, files: photos })
    const result = await createPost.mutateAsync({
      author_id: user.id, content: content.trim() || undefined,
      photos: photoUrls, post_type: photoUrls.length > 0 ? 'photo' : 'text',
    })
    if (result.error) { toast({ title: 'Error', description: result.error, variant: 'destructive' }); return }
    setContent(''); setPhotos([]); setPreviews([]); setFocused(false)
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex gap-3 items-center">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={profile?.avatar_url ?? ''} />
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <button
            onClick={() => setFocused(true)}
            className="flex-1 text-left px-4 py-2.5 rounded-full bg-muted hover:bg-muted/80 text-muted-foreground text-sm transition-colors"
          >
            What's on your mind?
          </button>
        </div>

        {focused && (
          <div className="space-y-3">
            <textarea
              autoFocus
              value={content}
              onChange={e => setContent(e.target.value)}
              placeholder="What's on your mind?"
              rows={3}
              className="w-full resize-none border-0 bg-transparent text-sm focus:outline-none placeholder:text-muted-foreground"
            />
            {previews.length > 0 && (
              <div className={`grid gap-2 ${previews.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
                {previews.map((src, i) => (
                  <div key={i} className="relative rounded-lg overflow-hidden aspect-video bg-muted">
                    <img src={src} className="w-full h-full object-cover" alt="" />
                    <button onClick={() => { setPhotos(p => p.filter((_, j) => j !== i)); setPreviews(p => p.filter((_, j) => j !== i)) }}
                      className="absolute top-1.5 right-1.5 bg-black/60 rounded-full p-0.5">
                      <X className="h-3.5 w-3.5 text-white" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between border-t pt-3">
          <div className="flex gap-1">
            <button onClick={() => fileRef.current?.click()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-muted text-muted-foreground text-xs font-medium transition-colors">
              <Image className="h-4 w-4 text-green-500" /> Photo
            </button>
          </div>
          {focused && (
            <Button size="sm" onClick={handleSubmit} disabled={(!content.trim() && photos.length === 0) || isPending} className="rounded-full px-5">
              {isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : 'Post'}
            </Button>
          )}
        </div>

        <input ref={fileRef} type="file" accept="image/*" multiple className="hidden"
          onChange={e => {
            const files = Array.from(e.target.files ?? []).slice(0, 4 - photos.length)
            setPhotos(p => [...p, ...files]); setPreviews(p => [...p, ...files.map(f => URL.createObjectURL(f))])
            setFocused(true)
          }} />
      </CardContent>
    </Card>
  )
}