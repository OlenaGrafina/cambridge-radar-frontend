import type {Metadata, Viewport} from 'next'
import {Geist, Geist_Mono, Newsreader} from 'next/font/google'

import {ConsentManager} from '@/components/consent/ConsentManager'
import {Footer} from '@/components/layout/Footer'
import {Header} from '@/components/layout/Header'
import {JsonLd} from '@/components/seo/JsonLd'
import {getSettings} from '@/lib/data'
import {imageUrl} from '@/lib/sanity/image'
import {SITE_URL} from '@/lib/utils'

import './globals.css'

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  axes: ['opsz'],
  variable: '--font-newsreader',
  display: 'swap',
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
  }
}

export const viewport: Viewport = {
  themeColor: [
    {media: '(prefers-color-scheme: light)', color: '#ffffff'},
    {media: '(prefers-color-scheme: dark)', color: '#0c0c0d'},
  ],
  colorScheme: 'light dark',
}

/**
 * Runs before first paint: applies the saved theme so night mode never
 * flashes white. Kept tiny and dependency-free on purpose.
 */
const themeScript = `(function(){try{var t=localStorage.getItem('cr-theme');if(t==='light'||t==='dark'){document.documentElement.dataset.theme=t}}catch(e){}})()`

export default async function RootLayout({children}: {children: React.ReactNode}) {
  const settings = await getSettings()
  const sameAs = (settings.social ?? []).map((s) => s.url)

  return (
    <html
      lang="en-GB"
      className={`${newsreader.variable} ${geist.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <script dangerouslySetInnerHTML={{__html: themeScript}} />
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
        <ConsentManager gaId={settings.gaId} clarityId={settings.clarityId} />
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
