'use client'

import {useEffect, useState} from 'react'
import {flushSync} from 'react-dom'

import {MoonIcon, SunIcon} from '@/components/icons'
import {cn} from '@/lib/utils'

type Theme = 'light' | 'dark'

function currentTheme(): Theme {
  const set = document.documentElement.dataset.theme
  if (set === 'light' || set === 'dark') return set
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/**
 * Day/night switch. Where the View Transitions API exists the new theme
 * wipes in as a circle growing from the button; elsewhere it just swaps.
 */
export function ThemeToggle({className, withLabel = false}: {className?: string; withLabel?: boolean}) {
  const [theme, setTheme] = useState<Theme | null>(null)

  useEffect(() => {
    setTheme(currentTheme())
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      if (!document.documentElement.dataset.theme) setTheme(currentTheme())
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  function toggle(event: React.MouseEvent<HTMLButtonElement>) {
    const next: Theme = currentTheme() === 'dark' ? 'light' : 'dark'
    const root = document.documentElement
    const apply = () => {
      root.dataset.theme = next
      try {
        localStorage.setItem('cr-theme', next)
      } catch {}
      setTheme(next)
    }

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (!('startViewTransition' in document) || reduce) {
      apply()
      return
    }

    const rect = event.currentTarget.getBoundingClientRect()
    const x = rect.left + rect.width / 2
    const y = rect.top + rect.height / 2
    const r = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y))
    root.style.setProperty('--wipe-x', `${x}px`)
    root.style.setProperty('--wipe-y', `${y}px`)
    root.style.setProperty('--wipe-r', `${r}px`)
    document.startViewTransition(() => flushSync(apply))
  }

  const label = theme === 'dark' ? 'Switch to day mode' : 'Switch to night mode'

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(withLabel ? 'btn btn-ghost w-full justify-between' : 'icon-btn', className)}
    >
      {withLabel && <span>{theme === 'dark' ? 'Day mode' : 'Night mode'}</span>}
      <span className="relative block h-[18px] w-[18px]">
        <SunIcon
          className={cn(
            'absolute inset-0 transition-all duration-500 ease-[var(--ease-out-quart)]',
            theme === 'dark' ? 'scale-100 rotate-0 opacity-100' : 'scale-50 -rotate-90 opacity-0',
          )}
        />
        <MoonIcon
          className={cn(
            'absolute inset-0 transition-all duration-500 ease-[var(--ease-out-quart)]',
            theme === 'dark' ? 'scale-50 rotate-90 opacity-0' : 'scale-100 rotate-0 opacity-100',
          )}
        />
      </span>
    </button>
  )
}
