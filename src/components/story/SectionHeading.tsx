import Link from 'next/link'

import {ArrowRight} from '@/components/icons'
import {cn} from '@/lib/utils'

/** Row heading: label on a heavy rule, optional "All →" link on the right. */
export function SectionHeading({
  title,
  href,
  index,
  className,
  as: Tag = 'h2',
}: {
  title: string
  href?: string
  index?: string
  className?: string
  as?: 'h2' | 'h3'
}) {
  return (
    <div className={cn('flex items-end justify-between gap-4 border-t-2 border-rule-strong pt-3', className)}>
      <Tag className="flex items-baseline gap-3">
        {index && <span className="meta">{index}</span>}
        {href ? (
          <Link href={href} className="display hover-line text-[1.75rem] md:text-[2.125rem]">
            {title}
          </Link>
        ) : (
          <span className="display text-[1.75rem] md:text-[2.125rem]">{title}</span>
        )}
      </Tag>
      {href && (
        <Link href={href} className="group meta flex shrink-0 items-center gap-2 pb-1.5 text-ink hover:text-signal">
          All
          <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  )
}
