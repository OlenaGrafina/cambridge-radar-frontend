import Link from 'next/link'

import {NETWORK_LABEL, RssIcon, SocialIcon} from '@/components/icons'
import {NewsletterForm} from '@/components/forms/NewsletterForm'
import type {Settings} from '@/lib/sanity/types'

import {ConsentLink} from '../consent/ConsentLink'
import {CodeSiteCredit} from './CodeSiteCredit'
import {Logo} from './Logo'

export function Footer({settings}: {settings: Settings}) {
  const sections = (settings.mainMenu ?? []).filter(Boolean)
  const year = new Date().getFullYear()

  return (
    <footer className="surface-dark cv-auto mt-section bg-paper text-ink [contain-intrinsic-size:auto_640px]">
      <div className="shell pt-section pb-10">
        <div className="grid-12 gap-y-12">
          <div className="col-span-12 md:col-span-5">
            <Link href="/" aria-label={`${settings.title} — home`} className="block w-fit max-w-full">
              <Logo logo={settings.logo} title={settings.title} height={72} />
            </Link>
            {settings.tagline && <p className="meta mt-3 !text-ink/60">{settings.tagline}</p>}
            <p className="t-body-sm mt-8 max-w-sm text-ink/75">
              {settings.footerNote ||
                'An independent analytical platform. Signals, context and the people shaping what comes next.'}
            </p>
          </div>

          <nav aria-label="Sections" className="col-span-6 md:col-span-2">
            <p className="meta !text-ink/50">Sections</p>
            <ul className="mt-4 space-y-2.5">
              {sections.map((s) => (
                <li key={s.slug}>
                  <Link href={`/${s.slug}`} className="t-ui hover-line text-ink/85 hover:text-ink">
                    {s.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label="Publication" className="col-span-6 md:col-span-2">
            <p className="meta !text-ink/50">Radar</p>
            <ul className="mt-4 space-y-2.5">
              {[
                {label: 'About us', href: '/about'},
                {label: 'Authors', href: '/authors'},
                {label: 'Contribute', href: '/contribute'},
                {label: 'Newsletter', href: '/newsletter'},
                {label: 'Contacts', href: '/contacts'},
              ].map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="t-ui hover-line text-ink/85 hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div className="col-span-12 md:col-span-3">
            <p className="meta !text-ink/50">{settings.newsletterTitle}</p>
            <div className="mt-4">
              <NewsletterForm source="footer" compact />
            </div>
            <ul className="mt-8 flex flex-wrap gap-2">
              {(settings.social ?? []).map((s) => (
                <li key={s.url}>
                  <a
                    href={s.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={NETWORK_LABEL[s.network] ?? s.network}
                    className="grid h-10 w-10 place-items-center rounded-full border border-ink/20 text-ink/85 transition-colors hover:border-ink hover:text-ink"
                  >
                    <SocialIcon network={s.network} />
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/rss.xml"
                  aria-label="RSS feed"
                  className="grid h-10 w-10 place-items-center rounded-full border border-ink/20 text-ink/85 transition-colors hover:border-ink hover:text-ink"
                >
                  <RssIcon />
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-ink/15 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="meta !text-ink/50">
            © {year} {settings.title}. All rights reserved.
          </p>
          <ul className="flex flex-wrap gap-x-6 gap-y-2">
            <li>
              <Link href="/privacy-policy" className="meta !text-ink/60 hover:!text-ink">
                Privacy policy
              </Link>
            </li>
            <li>
              <ConsentLink className="meta !text-ink/60 hover:!text-ink" />
            </li>
            <li>
              <a href="/rss.xml" className="meta !text-ink/60 hover:!text-ink">
                RSS
              </a>
            </li>
          </ul>
          <CodeSiteCredit />
        </div>
      </div>
    </footer>
  )
}
