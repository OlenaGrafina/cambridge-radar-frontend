'use client'

import Link from 'next/link'
import {useCallback, useEffect, useRef, useState} from 'react'

import {ArrowLeft, ArrowRight} from '@/components/icons'
import {SanityImg} from '@/components/media/SanityImg'
import {Byline, StoryMeta} from '@/components/story/StoryMeta'
import type {PostCard} from '@/lib/sanity/types'
import {cn, pad, postPath} from '@/lib/utils'

const INTERVAL = 7000

/**
 * Top stories. Slides cross-fade; a segmented bar shows which story is on
 * and how long until the next. Autoplay pauses on hover, focus, an
 * off-screen slider or a hidden tab, and is off for reduced motion.
 */
export function LeadSlider({posts}: {posts: PostCard[]}) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [visible, setVisible] = useState(true)
  const [reduced, setReduced] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const touchX = useRef<number | null>(null)
  const count = posts.length

  const go = useCallback((i: number) => setIndex(((i % count) + count) % count), [count])

  useEffect(() => {
    setReduced(window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    const el = root.current
    if (!el) return
    const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting), {threshold: 0.3})
    io.observe(el)
    const onVis = () => setVisible(document.visibilityState === 'visible')
    document.addEventListener('visibilitychange', onVis)
    return () => {
      io.disconnect()
      document.removeEventListener('visibilitychange', onVis)
    }
  }, [])

  const playing = count > 1 && !paused && visible && !reduced

  useEffect(() => {
    if (!playing) return
    const t = setTimeout(() => go(index + 1), INTERVAL)
    return () => clearTimeout(t)
  }, [playing, index, go])

  if (!count) return null

  return (
    <div
      ref={root}
      role="region"
      aria-roledescription="carousel"
      aria-label="Top stories"
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return
        const dx = e.changedTouches[0].clientX - touchX.current
        if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1))
        touchX.current = null
      }}
      onKeyDown={(e) => {
        if (e.key === 'ArrowRight') go(index + 1)
        if (e.key === 'ArrowLeft') go(index - 1)
      }}
    >
      {/* Images: stacked, cross-fading */}
      <div className="grid">
        {posts.map((post, i) => {
          const active = i === index
          return (
            <Link
              key={post._id}
              href={postPath(post)}
              tabIndex={-1}
              aria-hidden="true"
              inert={!active}
              className={cn(
                'block overflow-hidden [grid-area:1/1] transition-opacity duration-700 ease-[var(--ease-out-quart)]',
                active ? 'z-10 opacity-100' : 'z-0 opacity-0',
              )}
            >
              <SanityImg
                image={post.mainImage}
                ratio={3 / 2}
                priority={i === 0}
                sizes="(min-width: 1280px) 640px, (min-width: 1024px) 50vw, 100vw"
                imgClassName={cn(
                  'transition-transform duration-[1600ms] ease-[var(--ease-out-quart)]',
                  active ? 'scale-100' : 'scale-[1.04]',
                )}
              />
            </Link>
          )
        })}
      </div>

      {count > 1 && (
        <div className="mt-4 flex items-center gap-4">
          <span className="meta tabular text-ink" aria-live="polite">
            {pad(index + 1)} <span className="text-muted">/ {pad(count)}</span>
          </span>
          <ol className="flex flex-1 gap-1.5" aria-label="Choose story">
            {posts.map((post, i) => (
              <li key={post._id} className="flex-1">
                <button
                  type="button"
                  onClick={() => go(i)}
                  aria-label={`Story ${i + 1}: ${post.title}`}
                  aria-current={i === index}
                  className="group/seg block w-full py-2"
                >
                  <span className="relative block h-[2px] overflow-hidden bg-rule">
                    <span
                      key={i === index ? `on-${index}-${playing}` : 'off'}
                      className={cn(
                        'absolute inset-0 origin-left bg-ink',
                        i < index && 'scale-x-100',
                        i > index && 'scale-x-0 group-hover/seg:scale-x-[0.15] transition-transform',
                        i === index && (playing ? 'animate-[segment_var(--d)_linear_both]' : 'scale-x-100'),
                      )}
                      style={{'--d': `${INTERVAL}ms`} as React.CSSProperties}
                    />
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <div className="flex gap-1">
            <button type="button" className="icon-btn" aria-label="Previous story" onClick={() => go(index - 1)}>
              <ArrowLeft size={16} />
            </button>
            <button type="button" className="icon-btn" aria-label="Next story" onClick={() => go(index + 1)}>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Text: stacked, the active one rises in */}
      <div className="grid">
        {posts.map((post, i) => {
          const active = i === index
          return (
            <article
              key={post._id}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} of ${count}`}
              aria-hidden={!active}
              inert={!active}
              className={cn(
                'group relative [grid-area:1/1] transition-all duration-700 ease-[var(--ease-out-quart)]',
                active ? 'z-10 translate-y-0 opacity-100 delay-100' : 'z-0 translate-y-2 opacity-0',
              )}
            >
              <StoryMeta post={post} long className="mt-5" />
              <h2 className="headline mt-3 text-[2rem] leading-[1.04] md:text-[2.75rem] xl:text-[3.125rem]">
                <Link href={postPath(post)} className="hover-line after:absolute after:inset-0">
                  {post.title}
                </Link>
              </h2>
              {post.excerpt && (
                <p className="mt-4 line-clamp-3 max-w-[42rem] font-serif text-[1.125rem] leading-relaxed text-ink-2">
                  {post.excerpt}
                </p>
              )}
              <Byline post={post} className="mt-4" />
            </article>
          )
        })}
      </div>
    </div>
  )
}
