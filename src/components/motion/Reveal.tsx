'use client'

import {useEffect, useRef} from 'react'

import {cn} from '@/lib/utils'

/**
 * Fades its children up once when they scroll into view. Pure CSS does the
 * animation (see .reveal in globals.css); with reduced motion it is a no-op.
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
  const ref = useRef<HTMLElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    if (!('IntersectionObserver' in window)) {
      el.classList.add('is-in')
      return
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('is-in')
          io.disconnect()
        }
      },
      {rootMargin: '0px 0px -8% 0px'},
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn('reveal', className)}
      style={{'--i': index} as React.CSSProperties}
    >
      {children}
    </Tag>
  )
}
