import Image from 'next/image'

import {imageSrc} from '@/lib/sanity/image'
import type {SanityImage} from '@/lib/sanity/types'
import {cn} from '@/lib/utils'

/**
 * Masthead logo from Sanity, delivered at display size by the image CDN.
 * One image for all breakpoints (height set in CSS) so phones never fetch
 * the desktop size. The source is black line art; night mode inverts it and
 * blends away the paper so it sits on the dark canvas without a box.
 */
export function Logo({
  logo,
  title,
  height,
  mobileHeight,
  priority = false,
  className,
}: {
  logo?: SanityImage | null
  title: string
  height: number
  mobileHeight?: number
  priority?: boolean
  className?: string
}) {
  const src = imageSrc(logo)
  const d = logo?.asset?.metadata?.dimensions
  if (!src || !d) {
    return (
      <span className={cn('block font-serif text-center uppercase tracking-[0.06em]', className)} style={{fontSize: height * 0.6, lineHeight: 1}}>
        {title}
      </span>
    )
  }
  const ratio = d.width / d.height
  const width = Math.round(ratio * height)
  const small = mobileHeight ?? height
  const smallWidth = Math.round(ratio * small)
  return (
    <Image
      src={src}
      alt={title}
      width={width}
      height={height}
      priority={priority}
      sizes={mobileHeight ? `(min-width: 768px) ${width}px, ${smallWidth}px` : `${width}px`}
      quality={85}
      className={cn('logo-art', className)}
      style={
        {
          '--w': `${width}px`,
          '--w-sm': `${smallWidth}px`,
        } as React.CSSProperties
      }
    />
  )
}
