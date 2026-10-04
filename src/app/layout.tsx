import type {Metadata, Viewport} from 'next'
import {Geist, Geist_Mono, Newsreader} from 'next/font/google'

import {GlobalTracker} from '@/components/analytics/GlobalTracker'
import {FloatingControls} from '@/components/layout/FloatingControls'
import {SearchOverlay} from '@/components/layout/SearchOverlay'
import {ConsentManager} from '@/components/consent/ConsentManager'
import {RevealObserver} from '@/components/motion/RevealObserver'
import {Footer} from '@/components/layout/Footer'
import {Header} from '@/components/layout/Header'
import {JsonLd} from '@/components/seo/JsonLd'
import {getSettings} from '@/lib/data'
import {imageUrl} from '@/lib/sanity/image'
import {NOINDEX} from '@/lib/seo'
import {SITE_URL} from '@/lib/utils'

import './globals.css'

// Weight axis only: the optical-size axis doubled the files. The italic is a
// separate face that is not preloaded — it is only needed inside body text.
const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal'],
  variable: '--font-newsreader',
  display: 'swap',
})

const newsreaderItalic = Newsreader({
  subsets: ['latin'],
  style: ['italic'],
  variable: '--font-newsreader-italic',
  display: 'swap',
  preload: false,
})

const geist = Geist({subsets: ['latin'], variable: '--font-geist', display: 'swap'})

const geistMono = Geist_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-geist-mono',
  display: 'swap',
})

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings()
  const og = imageUrl(s.ogImage, 1200, 630)
  return {
    metadataBase: new URL(SITE_URL),
    title: {default: `${s.title} — ${s.tagline ?? ''}`.replace(/ — $/, ''), template: `%s — ${s.title}`},
    description: s.description,
    applicationName: s.title,
    alternates: {
      canonical: '/',
      types: {'application/rss+xml': [{url: '/rss.xml', title: s.title}]},
    },
    openGraph: {
      type: 'website',
      siteName: s.title,
      locale: 'en_GB',
      ...(og ? {images: [{url: og, width: 1200, height: 630}]} : {}),
    },
    twitter: {card: 'summary_large_image'},
    verification: {
      ...(s.googleVerification ? {google: s.googleVerification} : {}),
      ...(s.bingVerification ? {other: {'msvalidate.01': s.bingVerification}} : {}),
    },
    formatDetection: {telephone: false},
    ...(NOINDEX ? {robots: {index: false, follow: false}} : {}),
  }
}

export const viewport: Viewport = {
  themeColor: [
    {media: '(prefers-color-scheme: light)', color: '#ffffff'},
    {media: '(prefers-color-scheme: dark)', color: '#0c0c0d'},
  ],
  colorScheme: 'light dark',
  // Safari 26 (Liquid Glass): without cover it leaves a blank band between
  // the page and the glass address bar.
  viewportFit: 'cover',
}

/**
 * Runs before first paint: applies the saved theme so night mode never
 * flashes white. Kept tiny and dependency-free on purpose.
 * Also flags the browser's own forced dark mode (Samsung Internet, Chrome
 * "dark mode for web contents"): it darkens the light theme with no opt-out,
 * and `canvas` in a light color-scheme then stops being white.
 */
const themeScript = `(function(){var r=document.documentElement;try{var t=localStorage.getItem('cr-theme');if(t==='light'||t==='dark'){r.dataset.theme=t}}catch(e){}try{var d=document.createElement('div');d.style.cssText='display:none;background-color:canvas;color-scheme:light';r.appendChild(d);if(getComputedStyle(d).backgroundColor!=='rgb(255, 255, 255)'){r.dataset.forcedDark=''}d.remove()}catch(e){}})()`

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const settings = await getSettings()
  const sameAs = (settings.social ?? []).map((s) => s.url)

  return (
    <html
      lang="en-GB"
      className={`${newsreader.variable} ${newsreaderItalic.variable} ${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{__html: themeScript}} />
        {/* Every image comes from Sanity's CDN: open the connection during HTML parse. */}
        <link rel="preconnect" href="https://cdn.sanity.io" />
        <link rel="dns-prefetch" href="https://cdn.sanity.io" />
        <noscript>
          <style>{'.reveal{opacity:1!important;transform:none!important}'}</style>
        </noscript>
      </head>
      <body className="flex min-h-dvh flex-col">
        <a
          href="#main"
          className="btn btn-ink sr-only z-50 focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <Header settings={settings} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer settings={settings} />
        <ConsentManager gaId={settings.gaId} clarityId={settings.clarityId} gtmId={settings.gtmId} />
        <GlobalTracker />
        <SearchOverlay />
        <FloatingControls newsletterTitle={settings.newsletterTitle} newsletterText={settings.newsletterText} />
        <RevealObserver />
        <JsonLd
          data={[
            {
              '@context': 'https://schema.org',
              '@type': 'NewsMediaOrganization',
              '@id': `${SITE_URL}/#organization`,
              name: settings.title,
              url: SITE_URL,
              ...(settings.logo ? {logo: imageUrl(settings.logo, 600)} : {}),
              ...(sameAs.length ? {sameAs} : {}),
              ...(settings.contactEmail ? {email: settings.contactEmail} : {}),
            },
            {
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': `${SITE_URL}/#website`,
              name: settings.title,
              url: SITE_URL,
              publisher: {'@id': `${SITE_URL}/#organization`},
              potentialAction: {
                '@type': 'SearchAction',
                target: {'@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={query}`},
                'query-input': 'required name=query',
              },
            },
          ]}
        />
      </body>
    </html>
  )
}
