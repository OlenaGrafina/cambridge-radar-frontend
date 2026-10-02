import Image from 'next/image'

import {imageSrc, naturalRatio} from '@/lib/sanity/image'
import type {SanityImage} from '@/lib/sanity/types'
import {cn} from '@/lib/utils'

type Props = {
  image?: SanityImage | null
  /** Width / height. Omit to keep the natural ratio. */
  ratio?: number
  sizes: string
  alt?: string
  priority?: boolean
  className?: string
  imgClassName?: string
}

/**
 * Responsive Sanity image: CDN-resized srcset, AVIF/WebP, the editor's crop
 * and hotspot, and the blurred LQIP from asset metadata while it loads.
 * The frame reserves its space, so nothing shifts when the image arrives.
 */
export function SanityImg({image, ratio, sizes, alt, priority = false, className, imgClassName}: Props) {
  const r = ratio ?? naturalRatio(image)
  const src = imageSrc(image, ratio)
  const lqip = image?.asset?.metadata?.lqip

  return (
    <div className={cn('frame', className)} style={{aspectRatio: r}}>
      {src ? (
        <Image
          src={src}
          alt={alt ?? image?.alt ?? ''}
          fill
          sizes={sizes}
          priority={priority}
          placeholder={lqip ? 'blur' : 'empty'}
          blurDataURL={lqip}
          className={cn('object-cover', imgClassName)}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center">
          <span className="meta">Cambridge Radar</span>
        </div>
      )}
    </div>
  )
}
