import type {Metadata} from 'next'

import {SearchIcon} from '@/components/icons'

export const metadata: Metadata = {title: 'Page not found', robots: {index: false, follow: true}}

/** The original 404: big "404", the apology line and a search field. */
export default function NotFound() {
  return (
    <div className="shell grid-12 pt-section pb-section">
      <div className="col-span-12 md:col-span-8 md:col-start-3 lg:col-span-6 lg:col-start-4">
        <h1 className="rise font-serif text-[clamp(7rem,22vw,15rem)] leading-[0.85] tracking-[-0.04em]">404</h1>
        <h2 className="t-h3 rise mt-8 text-ink-2" style={{'--i': 1} as React.CSSProperties}>
          We&rsquo;re sorry, but the page you were looking for doesn&rsquo;t exist.
        </h2>
        <form action="/search" role="search" className="rise mt-10 flex items-center gap-3 border-b-2 border-rule-strong pb-2" style={{'--i': 2} as React.CSSProperties}>
          <label htmlFor="nf-q" className="sr-only">
            Search
          </label>
          <input id="nf-q" name="q" type="search" placeholder="Search..." className="t-h4 w-full min-w-0 bg-transparent py-2 outline-none placeholder:text-muted/70" />
          <button type="submit" className="icon-btn shrink-0" aria-label="Search">
            <SearchIcon size={20} />
          </button>
        </form>
      </div>
    </div>
  )
}
