import Link from 'next/link'

import {SanityImg} from '@/components/media/SanityImg'
import type {PostCard} from '@/lib/sanity/types'
import {cn, pad, postPath} from '@/lib/utils'

import {Byline, StoryMeta} from './StoryMeta'

/**
 * One story teaser in several densities. The whole block is clickable
 * through a stretched link on the headline; section and author links sit
 * above it (z-10) so they stay separately clickable.
 */

export function StoryFeature({post, priority = false, sizes}: {post: PostCard; priority?: boolean; sizes?: string}) {
  return (
    <article className="group relative">
      <SanityImg
        image={post.mainImage}
        ratio={3 / 2}
        priority={priority}
        sizes={sizes ?? '(min-width: 1024px) 50vw, 100vw'}
      />
      <StoryMeta post={post} className="mt-4" />
      <h3 className="headline mt-3 text-[1.75rem] md:text-[2.125rem]">
        <Link href={postPath(post)} className="hover-line after:absolute after:inset-0">
          {post.title}
        </Link>
      </h3>
      {post.excerpt && (
        <p className="mt-3 line-clamp-3 font-serif text-[1.0625rem] leading-relaxed text-ink-2">{post.excerpt}</p>
      )}
      <Byline post={post} className="mt-4" />
    </article>
  )
}

export function StoryCard({post, sizes, showExcerpt = false}: {post: PostCard; sizes?: string; showExcerpt?: boolean}) {
  return (
    <article className="group relative">
      <SanityImg image={post.mainImage} ratio={3 / 2} sizes={sizes ?? '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw'} />
      <StoryMeta post={post} className="mt-3.5" />
      <h3 className="headline mt-2.5 text-[1.25rem] md:text-[1.375rem]">
        <Link href={postPath(post)} className="hover-line after:absolute after:inset-0">
          {post.title}
        </Link>
      </h3>
      {showExcerpt && post.excerpt && (
        <p className="mt-2 line-clamp-2 font-serif text-[0.975rem] leading-relaxed text-ink-2">{post.excerpt}</p>
      )}
      <Byline post={post} className="mt-3" />
    </article>
  )
}

/** Text-first row with a small square thumbnail — for feeds and lists. */
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
    <article
      className={cn(
        'group relative grid gap-4',
        compact ? 'grid-cols-[1fr_4.5rem]' : 'grid-cols-[1fr_5.5rem] sm:grid-cols-[1fr_7.5rem]',
      )}
    >
      <div>
        <StoryMeta post={post} showSection={showSection} />
        <h3 className="headline mt-2 text-[1.125rem] md:text-[1.1875rem]">
          <Link href={postPath(post)} className="hover-line after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        {showExcerpt && post.excerpt && (
          <p className="mt-2 hidden max-w-[44rem] font-serif text-[1rem] leading-relaxed text-ink-2 sm:line-clamp-2">{post.excerpt}</p>
        )}
        <Byline post={post} className="mt-2" />
      </div>
      <SanityImg image={post.mainImage} ratio={1} sizes={compact ? '72px' : '120px'} />
    </article>
  )
}

/** Numbered headline only — the "Latest" index. */
export function StoryIndex({post, index}: {post: PostCard; index: number}) {
  return (
    <article className="group relative grid grid-cols-[2rem_1fr] gap-2">
      <span className="meta pt-1 tabular">{pad(index)}</span>
      <div>
        <h3 className="headline text-[1.0625rem] leading-snug">
          <Link href={postPath(post)} className="hover-line after:absolute after:inset-0">
            {post.title}
          </Link>
        </h3>
        <StoryMeta post={post} className="mt-1.5" />
      </div>
    </article>
  )
}

/** Large horizontal teaser for section pages: image left, text right. */
export function StoryWide({post, priority = false}: {post: PostCard; priority?: boolean}) {
  return (
    <article className="group relative grid gap-6 md:grid-cols-12 md:gap-8">
      <SanityImg
        image={post.mainImage}
        ratio={3 / 2}
        priority={priority}
        sizes="(min-width: 768px) 58vw, 100vw"
        className="md:col-span-7"
      />
      <div className="flex flex-col md:col-span-5 md:pt-2">
        <StoryMeta post={post} long />
        <h2 className={cn('headline mt-4 text-[2rem] md:text-[2.75rem]')}>
          <Link href={postPath(post)} className="hover-line after:absolute after:inset-0">
            {post.title}
          </Link>
        </h2>
        {post.excerpt && <p className="mt-4 font-serif text-[1.125rem] leading-relaxed text-ink-2">{post.excerpt}</p>}
        <Byline post={post} className="mt-6" />
      </div>
    </article>
  )
}
