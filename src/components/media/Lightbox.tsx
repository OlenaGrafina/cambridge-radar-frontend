'use client'

import {useRef} from 'react'

import {CloseIcon} from '@/components/icons'

/**
 * Click-to-enlarge, as the original theme's lightbox on article images.
 * Wraps any image; opens a full-screen dialog with the large version
 * (Sanity CDN, 2000px) on demand only — nothing loads until it opens.
 */
export function Lightbox({src, alt, children}: {src: string | null; alt?: string; children: React.ReactNode}) {
  const dialog = useRef<HTMLDialogElement>(null)
  const img = useRef<HTMLImageElement>(null)
  if (!src) return <>{children}</>

  const open = () => {
    if (img.current && !img.current.src) img.current.src = src
    dialog.current?.showModal()
  }

  return (
    <>
      <button type="button" onClick={open} className="block w-full cursor-zoom-in text-left" aria-label={`Enlarge image${alt ? `: ${alt}` : ''}`}>
        {children}
      </button>
      <dialog
        ref={dialog}
        aria-label={alt || 'Image'}
        className="m-0 h-dvh max-h-none w-full max-w-none bg-black/92 p-0 backdrop:bg-transparent open:motion-safe:animate-[rise_360ms_var(--ease-out-quart)_both]"
        onClick={() => dialog.current?.close()}
      >
        <div className="grid h-full w-full place-items-center p-4 md:p-10">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img ref={img} alt={alt ?? ''} className="max-h-full max-w-full cursor-zoom-out object-contain" />
        </div>
        <button
          type="button"
          aria-label="Close"
          className="fixed top-4 right-4 grid h-11 w-11 place-items-center rounded-full border border-white/30 text-white hover:border-white"
          onClick={() => dialog.current?.close()}
        >
          <CloseIcon />
        </button>
      </dialog>
    </>
  )
}
