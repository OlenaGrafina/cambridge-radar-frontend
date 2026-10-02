import Image from 'next/image'

import {imageSrc} from '@/lib/sanity/image'
import type {SanityImage} from '@/lib/sanity/types'
import {cn} from '@/lib/utils'

/**
 * Masthead logo from Sanity, delivered at display size by the image CDN.
 * The source is black line art; night mode inverts it and blends away the
 * paper so it sits on the dark canvas without a box.
 */
export function Logo({
  logo,
  title,
  height,
  priority = false,
  className,
}: {
  logo?: SanityImage | null
  title: string
  height: number
  priority?: boolean
  className?: string
}) {
  const src = imageSrc(logo)
  const d = logo?.asset?.metadata?.dimensions
  if (!src || !d) {
    return (
      <span className={cn('display block text-center uppercase tracking-[0.06em]', className)} style={{fontSize: height * 0.6}}>
        {title}
      </span>
    )
  }
  const width = Math.round((d.width / d.height) * height)
  return (
    <Image
      src={src}
      alt={title}
      width={width}
      height={height}
      priority={priority}
      sizes={`${width}px`}
      quality={90}
      className={cn('logo-art h-auto max-w-full', className)}
      style={{height: 'auto', width}}
    />
  )
}
