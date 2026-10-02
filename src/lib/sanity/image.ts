import {createImageUrlBuilder} from '@sanity/image-url'

import type {SanityImage} from './types'

const builder = createImageUrlBuilder({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'polcbwiw',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
})

/**
 * Base CDN URL for an image: editor crop applied, hotspot as focal point.
 * Width/height are added later by the next/image loader; `ratio` is passed
 * through as `ar` so the loader can crop to that aspect at any width.
 */
export function imageSrc(image: SanityImage | null | undefined, ratio?: number) {
  if (!image?.asset?._ref && !image?.asset?._id) return null
  let b = builder.image(image)
  if (ratio) {
    b = b.fit('crop').crop('focalpoint')
    if (image.hotspot) b = b.focalPoint(image.hotspot.x, image.hotspot.y)
  }
  const url = new URL(b.url())
  if (ratio) url.searchParams.set('ar', ratio.toFixed(4))
  return url.toString()
}

/** Absolute URL at a fixed size — for Open Graph, RSS, JSON-LD and emails. */
export function imageUrl(image: SanityImage | null | undefined, width = 1200, height?: number) {
  if (!image?.asset?._ref && !image?.asset?._id) return null
  let b = builder.image(image).width(width).auto('format').quality(80)
  if (height) {
    b = b.height(height).fit('crop').crop('focalpoint')
    if (image.hotspot) b = b.focalPoint(image.hotspot.x, image.hotspot.y)
  }
  return b.url()
}

/** Natural aspect ratio from asset metadata (dimensions are fetched in GROQ). */
export function naturalRatio(image: SanityImage | null | undefined, fallback = 3 / 2) {
  const d = image?.asset?.metadata?.dimensions
  if (!d?.width || !d?.height) return fallback
  return d.width / d.height
}
