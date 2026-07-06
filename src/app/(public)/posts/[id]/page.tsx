import type { Metadata } from 'next'
import PostPage from './PostPage'
import { createServerSupabaseClient } from '@/lib/supabase/server'

type Props = {
  params: Promise<{
    id: string
  }>
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { id } = await params

  const supabase = await createServerSupabaseClient()

  const { data: post } = await supabase
    .from('posts')
    .select(`
      *,
      author:profiles!author_id(
        id,
        username,
        display_name,
        first_name,
        last_name,
        avatar_url
      )
    `)
    .eq('id', id)
    .eq('is_deleted', false)
    .single()

  if (!post) {
    return {
      title: 'Post | Baguio Cycling Community',
      description: 'Community cycling post.',
    }
  }

  const author =
    post.author?.display_name ||
    post.author?.username ||
    'Cyclist'

  const description =
    post.content?.trim().slice(0, 160) ||
    'Shared a post on Baguio Cycling Community.'

  const image =
    Array.isArray(post.photos) && post.photos.length > 0
      ? post.photos[0]
      : '/og-default.jpg'

  return {
    title: `${author} • Baguio Cycling Community`,
    description,

    openGraph: {
      title: `${author} • Baguio Cycling Community`,
      description,
      url: `https://baguio-cycling-community.vercel.app/posts/${id}`,
      siteName: 'Baguio Cycling Community',
      type: 'article',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: `${author} • Baguio Cycling Community`,
      description,
      images: [image],
    },
  }
}

export default async function Page({
  params,
}: Props) {
  const { id } = await params

  return <PostPage id={id} />
}