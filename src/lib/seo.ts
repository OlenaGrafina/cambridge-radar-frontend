import type {Metadata} from 'next'

import {imageUrl} from './sanity/image'
import type {SanityImage, Seo} from './sanity/types'

/** Page metadata with SEO overrides from Sanity and sensible fallbacks. */
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
  return {
    title: metaTitle,
    description: metaDescription,
    alternates: {canonical: path},
    robots: seo?.noIndex ? {index: false, follow: true} : undefined,
    openGraph: {
      type,
      title: metaTitle,
      description: metaDescription,
      url: path,
      ...(og ? {images: [{url: og, width: 1200, height: 630}]} : {}),
    },
    twitter: {card: 'summary_large_image', title: metaTitle, description: metaDescription},
    ...extra,
  }
}
