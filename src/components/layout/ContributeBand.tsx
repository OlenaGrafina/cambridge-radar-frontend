'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'

import {ArrowRight} from '@/components/icons'

/**
 * The call to write for the site, closing every page above the footer links.
 * Hidden on /contribute itself, where the pitch form is the call.
 */
export function ContributeBand() {
  if (usePathname() === '/contribute') return null

  return (
    <section aria-labelledby="footer-contribute" className="grid-12 mb-16 items-end gap-y-6 border-b border-ink/15 pb-16">
      <div className="col-span-12 md:col-span-8">
        <h2 id="footer-contribute" className="t-h2">
          Write for Cambridge Radar
        </h2>
        <p className="t-lead mt-3 max-w-xl text-ink-2">Share an article, an interview or a perspective with our readers.</p>
      </div>
      <div className="col-span-12 md:col-span-4 md:justify-self-end">
        <Link href="/contribute" className="btn btn-signal group">
          Contribute
          <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </section>
  )
}
