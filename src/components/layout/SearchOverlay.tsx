'use client'

import {useRouter} from 'next/navigation'
import {useEffect, useRef, useState} from 'react'

import {CloseIcon, SearchIcon} from '@/components/icons'
import {cn} from '@/lib/utils'

const OPEN_EVENT = 'cr:open-search'

/** Opens the full-screen search from anywhere (header, sticky bar, mobile). */
export function SearchButton({className}: {className?: string}) {
  return (
    <button
      type="button"
      className={cn('icon-btn', className)}
      aria-label="Search"
      onClick={() => window.dispatchEvent(new Event(OPEN_EVENT))}
    >
      <SearchIcon />
    </button>
  )
}

/**
 * Full-screen search overlay, as on the original site (magnifier → overlay
 * with "Enter Keywords"). Submitting goes to /search?q=…
 */
export function SearchOverlay() {
  const dialog = useRef<HTMLDialogElement>(null)
  const input = useRef<HTMLInputElement>(null)
  const router = useRouter()
  const [q, setQ] = useState('')

  useEffect(() => {
    const open = () => {
      dialog.current?.showModal()
      requestAnimationFrame(() => input.current?.focus())
    }
    window.addEventListener(OPEN_EVENT, open)
    return () => window.removeEventListener(OPEN_EVENT, open)
  }, [])

  return (
    <dialog
      ref={dialog}
      aria-label="Search"
      className="m-0 h-dvh max-h-none w-full max-w-none bg-paper/97 p-0 text-ink backdrop:bg-transparent open:motion-safe:animate-[rise_420ms_var(--ease-out-quart)_both]"
      onClick={(e) => {
        if (e.target === dialog.current) dialog.current?.close()
      }}
    >
      <div className="shell flex h-full flex-col">
        <div className="flex h-20 items-center justify-end">
          <button type="button" className="icon-btn" aria-label="Close search" onClick={() => dialog.current?.close()}>
            <CloseIcon />
          </button>
        </div>
        <form
          role="search"
          className="my-auto flex items-center gap-4 border-b-2 border-rule-strong pb-4"
          onSubmit={(e) => {
            e.preventDefault()
            if (!q.trim()) return
            dialog.current?.close()
            router.push(`/search?q=${encodeURIComponent(q.trim())}`)
          }}
        >
          <label htmlFor="search-overlay-input" className="sr-only">
            Search
          </label>
          <input
            ref={input}
            id="search-overlay-input"
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Enter Keywords"
            className="t-display w-full min-w-0 bg-transparent outline-none placeholder:text-muted/50"
          />
          <button type="submit" className="icon-btn shrink-0 !h-14 !w-14" aria-label="Search">
            <SearchIcon size={22} />
          </button>
        </form>
        <div className="h-20" />
      </div>
    </dialog>
  )
}
