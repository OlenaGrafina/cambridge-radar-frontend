'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect, useRef, useState} from 'react'

import {CloseIcon, MenuIcon, SocialIcon} from '@/components/icons'
import type {Settings} from '@/lib/sanity/types'
import {cn} from '@/lib/utils'

import {ThemeToggle} from './ThemeToggle'

/**
 * Phone menu: a drawer that slides in from the right, where its button is.
 * The close button sits exactly where the menu button was, so open and close
 * are the same tap. Built on <dialog> for focus trapping and Esc.
 */
export function MobileMenu({settings}: {settings: Settings}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    ref.current?.close()
  }, [pathname])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const onClose = () => {
      setOpen(false)
      setClosing(false)
      document.documentElement.style.overflow = ''
    }
    // Esc: slide out instead of vanishing.
    const onCancel = (e: Event) => {
      e.preventDefault()
      requestClose()
    }
    dialog.addEventListener('close', onClose)
    dialog.addEventListener('cancel', onCancel)
    return () => {
      dialog.removeEventListener('close', onClose)
      dialog.removeEventListener('cancel', onCancel)
    }
  }, [])

  const show = () => {
    ref.current?.showModal()
    document.documentElement.style.overflow = 'hidden'
    setOpen(true)
  }

  function requestClose() {
    const dialog = ref.current
    if (!dialog?.open) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      dialog.close()
      return
    }
    setClosing(true)
  }

  const sections = (settings.mainMenu ?? []).filter(Boolean)

  return (
    <>
      <button type="button" className="icon-btn md:hidden" aria-label="Open menu" aria-expanded={open} onClick={show}>
        <MenuIcon />
      </button>
      <dialog
        ref={ref}
        aria-label="Menu"
        onClick={(e) => e.target === e.currentTarget && requestClose()}
        onAnimationEnd={(e) => e.animationName === 'drawer-out' && ref.current?.close()}
        className={cn(
          'm-0 ml-auto h-dvh max-h-none w-full max-w-[26rem] bg-paper p-0 text-ink shadow-[-24px_0_60px_-30px_rgb(0_0_0/0.35)]',
          'backdrop:bg-ink/25 open:backdrop:motion-safe:animate-[fade-in_300ms_ease-out_both]',
          closing
            ? 'motion-safe:animate-[drawer-out_260ms_cubic-bezier(0.5,0,0.75,0)_both]'
            : 'open:motion-safe:animate-[drawer-in_420ms_var(--ease-out-quart)_both]',
        )}
      >
        <div className="shell flex h-full flex-col">
          {/* Same height and edge as the header row, so ✕ lands where ☰ was. */}
          <div className="flex h-14 shrink-0 items-center justify-between">
            <span className="meta">Menu</span>
            <button type="button" className="icon-btn" aria-label="Close menu" onClick={requestClose}>
              <CloseIcon />
            </button>
          </div>
          <nav aria-label="Sections" className="border-t border-rule-strong">
            <ul>
              {[{title: 'Home', slug: ''}, ...sections].map((item) => (
                <li key={item.slug} className="border-b border-rule">
                  <Link href={`/${item.slug}`} className="t-h3 block py-3.5">
                    {item.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3">
            {(settings.topMenu ?? []).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="t-ui text-ink-2">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/newsletter" className="t-ui text-ink-2">
                Newsletter
              </Link>
            </li>
            <li>
              <Link href="/contribute" className="t-ui text-ink-2">
                Contribute
              </Link>
            </li>
          </ul>
          <div className="mt-auto flex items-center gap-3 pt-8 pb-[calc(2rem+env(safe-area-inset-bottom))]">
            <ThemeToggle withLabel className="flex-1" />
            {(settings.social ?? []).map((s) => (
              <a key={s.url} href={s.url} className="icon-btn" target="_blank" rel="noopener noreferrer" aria-label={s.network}>
                <SocialIcon network={s.network} />
              </a>
            ))}
          </div>
        </div>
      </dialog>
    </>
  )
}
