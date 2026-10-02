import type {Metadata} from 'next'

import {imageUrl} from './sanity/image'
import type {SanityImage, Seo} from './sanity/types'

export const SITE_NAME = 'Cambridge Radar'

/** Staging/preview deployments set NEXT_PUBLIC_NOINDEX=1 so they never compete with the live site. */
export const NOINDEX = process.env.NEXT_PUBLIC_NOINDEX === '1'

/** Generated brand card (app/opengraph-image.tsx) for pages without an image. */
const DEFAULT_OG = {url: '/opengraph-image', width: 1200, height: 630, alt: `${SITE_NAME} — Signals of What’s Next`}

/**
 * Page metadata with SEO overrides from Sanity and sensible fallbacks.
 * Every page gets title, description, canonical, Open Graph (with an image)
 * and a Twitter card. Titles that already carry the brand (Yoast imports)
 * are used as is instead of getting " — Cambridge Radar" appended twice.
 */
export function buildMetadata({
  title,
  description,
  path,
  seo,
  image,
  type = 'website',
  extra,
}: {
  title: string
  description?: string
  path: string
  seo?: Seo | null
  image?: SanityImage | null
  type?: 'website' | 'article' | 'profile'
  extra?: Partial<Metadata>
}): Metadata {
  const metaTitle = seo?.title || title
  const metaDescription = seo?.description || description
  const og = imageUrl(seo?.image ?? image, 1200, 630)
  const images = og ? [{url: og, width: 1200, height: 630, alt: metaTitle}] : [DEFAULT_OG]
  const branded = metaTitle.includes(SITE_NAME)
  return {
    title: branded ? {absolute: metaTitle} : metaTitle,
    description: metaDescription,
    alternates: {canonical: path},
    robots: NOINDEX || seo?.noIndex ? {index: false, follow: !NOINDEX} : undefined,
    openGraph: {
      type,
      siteName: SITE_NAME,
      locale: 'en_GB',
      title: metaTitle,
      description: metaDescription,
      url: path,
      images,
    },
    twitter: {card: 'summary_large_image', title: metaTitle, description: metaDescription, images: images.map((i) => i.url)},
    ...extra,
  }
}
