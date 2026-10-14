import Image from 'next/image'

import {cn} from '@/lib/utils'

/**
 * A picture that ships with the site (public/), in the same `.frame` as
 * SanityImg: it reserves its space, takes the dark-mode dimming and opens
 * like a shutter when its block is revealed. The image loader leaves local
 * paths alone, so the files in public/ are already sized for their slot.
 */
export function StaticImg({
  src,
  alt,
  ratio,
  sizes,
  priority = false,
  className,
  imgClassName,
}: {
  src: string
  alt: string
  /** Width / height of the frame. */
  ratio: number
  sizes: string
  priority?: boolean
  className?: string
  imgClassName?: string
}) {
  return (
    <div className={cn('frame', className)} style={{aspectRatio: ratio}}>
      <Image src={src} alt={alt} fill unoptimized sizes={sizes} priority={priority} className={cn('object-cover', imgClassName)} />
    </div>
  )
}
