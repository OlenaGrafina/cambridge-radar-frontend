'use client'

import {useEffect} from 'react'

import {track} from '@/lib/analytics'

/** Site-wide delegated listeners: outbound links. One listener, no per-link code. */
export function GlobalTracker() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const a = (event.target as HTMLElement | null)?.closest?.('a[href]') as HTMLAnchorElement | null
      if (!a) return
      let url: URL
      try {
        url = new URL(a.href, location.href)
      } catch {
        return
      }
      if (!/^https?:$/.test(url.protocol) || url.host === location.host) return
      if (a.closest('[data-share]')) return // share buttons send their own event
      track('outbound_click', {link_url: url.href, link_domain: url.hostname})
    }
    document.addEventListener('click', onClick, {capture: true})
    return () => document.removeEventListener('click', onClick, {capture: true})
  }, [])
  return null
}
