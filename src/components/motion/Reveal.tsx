import {cn} from '@/lib/utils'

/**
 * Marks a block to fade up when it scrolls into view. A server component:
 * one shared <RevealObserver/> (mounted in the layout) watches every
 * `.reveal` on the page, so a list of 20 cards adds no hydration cost.
 */
export function Reveal({
  children,
  index = 0,
  className,
  as: Tag = 'div',
}: {
  children: React.ReactNode
  index?: number
  className?: string
  as?: 'div' | 'li' | 'section' | 'article'
}) {
  return (
    <Tag className={cn('reveal', className)} style={{'--i': index} as React.CSSProperties}>
      {children}
    </Tag>
  )
}
