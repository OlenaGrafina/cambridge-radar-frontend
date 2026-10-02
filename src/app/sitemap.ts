import type {MetadataRoute} from 'next'

import {sanityFetch} from '@/lib/sanity/client'
import {sitemapQuery} from '@/lib/sanity/queries'
import {getTags} from '@/lib/tags'
import {absolute} from '@/lib/utils'

type Row = {slug: string; _updatedAt?: string; updated?: string; section?: string; noIndex?: boolean}
type Data = {posts: Row[]; sections: Row[]; pages: Row[]; authors: Row[]; series: Row[]}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [d, tags] = await Promise.all([sanityFetch<Data>(sitemapQuery), getTags()])
  const at = (r: Row) => (r.updated ?? r._updatedAt ? new Date((r.updated ?? r._updatedAt)!) : undefined)
  return [
    {url: absolute('/'), changeFrequency: 'daily', priority: 1},
    ...d.sections.map((r) => ({url: absolute(`/${r.slug}`), lastModified: at(r), changeFrequency: 'weekly' as const, priority: 0.7})),
    ...d.posts
      .filter((r) => !r.noIndex && r.section)
      .map((r) => ({url: absolute(`/${r.section}/${r.slug}`), lastModified: at(r), changeFrequency: 'monthly' as const, priority: 0.8})),
    {url: absolute('/authors'), changeFrequency: 'monthly', priority: 0.5},
    ...d.authors.map((r) => ({url: absolute(`/authors/${r.slug}`), lastModified: at(r), priority: 0.5})),
    ...d.series.map((r) => ({url: absolute(`/series/${r.slug}`), lastModified: at(r), priority: 0.5})),
    ...d.pages.filter((r) => !r.noIndex).map((r) => ({url: absolute(`/${r.slug}`), lastModified: at(r), priority: 0.4})),
    {url: absolute('/all'), changeFrequency: 'daily', priority: 0.6},
    ...[...tags.keys()].map((slug) => ({url: absolute(`/tag/${slug}`), priority: 0.3})),
  ]
}
