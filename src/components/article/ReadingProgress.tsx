'use client'

import {useEffect, useRef} from 'react'

/**
 * Thin signal-coloured bar along the top. Browsers with scroll-driven
 * animations run it in CSS alone; others get a passive scroll listener.
 */
export function ReadingProgress() {
  const bar = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (CSS.supports('animation-timeline: scroll()')) return
    let frame = 0
    const update = () => {
      frame = 0
      const max = document.documentElement.scrollHeight - innerHeight
      bar.current?.style.setProperty('--progress', String(max > 0 ? scrollY / max : 0))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    addEventListener('scroll', onScroll, {passive: true})
    return () => removeEventListener('scroll', onScroll)
  }, [])

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-x-0 top-0 z-50 h-[2px]">
      <div ref={bar} className="progress-bar h-full bg-signal" />
    </div>
  )
}
