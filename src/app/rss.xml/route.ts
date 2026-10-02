import {getSettings} from '@/lib/data'
import {CONTENT_TAG, sanityFetch} from '@/lib/sanity/client'
import {imageUrl} from '@/lib/sanity/image'
import {feedQuery} from '@/lib/sanity/queries'
import type {PostCard} from '@/lib/sanity/types'
import {absolute, postPath, SITE_URL} from '@/lib/utils'

export const revalidate = 3600

const esc = (s = '') =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;')

export async function GET() {
  const [settings, posts] = await Promise.all([getSettings(), sanityFetch<(PostCard & {body?: string})[]>(feedQuery)])

  const items = posts
    .map((p) => {
      const url = absolute(postPath(p))
      const img = imageUrl(p.mainImage, 1200)
      return `
    <item>
      <title>${esc(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      ${p.author ? `<dc:creator>${esc(p.author.name)}</dc:creator>` : ''}
      ${p.section ? `<category>${esc(p.section.title)}</category>` : ''}
      <description>${esc(p.excerpt ?? p.body?.slice(0, 400) ?? '')}</description>
      ${img ? `<media:content url="${esc(img)}" medium="image" />` : ''}
    </item>`
    })
    .join('')

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${esc(settings.title)}</title>
    <link>${SITE_URL}</link>
    <description>${esc(settings.description ?? settings.tagline ?? '')}</description>
    <language>en-gb</language>
    <atom:link href="${absolute('/rss.xml')}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=3600, stale-while-revalidate=86400',
      'X-Content-Tag': CONTENT_TAG,
    },
  })
}
