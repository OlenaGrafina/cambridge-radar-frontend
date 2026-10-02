import Link from 'next/link'

import {SanityImg} from '@/components/media/SanityImg'
import type {PostCard} from '@/lib/sanity/types'
import {cn, postPath} from '@/lib/utils'

import {Byline, StoryMeta} from './StoryMeta'

/**
 * One story teaser in fixed densities — each density has exactly one
 * headline size from the type scale:
 *
 *   StoryWide     h2   section opener, image left / text right
 *   StoryFeature  h3   lead of a row
 *   StoryCard     h4   grid card
 *   StoryRow      h5   text row with square thumbnail
 *   StoryIndex    h5   numbered headline, no image
 *
 * The whole block is clickable through a stretched link on the headline;
 * section and author links sit above it (z-10) and stay clickable.
 */

const stretched = 'hover-line after:absolute after:inset-0'

export function StoryWide({post, priority = false}: {post: PostCard; priority?: boolean}) {
  return (
    <article className="group relative grid-12 gap-y-6">
      <SanityImg
        image={post.mainImage}
        ratio={3 / 2}
        priority={priority}
        sizes="(min-width: 768px) 58vw, 100vw"
        className="col-span-12 md:col-span-7"
      />
      <div className="col-span-12 flex flex-col md:col-span-5">
        <StoryMeta post={post} long />
        <h2 className="t-h2 mt-4">
          <Link href={postPath(post)} className={stretched}>
            {post.title}
          </Link>
        </h2>
        {post.excerpt && <p className="t-body-sm mt-4 text-ink-2">{post.excerpt}</p>}
        <Byline post={post} className="mt-5" />
      </div>
    </article>
  )
}

export function StoryFeature({post, priority = false, sizes}: {post: PostCard; priority?: boolean; sizes?: string}) {
  return (
    <article className="group relative">
      <SanityImg image={post.mainImage} ratio={3 / 2} priority={priority} sizes={sizes ?? '(min-width: 1024px) 50vw, 100vw'} />
      <StoryMeta post={post} className="mt-4" />
      <h3 className="t-h3 mt-3">
        <Link href={postPath(post)} className={stretched}>
          {post.title}
        </Link>
      </h3>
      {post.excerpt && <p className="t-body-sm mt-3 line-clamp-3 text-ink-2">{post.excerpt}</p>}
      <Byline post={post} className="mt-4" />
    </article>
  )
}

export function StoryCard({post, sizes, showExcerpt = false}: {post: PostCard; sizes?: string; showExcerpt?: boolean}) {
  return (
    <article className="group relative">
      <SanityImg image={post.mainImage} ratio={3 / 2} sizes={sizes ?? '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw'} />
      <StoryMeta post={post} className="mt-4" />
      <h3 className="t-h4 mt-3">
        <Link href={postPath(post)} className={stretched}>
          {post.title}
        </Link>
      </h3>
      {showExcerpt && post.excerpt && <p className="t-body-sm mt-3 line-clamp-2 text-ink-2">{post.excerpt}</p>}
      <Byline post={post} className="mt-3" />
    </article>
  )
}

/** Meta on its own full-width line, then headline + byline beside a square thumbnail. */
export function StoryRow({
  post,
  showSection = true,
  compact = false,
  showExcerpt = false,
}: {
  post: PostCard
  showSection?: boolean
  compact?: boolean
  showExcerpt?: boolean
}) {
  return (
    <article className="group relative">
      <StoryMeta post={post} showSection={showSection} />
      <div className={cn('mt-2.5 grid gap-4', compact ? 'grid-cols-[1fr_4.5rem]' : 'grid-cols-[1fr_5.5rem] sm:grid-cols-[1fr_7.5rem]')}>
        <div className="min-w-0">
          <h3 className="t-h5">
            <Link href={postPath(post)} className={stretched}>
              {post.title}
            </Link>
          </h3>
          {showExcerpt && post.excerpt && (
            <p className="t-body-sm mt-2 hidden max-w-measure text-ink-2 sm:line-clamp-2">{post.excerpt}</p>
          )}
          <Byline post={post} className="mt-2" />
        </div>
        <SanityImg image={post.mainImage} ratio={1} sizes={compact ? '72px' : '120px'} />
      </div>
    </article>
  )
}

/** Headline list item without an image — the "Latest" column. */
export function StoryIndex({post}: {post: PostCard; index?: number}) {
  return (
    <article className="group relative">
      <div className="min-w-0">
        <h3 className="t-h5">
          <Link href={postPath(post)} className={stretched}>
            {post.title}
          </Link>
        </h3>
        <StoryMeta post={post} className="mt-2" />
      </div>
    </article>
  )
}
