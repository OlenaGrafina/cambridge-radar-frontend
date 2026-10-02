import Link from 'next/link'

import {SearchIcon} from '@/components/icons'
import type {Settings} from '@/lib/sanity/types'

import {Logo} from './Logo'
import {MobileMenu} from './MobileMenu'
import {NavBar} from './NavBar'
import {Today} from './Today'
import {ThemeToggle} from './ThemeToggle'

export function Header({settings}: {settings: Settings}) {
  const sections = (settings.mainMenu ?? []).filter(Boolean)
  const top = settings.topMenu ?? []

  return (
    <header className="relative z-40 bg-paper">
      {/* Utility bar */}
      <div className="shell hidden h-12 items-center justify-between md:flex">
        <p className="meta flex items-center gap-3">
          <span className="relative inline-flex h-1.5 w-1.5" aria-hidden="true">
            <span className="absolute inset-0 rounded-full bg-signal motion-safe:animate-[ping_2.4s_cubic-bezier(0,0,0.2,1)_infinite]" />
            <span className="relative h-1.5 w-1.5 rounded-full bg-signal" />
          </span>
          <Today />
        </p>
        <nav aria-label="Utility" className="flex items-center gap-1">
          <ul className="mr-3 flex items-center gap-5">
            {top.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="t-ui-sm hover-line text-ink-2 transition-colors hover:text-ink">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <Link href="/search" className="icon-btn" aria-label="Search">
            <SearchIcon />
          </Link>
          <ThemeToggle />
        </nav>
      </div>

      {/* Masthead */}
      <div className="shell grid grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 pt-3 pb-4 md:block md:pt-2 md:pb-7">
        <MobileMenu settings={settings} />
        <Link href="/" className="mx-auto block w-fit" aria-label={`${settings.title} — home`}>
          <Logo logo={settings.logo} title={settings.title} height={104} mobileHeight={44} priority />
        </Link>
        <Link href="/search" className="icon-btn md:hidden" aria-label="Search">
          <SearchIcon />
        </Link>
        {settings.tagline && (
          <p className="meta mt-3 hidden text-center md:block">{settings.tagline}</p>
        )}
      </div>

      <NavBar sections={sections} title={settings.title} logo={settings.logo} />
    </header>
  )
}
