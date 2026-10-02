'use client'

import {useEffect, useState} from 'react'

import {NewsletterForm} from '@/components/forms/NewsletterForm'
import {CloseIcon} from '@/components/icons'

const KEY = 'cr-sub-modal'
const QUIET_DAYS = 7

/**
 * The original articles' Jetpack subscription modal: it rises once the reader
 * is halfway through the text. "Continue reading" (or Esc, or the close
 * button) puts it away for a week.
 */
export function SubscribeModal({title}: {title?: string}) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    try {
      const last = Number(localStorage.getItem(KEY) || 0)
      if (Date.now() - last < QUIET_DAYS * 864e5) return
    } catch {}
    const body = document.querySelector<HTMLElement>('[data-article-body]')
    if (!body) return
    const onScroll = () => {
      const r = body.getBoundingClientRect()
      if (r.top + r.height / 2 < window.innerHeight * 0.5) {
        setOpen(true)
        window.removeEventListener('scroll', onScroll)
      }
    }
    window.addEventListener('scroll', onScroll, {passive: true})
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [open])

  function close() {
    setOpen(false)
    try {
      localStorage.setItem(KEY, String(Date.now()))
    } catch {}
  }

  if (!open) return null

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-labelledby="sub-modal-title"
      className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-[40.625rem] border border-rule-strong bg-paper p-6 text-ink shadow-[0_20px_60px_-20px_rgb(0_0_0/0.35)] motion-safe:animate-[rise_520ms_var(--ease-out-quart)_both] md:bottom-8 md:p-8"
    >
      <button type="button" className="icon-btn absolute top-3 right-3 !h-8 !w-8" aria-label="Close" onClick={close}>
        <CloseIcon size={14} />
      </button>
      <h2 id="sub-modal-title" className="t-h3 pr-8">
        {title}
      </h2>
      <p className="t-body-sm mt-2 text-ink-2">Subscribe now to keep reading and get access to the full archive.</p>
      <div className="mt-5">
        <NewsletterForm source="article-modal" compact />
      </div>
      <button type="button" className="meta mt-5 text-ink hover:text-signal" onClick={close}>
        Continue reading
      </button>
    </div>
  )
}
