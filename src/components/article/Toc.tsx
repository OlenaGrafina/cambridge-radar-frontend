'use client'

import {useEffect, useState} from 'react'

import {cn, pad} from '@/lib/utils'

import type {TocItem} from './Body'

/** Sticky contents with scroll-spy: the section being read is highlighted. */
export function Toc({items}: {items: TocItem[]}) {
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null)

  useEffect(() => {
    const headings = items.map((i) => document.getElementById(i.id)).filter((x): x is HTMLElement => Boolean(x))
    if (!headings.length) return
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible[0]) setActive(visible[0].target.id)
      },
      {rootMargin: '-10% 0px -70% 0px'},
    )
    headings.forEach((h) => io.observe(h))
    return () => io.disconnect()
  }, [items])

  if (items.length < 2) return null

  return (
    <nav aria-label="Contents">
      <p className="kicker border-t-2 border-rule-strong pt-3">Contents</p>
      <ol className="mt-4 space-y-0.5">
        {items.map((item, i) => {
          const isActive = item.id === active
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? 'location' : undefined}
                className={cn(
                  'group grid grid-cols-[1.75rem_1fr] gap-1 py-1.5 text-[14px] leading-snug transition-colors duration-300',
                  isActive ? 'text-ink' : 'text-muted hover:text-ink',
                )}
              >
                <span className={cn('meta pt-[3px] transition-colors', isActive && '!text-signal')}>{pad(i + 1)}</span>
                <span>{item.text}</span>
              </a>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}

/** Same contents, collapsed, for phones and tablets. */
export function TocDisclosure({items}: {items: TocItem[]}) {
  if (items.length < 2) return null
  return (
    <details className="group border-y border-rule xl:hidden">
      <summary className="flex cursor-pointer list-none items-center justify-between py-3.5">
        <span className="kicker">Contents · {pad(items.length)}</span>
        <span aria-hidden="true" className="meta transition-transform duration-300 group-open:rotate-45">
          +
        </span>
      </summary>
      <ol className="pb-4">
        {items.map((item, i) => (
          <li key={item.id}>
            <a href={`#${item.id}`} className="grid grid-cols-[1.75rem_1fr] gap-1 py-1.5 text-[15px] text-ink-2">
              <span className="meta pt-[3px]">{pad(i + 1)}</span>
              <span>{item.text}</span>
            </a>
          </li>
        ))}
      </ol>
    </details>
  )
}
