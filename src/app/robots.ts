import type {MetadataRoute} from 'next'

import {absolute} from '@/lib/utils'
import {NOINDEX} from '@/lib/seo'

/**
 * Unlike the old site, nothing the renderer needs (CSS, JS, images) is
 * blocked. AI crawlers are welcome: the publication wants to be cited.
 * Preview deployments (NEXT_PUBLIC_NOINDEX=1) block everything.
 */
export default function robots(): MetadataRoute.Robots {
  if (NOINDEX) return {rules: [{userAgent: '*', disallow: '/'}]}
  return {
    rules: [{userAgent: '*', allow: '/', disallow: ['/api/', '/search', '/subscription']}],
    sitemap: absolute('/sitemap.xml'),
    host: absolute('/'),
  }
}
