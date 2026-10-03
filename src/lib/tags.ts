import {sanityFetch} from '@/lib/sanity/client'
import {tagListQuery, tagPostsQuery} from '@/lib/sanity/queries'
import type {PostCard, Section} from '@/lib/sanity/types'
import {slugify} from '@/lib/utils'

/**
 * Every tag in use, keyed by its URL slug (/tag/<slug>, as on the original).
 * Spellings that share a slug ("leadership", "Leadership") share one page.
 */
export async function getTags() {
  const tags = await sanityFetch<(string | null)[]>(tagListQuery).catch(() => [])
  const bySlug = new Map<string, string[]>()
  for (const tag of tags) {
    if (!tag) continue
    const slug = slugify(tag)
    if (slug) bySlug.set(slug, [...(bySlug.get(slug) ?? []), tag])
  }
  return bySlug
}

export async function getTagArchive(slug: string) {
  const names = (await getTags()).get(slug)
  if (!names?.length) return null
  const name = names[0]
  const posts = await sanityFetch<PostCard[]>(tagPostsQuery, {tagNames: names})
  const section: Section = {_id: `tag:${slug}`, title: `Tag: ${name}`, slug: `tag/${slug}`, crumb: name}
  return {name, posts, section}
}
