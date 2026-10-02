'use client'

import Link from 'next/link'
import {useEffect, useRef, useState} from 'react'

import {ArrowLeft, ArrowRight} from '@/components/icons'
import {StoryRow} from '@/components/story/Story'
import type {PostCard} from '@/lib/sanity/types'
import {cn} from '@/lib/utils'

/**
 * The "Daily Feed" column from the original home page: a slider that pages
 * through articles a few at a time, with a "View all" link to the archive.
 * Pages cross-fade; arrows sit next to the heading. Autoplay pauses on
 * hover/focus and is off for reduced motion.
 */
export function FeedSlider({
  title,
  posts,
  perPage = 4,
  viewAllHref = '/all',
  viewAllLabel = 'View all',
  autoplayMs = 0,
}: {
  title: string
  posts: PostCard[]
  perPage?: number
  viewAllHref?: string
  viewAllLabel?: string
  autoplayMs?: number
}) {
  const pages = Math.max(1, Math.ceil(posts.length / perPage))
  const [page, setPage] = useState(0)
  const [paused, setPaused] = useState(false)
  const reduced = useRef(false)
  const go = (n: number) => setPage(((n % pages) + pages) % pages)

  useEffect(() => {
    reduced.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  }, [])

  useEffect(() => {
    if (!autoplayMs || pages < 2 || paused || reduced.current) return
    const t = setTimeout(() => go(page + 1), autoplayMs)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, paused, autoplayMs, pages])

  return (
    <div
      role="region"
      aria-roledescription="carousel"
      aria-label={title}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="flex items-end justify-between gap-4 border-t-2 border-rule-strong pt-3">
        <h2 className="t-h3">{title}</h2>
        {pages > 1 && (
          <div className="flex gap-1">
            <button type="button" className="icon-btn !h-9 !w-9" aria-label="Previous articles" onClick={() => go(page - 1)}>
              <ArrowLeft size={15} />
            </button>
            <button type="button" className="icon-btn !h-9 !w-9" aria-label="Next articles" onClick={() => go(page + 1)}>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>

      <div className="mt-5 grid">
        {Array.from({length: pages}, (_, p) => {
          const active = p === page
          return (
            <ul
              key={p}
              aria-hidden={!active}
              inert={!active}
              className={cn(
                'divide-y divide-rule [grid-area:1/1] transition-all duration-500 ease-[var(--ease-out-quart)]',
                active ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-1 opacity-0',
              )}
            >
              {posts.slice(p * perPage, p * perPage + perPage).map((post) => (
                <li key={post._id} className="py-4 first:pt-0">
                  <StoryRow post={post} compact />
                </li>
              ))}
            </ul>
          )
        })}
      </div>

      <div className="mt-4 flex items-center justify-between gap-4 border-t border-rule pt-4">
        {pages > 1 ? (
          <ol className="flex gap-1.5" aria-label="Choose page">
            {Array.from({length: pages}, (_, p) => (
              <li key={p}>
                <button
                  type="button"
                  aria-label={`Page ${p + 1}`}
                  aria-current={p === page}
                  onClick={() => go(p)}
                  className="block py-2"
                >
                  <span className={cn('block h-[2px] w-6 transition-colors', p === page ? 'bg-ink' : 'bg-rule hover:bg-muted')} />
                </button>
              </li>
            ))}
          </ol>
        ) : (
          <span />
        )}
        <Link href={viewAllHref} className="group meta flex items-center gap-2 text-ink hover:text-signal">
          {viewAllLabel}
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  )
}
