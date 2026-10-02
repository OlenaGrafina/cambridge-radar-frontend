import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {PAGE_SIZE, SectionView} from '@/components/section/SectionView'
import {buildMetadata} from '@/lib/seo'
import {getTagArchive} from '@/lib/tags'

type Params = {params: Promise<{tag: string}>}

// 130+ tags: built on first visit and cached like the rest (ISR), not all at build time.
export async function generateStaticParams() {
  return []
}

export async function generateMetadata({params}: Params): Promise<Metadata> {
  const {tag} = await params
  const archive = await getTagArchive(tag)
  if (!archive) return {}
  return buildMetadata({title: `${archive.name} Archives`, path: `/tag/${tag}`})
}

/** Tag archive — the original /tag/<slug>/ ("Tag: <name>"), on the section layout. */
export default async function TagPage({params}: Params) {
  const {tag} = await params
  const archive = await getTagArchive(tag)
  if (!archive) notFound()
  return <SectionView section={archive.section} posts={archive.posts.slice(0, PAGE_SIZE)} page={1} total={archive.posts.length} />
}
