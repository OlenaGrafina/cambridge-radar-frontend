'use client'

import {useEffect, useRef, useState} from 'react'

import {NewsletterForm} from '@/components/forms/NewsletterForm'
import {CloseIcon} from '@/components/icons'
import {cn} from '@/lib/utils'

const A11Y_KEY = 'cr-a11y'

type ColourFilter = 'none' | 'mono' | 'low' | 'high'
type A11y = {
  size: number
  filter: ColourFilter
  contrast: boolean
  titles: boolean
  links: boolean
  font: boolean
  spacing: boolean
  lines: boolean
  bold: boolean
  left: boolean
  guide: boolean
  motion: boolean
  cursor: boolean
}
type Toggle = Exclude<keyof A11y, 'size' | 'filter'>
const DEFAULT_A11Y: A11y = {
  size: 0,
  filter: 'none',
  contrast: false,
  titles: false,
  links: false,
  font: false,
  spacing: false,
  lines: false,
  bold: false,
  left: false,
  guide: false,
  motion: false,
  cursor: false,
}

const CLASS: Record<Exclude<Toggle, 'guide'>, string> = {
  contrast: 'a11y-contrast',
  titles: 'a11y-titles',
  links: 'a11y-links',
  font: 'a11y-font',
  spacing: 'a11y-spacing',
  lines: 'a11y-lines',
  bold: 'a11y-bold',
  left: 'a11y-left',
  motion: 'a11y-still',
  cursor: 'a11y-cursor',
}

function applyA11y(s: A11y) {
  const root = document.documentElement
  root.style.setProperty('--a11y-scale', String(1 + s.size * 0.1))
  root.classList.toggle('a11y-scale', s.size !== 0)
  for (const [key, cls] of Object.entries(CLASS)) root.classList.toggle(cls, Boolean(s[key as keyof typeof CLASS]))
  for (const f of ['mono', 'low', 'high'] as const) root.classList.toggle(`a11y-${f}`, s.filter === f)
}

/** Reads the article (or the page's main content) aloud in sentence-sized chunks. */
function speak(onEnd: () => void) {
  const synth = window.speechSynthesis
  const root = document.querySelector('[data-article-body]') ?? document.querySelector('main')
  const text = (root as HTMLElement | null)?.innerText.replace(/\s+/g, ' ').trim()
  if (!synth || !text) return false
  synth.cancel()
  const title = document.querySelector('h1')?.textContent?.trim()
  const chunks = `${title ? `${title}. ` : ''}${text}`.match(/[^.!?]+[.!?]*\s*/g) ?? [text]
  chunks.forEach((chunk, i) => {
    const u = new SpeechSynthesisUtterance(chunk)
    u.lang = 'en-GB'
    if (i === chunks.length - 1) u.onend = onEnd
    synth.speak(u)
  })
  return true
}

/**
 * Floating controls carried over from the original site: back to top (after
 * 200px of scroll), the "Subscribe" button, and the accessibility menu with
 * the original widget's options (colour filters, text size, highlighting,
 * readable font, spacing, weight, alignment, reading guide, pause
 * animations, big cursor, read aloud). Choices are remembered.
 */
export function FloatingControls({newsletterTitle, newsletterText}: {newsletterTitle?: string; newsletterText?: string}) {
  const [showTop, setShowTop] = useState(false)
  const [panel, setPanel] = useState<'subscribe' | 'a11y' | null>(null)
  const [a11y, setA11y] = useState<A11y>(DEFAULT_A11Y)
  const [reading, setReading] = useState(false)
  const box = useRef<HTMLDivElement>(null)
  const guide = useRef<HTMLDivElement>(null)

  // Reading guide: a band that follows the pointer.
  useEffect(() => {
    if (!a11y.guide) return
    const onMove = (e: PointerEvent) => {
      if (guide.current) guide.current.style.transform = `translateY(${e.clientY - 20}px)`
    }
    window.addEventListener('pointermove', onMove, {passive: true})
    return () => window.removeEventListener('pointermove', onMove)
  }, [a11y.guide])

  useEffect(() => () => window.speechSynthesis?.cancel(), [])

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

  const groups: {title: string; items: {key: Toggle; label: string}[]}[] = [
    {
      title: 'Content',
      items: [
        {key: 'titles', label: 'Highlight titles'},
        {key: 'links', label: 'Highlight links'},
        {key: 'font', label: 'Dyslexia-friendly font'},
        {key: 'spacing', label: 'Letter spacing'},
        {key: 'lines', label: 'Line height'},
        {key: 'bold', label: 'Font weight'},
        {key: 'left', label: 'Text align left'},
      ],
    },
    {
      title: 'Navigation',
      items: [
        {key: 'guide', label: 'Reading guide'},
        {key: 'motion', label: 'Pause animations'},
        {key: 'cursor', label: 'Big cursor'},
      ],
    },
  ]
  const filters: {value: ColourFilter; label: string}[] = [
    {value: 'none', label: 'Original'},
    {value: 'mono', label: 'Monochrome'},
    {value: 'low', label: 'Low saturation'},
    {value: 'high', label: 'High saturation'},
  ]

  return (
    <div ref={box} className="pointer-events-none fixed right-3 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-40 flex flex-col items-end gap-2 md:right-5 md:bottom-[calc(1.25rem+env(safe-area-inset-bottom))]">
      {a11y.guide && (
        <div
          ref={guide}
          aria-hidden="true"
          className="pointer-events-none fixed inset-x-0 top-0 z-50 h-10 border-y-2 border-signal bg-signal/10"
          style={{transform: 'translateY(40vh)'}}
        />
      )}
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
        <div role="dialog" aria-label="Accessibility menu" className="pointer-events-auto max-h-[calc(100dvh-6rem)] w-[min(20rem,calc(100vw-1.5rem))] overflow-y-auto overscroll-contain border border-rule-strong bg-paper p-5 shadow-[0_12px_40px_-12px_rgb(0_0_0/0.25)]">
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
          <div className="mt-3">
            <p className="meta">Colour</p>
            <div className="mt-2 grid grid-cols-2 gap-1.5">
              {filters.map((f) => (
                <button
                  key={f.value}
                  type="button"
                  aria-pressed={a11y.filter === f.value}
                  onClick={() => update({filter: f.value})}
                  className={cn(
                    't-ui-sm h-9 border px-2 transition-colors',
                    a11y.filter === f.value ? 'border-ink bg-ink text-paper' : 'border-rule hover:border-rule-strong',
                  )}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <label className="t-ui mt-2 flex items-center justify-between gap-3 py-2">
              High contrast
              <input
                type="checkbox"
                checked={a11y.contrast}
                onChange={(e) => update({contrast: e.target.checked})}
                className="h-4 w-4 accent-[var(--ink)]"
              />
            </label>
          </div>
          {groups.map((g) => (
            <div key={g.title} className="mt-3 border-t border-rule pt-3">
              <p className="meta">{g.title}</p>
              <ul className="mt-1">
                {g.items.map((t) => (
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
            </div>
          ))}
          <div className="mt-3 border-t border-rule pt-3">
            <button
              type="button"
              aria-pressed={reading}
              className="btn btn-ghost w-full"
              onClick={() => {
                if (reading) {
                  window.speechSynthesis?.cancel()
                  setReading(false)
                } else if (speak(() => setReading(false))) {
                  setReading(true)
                }
              }}
            >
              {reading ? 'Stop reading' : 'Read page aloud'}
            </button>
          </div>
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
