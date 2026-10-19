import {notFound} from 'next/navigation'

/**
 * src/proxy.ts rewrites addresses that match no content here. Rendered per
 * request, so a bot probing thousands of made-up URLs gets the normal 404 page
 * without each one being stored in Vercel's ISR cache (a write per URL).
 */
export const dynamic = 'force-dynamic'

export default function Missing() {
  notFound()
}
