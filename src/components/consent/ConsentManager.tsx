'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect, useState} from 'react'

import {cn} from '@/lib/utils'

const KEY = 'cr-consent'
export const OPEN_CONSENT_EVENT = 'cr:open-consent'

type Consent = {analytics: boolean; at: string}

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    clarity?: ((...args: unknown[]) => void) & {q?: unknown[]}
  }
}

function readConsent(): Consent | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as Consent) : null
  } catch {
    return null
  }
}

function inject(src: string, id: string) {
  if (document.getElementById(id)) return
  const s = document.createElement('script')
  s.id = id
  s.async = true
  s.src = src
  document.head.appendChild(s)
}

/** GA4 with Consent Mode v2. Nothing is requested before the reader agrees. */
function loadGoogleAnalytics(id: string) {
  window.dataLayer = window.dataLayer || []
  window.gtag = function gtag() {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments)
  }
  window.gtag('consent', 'default', {
    ad_storage: 'denied',
    ad_user_data: 'denied',
    ad_personalization: 'denied',
    analytics_storage: 'granted',
  })
  window.gtag('js', new Date())
  window.gtag('config', id, {anonymize_ip: true})
  inject(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(id)}`, 'ga4')
}

function loadClarity(id: string) {
  if (window.clarity) return
  const c = function clarity(...args: unknown[]) {
    ;(c.q = c.q || []).push(args)
  } as ((...args: unknown[]) => void) & {q?: unknown[]}
  window.clarity = c
  inject(`https://www.clarity.ms/tag/${encodeURIComponent(id)}`, 'clarity')
}

/**
 * Cookie notice. Analytics (GA4, Microsoft Clarity) load only after an
 * explicit "Accept"; "Essential only" keeps the site tracker-free.
 */
export function ConsentManager({gaId, clarityId}: {gaId?: string; clarityId?: string}) {
  const [open, setOpen] = useState(false)
  const [consent, setConsent] = useState<Consent | null>(null)
  const pathname = usePathname()
  const hasTrackers = Boolean(gaId || clarityId)

  useEffect(() => {
    const saved = readConsent()
    setConsent(saved)
    if (!saved && hasTrackers) {
      const t = setTimeout(() => setOpen(true), 900)
      return () => clearTimeout(t)
    }
  }, [hasTrackers])

  useEffect(() => {
    const onOpen = () => setOpen(true)
    window.addEventListener(OPEN_CONSENT_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, onOpen)
  }, [])

  useEffect(() => {
    if (!consent?.analytics) return
    if (gaId) loadGoogleAnalytics(gaId)
    if (clarityId) loadClarity(clarityId)
  }, [consent, gaId, clarityId])

  // Client-side navigations are page views too.
  useEffect(() => {
    if (consent?.analytics && gaId && window.gtag) {
      window.gtag('event', 'page_view', {page_path: pathname, page_location: window.location.href})
    }
  }, [pathname, consent, gaId])

  function decide(analytics: boolean) {
    const value = {analytics, at: new Date().toISOString()}
    try {
      localStorage.setItem(KEY, JSON.stringify(value))
    } catch {}
    if (!analytics && consent?.analytics) {
      // Withdrawing consent: reload so already-loaded trackers are gone.
      window.location.reload()
      return
    }
    setConsent(value)
    setOpen(false)
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      className={cn(
        'fixed inset-x-3 bottom-3 z-50 border border-rule-strong bg-paper p-5 text-ink md:inset-x-auto md:right-6 md:bottom-6 md:max-w-md md:p-6',
        'motion-safe:animate-[rise_520ms_var(--ease-out-quart)_both]',
      )}
    >
      <p id="consent-title" className="kicker">
        Your privacy
      </p>
      <p className="t-body-sm mt-3 text-ink-2">
        We use analytics cookies to understand which analysis people read, only if you agree. Nothing is
        tracked until you choose. <Link href="/privacy-policy" className="underline underline-offset-2">Privacy policy</Link>.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-2">
        <button type="button" className="btn btn-ghost" onClick={() => decide(false)}>
          Essential only
        </button>
        <button type="button" className="btn btn-ink" onClick={() => decide(true)}>
          Accept analytics
        </button>
      </div>
    </div>
  )
}
