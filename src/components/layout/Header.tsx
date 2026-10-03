import Link from 'next/link'

import {NETWORK_LABEL, SocialIcon} from '@/components/icons'
import type {Settings} from '@/lib/sanity/types'

import {Logo} from './Logo'
import {MobileMenu} from './MobileMenu'
import {NavBar} from './NavBar'
import {SearchButton} from './SearchOverlay'
import {Today} from './Today'
import {ThemeToggle} from './ThemeToggle'

export function Header({settings}: {settings: Settings}) {
  const sections = (settings.mainMenu ?? []).filter(Boolean)
  const top = settings.topMenu ?? []

  return (
    <>
    {/* Phones: this row (search · logo · menu) is pinned, the section strip
        pins right under it, so the header moves as one piece. Desktop: the
        masthead scrolls away and the section bar takes the logo. */}
    <header className="skirt sticky top-0 z-40 bg-paper pt-[env(safe-area-inset-top)] md:relative md:pt-0">
      {/* Utility bar */}
      <div className="shell hidden h-12 items-center justify-between md:flex">
        <p className="meta">
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
          {(settings.social ?? []).length > 0 && (
            <ul className="mr-2 flex items-center border-l border-rule pl-3" aria-label="Follow">
              {(settings.social ?? []).map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`Cambridge Radar on ${NETWORK_LABEL[s.network] ?? s.network}`}
                    className="grid h-9 w-9 place-items-center text-ink-2 transition-colors hover:text-ink"
                  >
                    <SocialIcon network={s.network} size={15} />
                  </a>
                </li>
              ))}
            </ul>
          )}
          <SearchButton />
          <ThemeToggle />
        </nav>
      </div>

      {/* Masthead */}
      <div className="shell grid h-14 grid-cols-[2.5rem_1fr_2.5rem] items-center gap-2 md:block md:h-auto md:pt-2 md:pb-7">
        <SearchButton className="md:hidden" />
        <Link href="/" className="masthead-logo mx-auto block w-fit" aria-label={`${settings.title} — home`}>
          <Logo logo={settings.logo} title={settings.title} height={104} mobileHeight={34} priority />
        </Link>
        <MobileMenu settings={settings} />
        {settings.tagline && (
          <p className="meta mt-3 hidden text-center md:block">{settings.tagline}</p>
        )}
      </div>

    </header>
    <NavBar sections={sections} title={settings.title} logo={settings.logo} />
    </>
  )
}
