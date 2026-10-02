'use client'

type LoaderArgs = {src: string; width: number; quality?: number}

/**
 * next/image loader. Sanity's CDN resizes and converts to AVIF/WebP on the
 * fly, so the app never runs its own image optimiser (nothing to pay for on
 * Cloudflare, and the logo no longer ships at 10 902 px).
 *
 * `ar` is our own marker set by `imageSrc()`: the aspect ratio to crop to.
 * It is turned into a height here, because only the loader knows the width.
 */
export default function sanityImageLoader({src, width, quality}: LoaderArgs) {
  if (!src.startsWith('https://cdn.sanity.io/')) return src
  const url = new URL(src)
  const ratio = Number(url.searchParams.get('ar'))
  url.searchParams.delete('ar')
  url.searchParams.set('w', String(width))
  if (ratio > 0) {
    url.searchParams.set('h', String(Math.round(width / ratio)))
    url.searchParams.set('fit', 'crop')
  } else if (!url.searchParams.has('fit')) {
    url.searchParams.set('fit', 'max')
  }
  url.searchParams.set('q', String(quality ?? 72))
  url.searchParams.set('auto', 'format')
  return url.toString()
}
