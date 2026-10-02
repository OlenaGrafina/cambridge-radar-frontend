'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect, useState} from 'react'

import {cn} from '@/lib/utils'

const KEY = 'cr-consent'
export const OPEN_CONSENT_EVENT = 'cr:open-consent'

type Consent = {analytics: boolean; at: string}

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

/** Google Tag Manager, for marketing tags added later without a deploy. */
function loadTagManager(id: string) {
  if (window.__crGtm) return
  window.dataLayer = window.dataLayer || []
  window.dataLayer.push({'gtm.start': Date.now(), event: 'gtm.js'})
  window.__crGtm = true
  inject(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`, 'gtm')
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
 * Cookie notice, as the original CookieYes banner: Customise / Reject All /
 * Accept All, a preferences view (Necessary always on, Analytics optional)
 * and a small button bottom-left to revisit the choice. Analytics (GA4, GTM,
 * Microsoft Clarity) load only after consent; with no tracker configured
 * there are no cookies to ask about, so nothing is shown.
 */
export function ConsentManager({gaId, clarityId, gtmId}: {gaId?: string; clarityId?: string; gtmId?: string}) {
  const [open, setOpen] = useState(false)
  const [customise, setCustomise] = useState(false)
  const [analyticsChoice, setAnalyticsChoice] = useState(false)
  const [consent, setConsent] = useState<Consent | null>(null)
  const pathname = usePathname()
  const hasTrackers = Boolean(gaId || clarityId || gtmId)
  const tools = [gaId && 'Google Analytics', gtmId && 'Google Tag Manager', clarityId && 'Microsoft Clarity'].filter(Boolean).join(', ')

  useEffect(() => {
    const saved = readConsent()
    setConsent(saved)
    setAnalyticsChoice(Boolean(saved?.analytics))
    if (!saved && hasTrackers) {
      const t = setTimeout(() => setOpen(true), 900)
      return () => clearTimeout(t)
    }
  }, [hasTrackers])

  useEffect(() => {
    const onOpen = () => {
      setCustomise(true)
      setOpen(true)
    }
    window.addEventListener(OPEN_CONSENT_EVENT, onOpen)
    return () => window.removeEventListener(OPEN_CONSENT_EVENT, onOpen)
  }, [])

  useEffect(() => {
    if (!consent?.analytics) return
    if (gaId) loadGoogleAnalytics(gaId)
    if (gtmId) loadTagManager(gtmId)
    if (clarityId) loadClarity(clarityId)
  }, [consent, gaId, clarityId, gtmId])

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
    setAnalyticsChoice(analytics)
    setOpen(false)
    setCustomise(false)
  }

  if (!open) {
    if (!consent || !hasTrackers) return null
    return (
      <button
        type="button"
        aria-label="Consent preferences"
        onClick={() => {
          setCustomise(true)
          setOpen(true)
        }}
        className="fixed bottom-3 left-3 z-40 grid h-11 w-11 place-items-center rounded-full border border-rule bg-paper text-ink transition-colors hover:border-rule-strong md:bottom-5 md:left-5"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
          <path d="M20.5 12.5A8.5 8.5 0 1 1 11.5 3.5a3 3 0 0 0 3.6 3.6 3 3 0 0 0 3.8 3.8 2.6 2.6 0 0 0 1.6 1.6Z" />
          <circle cx="8.5" cy="10" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="15.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="15.5" cy="13" r="0.8" fill="currentColor" stroke="none" />
        </svg>
      </button>
    )
  }

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="consent-title"
      className={cn(
        'fixed inset-x-3 bottom-3 z-50 max-h-[calc(100dvh-1.5rem)] overflow-y-auto border border-rule-strong bg-paper p-5 text-ink md:inset-x-auto md:left-6 md:bottom-6 md:max-w-md md:p-6',
        'motion-safe:animate-[rise_520ms_var(--ease-out-quart)_both]',
      )}
    >
      <div className="flex items-start justify-between gap-4">
        <p id="consent-title" className="kicker">
          {customise ? 'Customise Consent Preferences' : 'We value your privacy'}
        </p>
        {customise && consent && (
          <button type="button" className="icon-btn -mt-2 -mr-2 !h-8 !w-8 shrink-0" aria-label="Close" onClick={() => setOpen(false)}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        )}
      </div>
      <p className="t-body-sm mt-3 text-ink-2">
        We use cookies to analyse our traffic. By clicking “Accept All”, you consent to our use of cookies.{' '}
        <Link href="/privacy-policy" className="underline underline-offset-2">
          Privacy Policy
        </Link>
      </p>

      {customise && (
        <ul className="mt-5 divide-y divide-rule border-y border-rule">
          <li className="flex items-start justify-between gap-4 py-3">
            <div>
              <p className="t-ui font-medium">Necessary</p>
              <p className="t-ui-sm mt-0.5 text-muted">Theme, consent choice</p>
            </div>
            <span className="meta shrink-0 pt-0.5">Always Active</span>
          </li>
          <li>
            <label className="flex items-start justify-between gap-4 py-3">
              <span>
                <span className="t-ui block font-medium">Analytics</span>
                {tools && <span className="t-ui-sm mt-0.5 block text-muted">{tools}</span>}
              </span>
              <input
                type="checkbox"
                checked={analyticsChoice}
                onChange={(e) => setAnalyticsChoice(e.target.checked)}
                className="mt-1 h-4 w-4 shrink-0 accent-[var(--ink)]"
              />
            </label>
          </li>
        </ul>
      )}

      <div className={cn('mt-5 grid gap-2', customise ? 'grid-flow-row-dense grid-cols-2' : 'grid-cols-3')}>
        {customise ? (
          <button type="button" className="btn btn-ghost !px-3" onClick={() => decide(false)}>
            Reject All
          </button>
        ) : (
          <button type="button" className="btn btn-ghost !px-3" onClick={() => setCustomise(true)}>
            Customise
          </button>
        )}
        {customise ? (
          <button type="button" className="btn btn-ghost col-span-2 !px-3" onClick={() => decide(analyticsChoice)}>
            Save My Preferences
          </button>
        ) : (
          <button type="button" className="btn btn-ghost !px-3" onClick={() => decide(false)}>
            Reject All
          </button>
        )}
        <button type="button" className="btn btn-ink !px-3" onClick={() => decide(true)}>
          Accept All
        </button>
      </div>
    </div>
  )
}
