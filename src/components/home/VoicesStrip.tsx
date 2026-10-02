'use client'

import Link from 'next/link'
import {useRef} from 'react'

import {ArrowLeft, ArrowRight} from '@/components/icons'
import {SanityImg} from '@/components/media/SanityImg'
import type {AuthorRef} from '@/lib/sanity/types'
import {initials} from '@/lib/utils'

/** Contributors as a scroll-snap strip: native swipe on phones, arrows on desktop. */
export function VoicesStrip({authors}: {authors: AuthorRef[]}) {
  const track = useRef<HTMLUListElement>(null)

  const scroll = (dir: 1 | -1) => {
    const el = track.current
    if (!el) return
    const item = el.querySelector('li')
    const step = item ? item.getBoundingClientRect().width + 24 : el.clientWidth * 0.8
    el.scrollBy({left: dir * step * 2, behavior: 'smooth'})
  }

  return (
    <div>
      <div className="mb-6 flex justify-end gap-1">
        <button type="button" className="icon-btn" aria-label="Scroll contributors left" onClick={() => scroll(-1)}>
          <ArrowLeft size={16} />
        </button>
        <button type="button" className="icon-btn" aria-label="Scroll contributors right" onClick={() => scroll(1)}>
          <ArrowRight size={16} />
        </button>
      </div>
      <ul
        ref={track}
        className="no-scrollbar -mx-4 flex snap-x snap-mandatory scroll-px-4 gap-6 overflow-x-auto px-4 md:mx-0 md:scroll-px-0 md:px-0"
      >
        {authors.map((a) => (
          <li key={a._id} className="w-[44vw] shrink-0 snap-start sm:w-[28vw] md:w-[calc((100%-4*1.5rem)/5)]">
            <Link href={`/authors/${a.slug}`} className="group block">
              {a.photo?.asset ? (
                <SanityImg
                  image={a.photo}
                  ratio={4 / 5}
                  sizes="(min-width: 768px) 18vw, 44vw"
                  alt={a.name}
                  imgClassName="grayscale transition-[filter,transform] duration-700 group-hover:grayscale-0"
                />
              ) : (
                <div className="frame grid aspect-[4/5] place-items-center">
                  <span className="display text-5xl text-muted">{initials(a.name)}</span>
                </div>
              )}
              <p className="headline mt-3 text-[1.125rem]">
                <span className="hover-line">{a.name}</span>
              </p>
              {a.role && <p className="mt-1 line-clamp-2 text-[13px] leading-snug text-muted">{a.role}</p>}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}
