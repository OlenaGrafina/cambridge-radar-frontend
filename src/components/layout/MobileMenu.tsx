'use client'

import Link from 'next/link'
import {usePathname} from 'next/navigation'
import {useEffect, useRef, useState} from 'react'

import {CloseIcon, MenuIcon, SocialIcon} from '@/components/icons'
import type {Settings} from '@/lib/sanity/types'
import {cn, pad} from '@/lib/utils'

import {ThemeToggle} from './ThemeToggle'

/** Full-screen menu for phones, built on <dialog> for focus trapping and Esc. */
export function MobileMenu({settings}: {settings: Settings}) {
  const ref = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    ref.current?.close()
  }, [pathname])

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    const onClose = () => setOpen(false)
    dialog.addEventListener('close', onClose)
    return () => dialog.removeEventListener('close', onClose)
  }, [])

  const show = () => {
    ref.current?.showModal()
    setOpen(true)
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
        className={cn(
          'm-0 h-dvh max-h-none w-full max-w-none bg-paper p-0 text-ink backdrop:bg-transparent',
          'open:motion-safe:animate-[rise_480ms_var(--ease-out-quart)_both]',
        )}
      >
        <div className="shell flex h-full flex-col">
          <div className="flex h-[4.25rem] items-center justify-between">
            <span className="meta">Menu</span>
            <button type="button" className="icon-btn" aria-label="Close menu" onClick={() => ref.current?.close()}>
              <CloseIcon />
            </button>
          </div>
          <nav aria-label="Sections" className="border-t border-rule-strong">
            <ul>
              {sections.map((item, i) => (
                <li key={item.slug} className="border-b border-rule">
                  <Link href={`/${item.slug}`} className="flex items-baseline gap-4 py-3.5">
                    <span className="meta w-6">{pad(i + 1)}</span>
                    <span className="display text-[2rem]">{item.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-3">
            {(settings.topMenu ?? []).map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="text-[15px] text-ink-2">
                  {item.label}
                </Link>
              </li>
            ))}
            <li>
              <Link href="/newsletter" className="text-[15px] text-ink-2">
                Newsletter
              </Link>
            </li>
            <li>
              <Link href="/contribute" className="text-[15px] text-ink-2">
                Contribute
              </Link>
            </li>
          </ul>
          <div className="mt-auto flex items-center gap-3 pt-8 pb-8">
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
