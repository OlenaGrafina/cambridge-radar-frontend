'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect, useRef, useState} from 'react'

import type {MenuItem, SanityImage} from '@/lib/sanity/types'
import {cn} from '@/lib/utils'

import {Logo} from './Logo'
import {SearchButton} from './SearchOverlay'
import {ThemeToggle} from './ThemeToggle'

/**
 * Section bar. As on the original site, the logo and the menu follow the
 * reader: once the masthead scrolls away the bar sticks, the logo slides in
 * on the left and search / night mode appear on the right. The date bar
 * above scrolls away. On phones it pins right under the pinned header row.
 * The sticky element has a solid background and no backdrop-filter: Safari 26
 * colours the area under its glass address bar from it.
 */
export function NavBar({sections, title, logo}: {sections: MenuItem[]; title: string; logo?: SanityImage | null}) {
  const pathname = usePathname()
  const sentinel = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)
  const active = pathname.split('/')[1] ?? ''

  useEffect(() => {
    const el = sentinel.current
    if (!el) return
    const io = new IntersectionObserver(([entry]) => setStuck(!entry.isIntersecting), {rootMargin: '0px'})
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <>
      <div ref={sentinel} aria-hidden="true" className="h-0" />
      <div
        data-stuck={stuck || undefined}
        className={cn(
          'sticky top-[calc(3.5rem+env(safe-area-inset-top))] z-40 bg-paper transition-[box-shadow] duration-300 md:top-0',
          // Skirt only once pinned: before that it would cover the masthead above.
          stuck && 'shadow-[0_1px_0_var(--rule)] md:skirt',
        )}
      >
        <div className="shell">
          <div className={cn('relative flex h-11 items-center gap-4 border-t border-rule md:h-[3.25rem] md:border-t-0', !stuck && 'md:rule-double')}>
            <Link
              href="/"
              aria-hidden={!stuck}
              tabIndex={stuck ? 0 : -1}
              aria-label={`${title} — home`}
              className={cn(
                'hidden shrink-0 transition-all duration-500 ease-[var(--ease-out-quart)] md:block',
                stuck ? 'translate-x-0 opacity-100' : 'pointer-events-none -translate-x-2 opacity-0 md:absolute',
              )}
            >
              <Logo logo={logo} title={title} height={30} />
            </Link>

            <nav aria-label="Sections" className="no-scrollbar -mx-4 flex-1 overflow-x-auto px-4 [mask-image:linear-gradient(to_right,black_85%,transparent)] md:mx-0 md:px-0 md:[mask-image:none]">
              <ul className={cn('flex items-center gap-6 whitespace-nowrap md:gap-7', stuck ? 'md:justify-end' : 'md:justify-center')}>
                {[{_type: 'page' as const, title: 'Home', slug: ''}, ...sections].map((item) => {
                  const isActive = active === item.slug
                  return (
                    <li key={item.slug}>
                      <Link
                        href={`/${item.slug}`}
                        aria-current={isActive ? 'page' : undefined}
                        className={cn(
                          't-ui-sm relative block py-3 font-medium tracking-[0.02em] uppercase transition-colors',
                          isActive ? 'text-ink' : 'text-ink-2 hover:text-ink',
                          'after:absolute after:inset-x-0 after:bottom-2 after:h-[2px] after:origin-left after:bg-signal after:transition-transform after:duration-500 after:ease-[var(--ease-out-quart)]',
                          isActive ? 'after:scale-x-100' : 'after:scale-x-0 hover:after:scale-x-100',
                        )}
                      >
                        {item.title}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            </nav>

            <div
              className={cn(
                'hidden shrink-0 items-center gap-1 transition-opacity duration-300 md:flex',
                stuck ? 'opacity-100' : 'pointer-events-none absolute right-0 opacity-0',
              )}
              aria-hidden={!stuck}
            >
              <SearchButton />
              <ThemeToggle />
            </div>
          </div>
        </div>
        <div className={cn('h-px bg-rule', stuck ? 'opacity-0' : 'opacity-100')} />
      </div>
    </>
  )
}
