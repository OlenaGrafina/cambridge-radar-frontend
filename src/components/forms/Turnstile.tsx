'use client'

import {useEffect, useRef} from 'react'

declare global {
  interface Window {
    turnstile?: {
      render: (el: HTMLElement, opts: Record<string, unknown>) => string
      reset: (id?: string) => void
      remove: (id?: string) => void
    }
    onTurnstileLoad?: () => void
  }
}

const SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY
const SRC = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit'

let loading: Promise<void> | null = null
function loadScript() {
  if (window.turnstile) return Promise.resolve()
  loading ??= new Promise<void>((resolve, reject) => {
    const s = document.createElement('script')
    s.src = SRC
    s.async = true
    s.onload = () => resolve()
    s.onerror = () => reject(new Error('Turnstile failed to load'))
    document.head.appendChild(s)
  })
  return loading
}

/**
 * Cloudflare Turnstile, invisible for most readers. The script is fetched
 * only when a form is actually on screen. Without a site key it renders
 * nothing and the server falls back to honeypot + rate limiting.
 */
export function Turnstile({onToken, resetKey}: {onToken: (token: string) => void; resetKey?: number}) {
  const box = useRef<HTMLDivElement>(null)
  const widget = useRef<string | null>(null)

  useEffect(() => {
    if (!SITE_KEY || !box.current) return
    const el = box.current
    let cancelled = false
    const io = new IntersectionObserver(async ([entry]) => {
      if (!entry.isIntersecting) return
      io.disconnect()
      await loadScript().catch(() => null)
      if (cancelled || !window.turnstile) return
      widget.current = window.turnstile.render(el, {
        sitekey: SITE_KEY,
        appearance: 'interaction-only',
        theme: document.documentElement.dataset.theme === 'dark' ? 'dark' : 'auto',
        callback: onToken,
      })
    })
    io.observe(el)
    return () => {
      cancelled = true
      io.disconnect()
      if (widget.current) window.turnstile?.remove(widget.current)
    }
  }, [onToken])

  useEffect(() => {
    if (resetKey && widget.current) window.turnstile?.reset(widget.current)
  }, [resetKey])

  if (!SITE_KEY) return null
  return <div ref={box} className="min-h-0" />
}
