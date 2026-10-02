import Link from 'next/link'

import type {PostCard} from '@/lib/sanity/types'
import {cn, formatDate, formatShortDate, readingTime} from '@/lib/utils'

/** "GEOPOLITICS · 16 SEP · 7 MIN" in mono. Section links to its page. */
export function StoryMeta({
  post,
  showSection = true,
  long = false,
  className,
}: {
  post: PostCard
  showSection?: boolean
  long?: boolean
  className?: string
}) {
  const minutes = readingTime(post.chars)
  return (
    <p className={cn('meta flex flex-wrap items-center gap-x-2 gap-y-1', className)}>
      {showSection && post.section && (
        <>
          <Link href={`/${post.section.slug}`} className="relative z-10 text-ink transition-colors hover:text-signal">
            {post.section.title}
          </Link>
          <span aria-hidden="true">·</span>
        </>
      )}
      <time dateTime={post.publishedAt}>{long ? formatDate(post.publishedAt) : formatShortDate(post.publishedAt)}</time>
      {minutes && (
        <>
          <span aria-hidden="true">·</span>
          <span>{minutes} min</span>
        </>
      )}
    </p>
  )
}

export function Byline({post, className}: {post: PostCard; className?: string}) {
  if (!post.author) return null
  return (
    <p className={cn('text-[13px] text-muted', className)}>
      By{' '}
      <Link href={`/authors/${post.author.slug}`} className="relative z-10 text-ink-2 transition-colors hover:text-ink">
        {post.author.name}
      </Link>
    </p>
  )
}
