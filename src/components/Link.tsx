'use client'

import NextLink from 'next/link'
import {type ComponentProps, useState} from 'react'

/**
 * next/link that prefetches on hover or touch, not when it scrolls into view.
 * The home page alone shows ~40 links; prefetching them all cost ~40 Vercel
 * requests per visit, which the Hobby plan's monthly limits can't carry.
 */
export default function Link({onMouseEnter, onTouchStart, onFocus, ...props}: ComponentProps<typeof NextLink>) {
  const [active, setActive] = useState(false)
  return (
    <NextLink
      {...props}
      prefetch={active ? null : false}
      onMouseEnter={(e) => {
        setActive(true)
        onMouseEnter?.(e)
      }}
      onTouchStart={(e) => {
        setActive(true)
        onTouchStart?.(e)
      }}
      onFocus={(e) => {
        setActive(true)
        onFocus?.(e)
      }}
    />
  )
}
