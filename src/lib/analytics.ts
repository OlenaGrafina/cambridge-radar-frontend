/**
 * Analytics events — one call, every tool.
 *
 * `track()` forwards an event to whatever the reader has consented to and
 * the editor has configured in Site settings → Analytics:
 *   GA4      gtag('event', name, params)   (mark key events as conversions in GA4)
 *   GTM      dataLayer.push({event: name, ...params})
 *   Clarity  clarity('event', name) — shows up as a filter on recordings
 * Before consent (or with nothing configured) it is a silent no-op.
 *
 * Event catalogue (GA4 recommended names where one exists):
 *   sign_up          newsletter sign-up            {method: 'newsletter', source}
 *   generate_lead    contact form sent             {form: 'contact'}
 *   share            share button                  {method, content_type, item_id}
 *   search           search results shown          {search_term, results}
 *   article_read     scroll depth in an article    {percent: 25|50|75|100, article, section, author}
 *   outbound_click   link to another site          {link_url, link_domain}
 *   theme_change     day / night switch            {theme}
 */

type Params = Record<string, string | number | boolean | undefined>

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
    clarity?: ((...args: unknown[]) => void) & {q?: unknown[]}
    __crGtm?: boolean
  }
}

export function track(name: string, params: Params = {}) {
  if (typeof window === 'undefined') return
  const clean = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined))
  try {
    window.gtag?.('event', name, clean)
    if (window.__crGtm) window.dataLayer?.push({event: name, ...clean})
    window.clarity?.('event', name)
  } catch {
    // Analytics must never break the page.
  }
  if (process.env.NODE_ENV === 'development') console.debug('[track]', name, clean)
}
