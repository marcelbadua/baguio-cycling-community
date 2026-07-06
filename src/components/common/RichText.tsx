import Linkify from 'linkify-react'
import Link from 'next/link'

interface Props {
  text: string
}

export function RichText({ text }: Props) {
  const hashtagRegex = /#([\p{L}\p{N}_-]+)/gu

  const parts = text.split(hashtagRegex)

  return (
    <Linkify
      options={{
        target: '_blank',
        rel: 'noopener noreferrer',
        className: 'text-primary hover:underline',
      }}
    >
      {parts.map((part, index) => {
        // odd indexes are hashtags
        if (index % 2 === 1) {
          return (
            <Link 
              key={index}
              href={`/hashtags/${encodeURIComponent(part)}`}
              className="text-primary font-medium hover:underline"
            >
              #{part}
            </Link>
          )
        }

        return part
      })}
    </Linkify>
  )
}