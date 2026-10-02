import Link from 'next/link'

import {cn} from '@/lib/utils'

/**
 * The one page header: kicker or breadcrumb, display title, optional count
 * on the right, optional lede, closing rule. Sections, authors, series,
 * static pages and search all use it, so titles line up site-wide.
 */
export function PageHeader({
  kicker,
  crumbs,
  title,
  aside,
  lede,
  children,
  className,
}: {
  kicker?: string
  crumbs?: {label: string; href?: string}[]
  title: React.ReactNode
  aside?: React.ReactNode
  lede?: string
  children?: React.ReactNode
  className?: string
}) {
  return (
    <header className={cn('rise pt-page pb-block', className)}>
      {crumbs ? (
        <nav aria-label="Breadcrumb" className="meta flex flex-wrap items-center gap-2">
          {crumbs.map((c, i) => (
            <span key={c.label} className="flex items-center gap-2">
              {i > 0 && <span aria-hidden="true">/</span>}
              {c.href ? (
                <Link href={c.href} className="hover:text-ink">
                  {c.label}
                </Link>
              ) : (
                <span className="text-ink">{c.label}</span>
              )}
            </span>
          ))}
        </nav>
      ) : (
        kicker && <p className="meta">{kicker}</p>
      )}
      <div className="mt-6 flex flex-col gap-4 border-b border-rule-strong pb-6 md:flex-row md:items-end md:justify-between md:gap-8 md:pb-8">
        <h1 className="t-display">{title}</h1>
        {aside && <div className="meta shrink-0 md:pb-3">{aside}</div>}
      </div>
      {lede && <p className="t-lead mt-6 max-w-measure text-ink-2">{lede}</p>}
      {children}
    </header>
  )
}
