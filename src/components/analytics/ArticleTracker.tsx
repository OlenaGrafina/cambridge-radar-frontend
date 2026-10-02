'use client'

import {useEffect} from 'react'

import {track} from '@/lib/analytics'

/**
 * Read-depth events for one article: 25 / 50 / 75 / 100 % of the body,
 * each sent once. Uses invisible markers inside the body container, so it
 * costs nothing on scroll.
 */
export function ArticleTracker({article, section, author}: {article: string; section?: string; author?: string}) {
  useEffect(() => {
    const body = document.querySelector<HTMLElement>('[data-article-body]')
    if (!body || !('IntersectionObserver' in window)) return
    const marks = [25, 50, 75, 100].map((percent) => {
      const el = document.createElement('span')
      el.dataset.percent = String(percent)
      el.setAttribute('aria-hidden', 'true')
      el.style.cssText = `position:absolute;left:0;width:1px;height:1px;top:${percent === 100 ? 'calc(100% - 1px)' : `${percent}%`}`
      return el
    })
    const prevPosition = body.style.position
    if (getComputedStyle(body).position === 'static') body.style.position = 'relative'
    marks.forEach((m) => body.appendChild(m))

    const io = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue
        const percent = Number((entry.target as HTMLElement).dataset.percent)
        track('article_read', {percent, article, section, author})
        io.unobserve(entry.target)
      }
    })
    marks.forEach((m) => io.observe(m))
    return () => {
      io.disconnect()
      marks.forEach((m) => m.remove())
      body.style.position = prevPosition
    }
  }, [article, section, author])

  return null
}
