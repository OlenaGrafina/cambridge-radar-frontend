import Link from 'next/link'

import type {PostCard} from '@/lib/sanity/types'
import {cn, formatDate, formatShortDate, readingTime} from '@/lib/utils'

/**
 * "GEOPOLITICS · 16 SEP · 7 MIN" in mono, always on one line. The section
 * may truncate in a tight column; date and reading time never wrap or move.
 */
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
    <p className={cn('meta flex min-w-0 items-center gap-2 whitespace-nowrap', className)}>
      {showSection && post.section && (
        <>
          <Link
            href={`/${post.section.slug}`}
            className="relative z-10 min-w-0 truncate text-ink transition-colors hover:text-signal"
          >
            {post.section.title}
          </Link>
          <span aria-hidden="true">·</span>
        </>
      )}
      <span className="flex shrink-0 items-center gap-2">
        <time dateTime={post.publishedAt}>{long ? formatDate(post.publishedAt) : formatShortDate(post.publishedAt)}</time>
        {minutes && (
          <>
            <span aria-hidden="true">·</span>
            <span>{minutes} min</span>
          </>
        )}
      </span>
    </p>
  )
}

export function Byline({post, className}: {post: PostCard; className?: string}) {
  if (!post.author) return null
  return (
    <p className={cn('t-ui-sm text-muted', className)}>
      By{' '}
      <Link href={`/authors/${post.author.slug}`} className="relative z-10 text-ink-2 transition-colors hover:text-ink">
        {post.author.name}
      </Link>
    </p>
  )
}
