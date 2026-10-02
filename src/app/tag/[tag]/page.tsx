import type {Metadata} from 'next'
import {notFound} from 'next/navigation'

import {PAGE_SIZE, SectionView} from '@/components/section/SectionView'
import {buildMetadata} from '@/lib/seo'
import {getTagArchive, getTags} from '@/lib/tags'

type Params = {params: Promise<{tag: string}>}

export async function generateStaticParams() {
  return [...(await getTags()).keys()].map((tag) => ({tag}))
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
