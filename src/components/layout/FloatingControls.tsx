'use client'

import {useEffect, useRef, useState} from 'react'

import {NewsletterForm} from '@/components/forms/NewsletterForm'
import {CloseIcon} from '@/components/icons'
import {cn} from '@/lib/utils'

const A11Y_KEY = 'cr-a11y'

type A11y = {size: number; contrast: boolean; links: boolean; spacing: boolean; motion: boolean; cursor: boolean}
const DEFAULT_A11Y: A11y = {size: 0, contrast: false, links: false, spacing: false, motion: false, cursor: false}

function applyA11y(s: A11y) {
  const root = document.documentElement
  root.style.setProperty('--a11y-scale', String(1 + s.size * 0.1))
  root.classList.toggle('a11y-scale', s.size !== 0)
  root.classList.toggle('a11y-contrast', s.contrast)
  root.classList.toggle('a11y-links', s.links)
  root.classList.toggle('a11y-spacing', s.spacing)
  root.classList.toggle('a11y-still', s.motion)
  root.classList.toggle('a11y-cursor', s.cursor)
}

/**
 * Floating controls carried over from the original site: back to top (after
 * 200px of scroll), the "Subscribe" button, and an accessibility menu
 * (text size, contrast, link highlighting, spacing, pause animations, big
 * cursor) that remembers the reader's choice.
 */
export function FloatingControls({newsletterTitle, newsletterText}: {newsletterTitle?: string; newsletterText?: string}) {
  const [showTop, setShowTop] = useState(false)
  const [panel, setPanel] = useState<'subscribe' | 'a11y' | null>(null)
  const [a11y, setA11y] = useState<A11y>(DEFAULT_A11Y)
  const box = useRef<HTMLDivElement>(null)

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(A11Y_KEY) || 'null') as A11y | null
      if (saved) {
        setA11y({...DEFAULT_A11Y, ...saved})
        applyA11y({...DEFAULT_A11Y, ...saved})
      }
    } catch {}
    const onScroll = () => setShowTop(window.scrollY > 200)
    onScroll()
    window.addEventListener('scroll', onScroll, {passive: true})
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!panel) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setPanel(null)
    const onDown = (e: MouseEvent) => {
      if (box.current && !box.current.contains(e.target as Node)) setPanel(null)
    }
    document.addEventListener('keydown', onKey)
    document.addEventListener('mousedown', onDown)
    return () => {
      document.removeEventListener('keydown', onKey)
      document.removeEventListener('mousedown', onDown)
    }
  }, [panel])

  const update = (patch: Partial<A11y>) => {
    const next = {...a11y, ...patch}
    setA11y(next)
    applyA11y(next)
    try {
      localStorage.setItem(A11Y_KEY, JSON.stringify(next))
    } catch {}
  }

  const toggles: {key: keyof Omit<A11y, 'size'>; label: string}[] = [
    {key: 'contrast', label: 'High contrast'},
    {key: 'links', label: 'Highlight links'},
    {key: 'spacing', label: 'Text spacing'},
    {key: 'motion', label: 'Pause animations'},
    {key: 'cursor', label: 'Big cursor'},
  ]

  return (
    <div ref={box} className="pointer-events-none fixed right-3 bottom-3 z-40 flex flex-col items-end gap-2 md:right-5 md:bottom-5">
      {panel === 'subscribe' && (
        <div role="dialog" aria-label="Subscribe" className="pointer-events-auto w-[min(22rem,calc(100vw-1.5rem))] border border-rule-strong bg-paper p-5 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.25)]">
          <div className="flex items-start justify-between gap-4">
            <p className="t-h4">{newsletterTitle}</p>
            <button type="button" className="icon-btn !h-8 !w-8 shrink-0" aria-label="Close" onClick={() => setPanel(null)}>
              <CloseIcon size={14} />
            </button>
          </div>
          {newsletterText && <p className="t-body-sm mt-2 text-ink-2">{newsletterText}</p>}
          <div className="mt-4">
            <NewsletterForm source="floating" />
          </div>
        </div>
      )}

      {panel === 'a11y' && (
        <div role="dialog" aria-label="Accessibility menu" className="pointer-events-auto w-[min(20rem,calc(100vw-1.5rem))] border border-rule-strong bg-paper p-5 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.25)]">
          <div className="flex items-center justify-between">
            <p className="kicker">Accessibility menu</p>
            <button type="button" className="icon-btn !h-8 !w-8" aria-label="Close" onClick={() => setPanel(null)}>
              <CloseIcon size={14} />
            </button>
          </div>
          <div className="mt-4 flex items-center justify-between gap-3 border-b border-rule pb-4">
            <span className="t-ui">Text size</span>
            <div className="flex items-center gap-1">
              <button type="button" className="icon-btn !h-9 !w-9" aria-label="Smaller text" onClick={() => update({size: Math.max(-1, a11y.size - 1)})}>
                A−
              </button>
              <span className="meta w-10 text-center tabular">{100 + a11y.size * 10}%</span>
              <button type="button" className="icon-btn !h-9 !w-9" aria-label="Larger text" onClick={() => update({size: Math.min(4, a11y.size + 1)})}>
                A+
              </button>
            </div>
          </div>
          <ul className="mt-2">
            {toggles.map((t) => (
              <li key={t.key}>
                <label className="t-ui flex items-center justify-between gap-3 py-2">
                  {t.label}
                  <input
                    type="checkbox"
                    checked={a11y[t.key]}
                    onChange={(e) => update({[t.key]: e.target.checked} as Partial<A11y>)}
                    className="h-4 w-4 accent-[var(--ink)]"
                  />
                </label>
              </li>
            ))}
          </ul>
          <button type="button" className="meta mt-3 hover:text-ink" onClick={() => update(DEFAULT_A11Y)}>
            Reset
          </button>
        </div>
      )}

      <div className="pointer-events-auto flex items-center gap-2">
        <button
          type="button"
          onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          aria-label="Back to top"
          className={cn(
            'grid h-11 w-11 place-items-center border border-rule bg-paper text-ink transition-all duration-300 hover:border-rule-strong',
            showTop ? 'translate-y-0 opacity-100' : 'pointer-events-none translate-y-2 opacity-0',
          )}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <path d="M12 20V5M6 11l6-6 6 6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setPanel(panel === 'a11y' ? null : 'a11y')}
          aria-label="Accessibility menu"
          aria-expanded={panel === 'a11y'}
          className="grid h-11 w-11 place-items-center border border-rule bg-paper text-ink transition-colors hover:border-rule-strong"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
            <circle cx="12" cy="4.5" r="1.6" />
            <path d="M5 8.5l7 1.5 7-1.5M12 10v4.5m0 0-3 6m3-6 3 6" />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => setPanel(panel === 'subscribe' ? null : 'subscribe')}
          aria-expanded={panel === 'subscribe'}
          className="btn btn-ink !h-11"
        >
          Subscribe
        </button>
      </div>
    </div>
  )
}
