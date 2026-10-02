import {sanityFetch} from '@/lib/sanity/client'
import {tagListQuery, tagPostsQuery} from '@/lib/sanity/queries'
import type {PostCard, Section} from '@/lib/sanity/types'
import {slugify} from '@/lib/utils'

/** Every tag in use, keyed by its URL slug (/tag/<slug>, as on the original). */
export async function getTags() {
  const tags = await sanityFetch<string[]>(tagListQuery).catch(() => [])
  const bySlug = new Map<string, string>()
  for (const tag of tags) {
    const slug = slugify(tag)
    if (slug && !bySlug.has(slug)) bySlug.set(slug, tag)
  }
  return bySlug
}

export async function getTagArchive(slug: string) {
  const name = (await getTags()).get(slug)
  if (!name) return null
  const posts = await sanityFetch<PostCard[]>(tagPostsQuery, {tagName: name})
  const section: Section = {_id: `tag:${slug}`, title: `Tag: ${name}`, slug: `tag/${slug}`, crumb: name}
  return {name, posts, section}
}
