import Link from 'next/link'

import {ArrowLeft, ArrowRight} from '@/components/icons'
import {cn} from '@/lib/utils'

type Item = {title: string; href: string} | null | undefined

/** Previous / next navigation — articles ("Previous Post") and profiles ("Previous Profiles"), as on the original. */
export function PrevNext({prev, next, prevLabel, nextLabel, className}: {prev: Item; next: Item; prevLabel: string; nextLabel: string; className?: string}) {
  if (!prev && !next) return null
  return (
    <nav aria-label={`${prevLabel} / ${nextLabel}`} className={cn('grid gap-6 border-y border-rule py-6 sm:grid-cols-2', className)}>
      {prev ? (
        <Link href={prev.href} rel="prev" className="group block">
          <span className="meta flex items-center gap-2">
            <ArrowLeft size={14} className="transition-transform duration-300 group-hover:-translate-x-0.5" />
            {prevLabel}
          </span>
          <span className="t-h5 mt-2 block">
            <span className="hover-line">{prev.title}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
      {next ? (
        <Link href={next.href} rel="next" className="group block sm:text-right">
          <span className="meta flex items-center gap-2 sm:justify-end">
            {nextLabel}
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </span>
          <span className="t-h5 mt-2 block">
            <span className="hover-line">{next.title}</span>
          </span>
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
