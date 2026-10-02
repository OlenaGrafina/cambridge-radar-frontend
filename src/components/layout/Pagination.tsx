import Link from 'next/link'

import {ArrowLeft, ArrowRight} from '@/components/icons'
import {cn} from '@/lib/utils'

/** Previous · 1 2 3 · Next — section archives, the all-articles archive, tags and search. */
export function Pagination({page, pages, href, className}: {page: number; pages: number; href: (n: number) => string; className?: string}) {
  if (pages < 2) return null
  return (
    <nav aria-label="Pagination" className={cn('mt-section flex items-center justify-between border-t border-rule-strong pt-5', className)}>
      {page > 1 ? (
        <Link href={href(page - 1)} className="btn btn-ghost" rel="prev">
          <ArrowLeft size={16} /> Previous
        </Link>
      ) : (
        <span />
      )}
      <ol className="flex gap-1">
        {Array.from({length: pages}, (_, i) => i + 1).map((n) => (
          <li key={n}>
            <Link
              href={href(n)}
              aria-current={n === page ? 'page' : undefined}
              className={cn('meta grid h-10 w-10 place-items-center tabular', n === page ? 'bg-ink !text-paper' : 'hover:text-ink')}
            >
              {n}
            </Link>
          </li>
        ))}
      </ol>
      {page < pages ? (
        <Link href={href(page + 1)} className="btn btn-ghost" rel="next">
          Next <ArrowRight size={16} />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  )
}
