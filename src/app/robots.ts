import type {MetadataRoute} from 'next'

import {absolute} from '@/lib/utils'

/** Unlike the old site, nothing the renderer needs (CSS, JS, images) is blocked. */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{userAgent: '*', allow: '/', disallow: ['/api/', '/search']}],
    sitemap: absolute('/sitemap.xml'),
  }
}
