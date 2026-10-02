'use client'

import {usePathname} from 'next/navigation'
import {useEffect} from 'react'

/** One IntersectionObserver for every `.reveal` block; re-scans on navigation. */
export function RevealObserver() {
  const pathname = usePathname()

  useEffect(() => {
    const pending = () => document.querySelectorAll<HTMLElement>('.reveal:not(.is-in)')
    if (!('IntersectionObserver' in window)) {
      pending().forEach((el) => el.classList.add('is-in'))
      return
    }
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue
          entry.target.classList.add('is-in')
          io.unobserve(entry.target)
        }
      },
      {rootMargin: '0px 0px -8% 0px'},
    )
    pending().forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [pathname])

  return null
}
