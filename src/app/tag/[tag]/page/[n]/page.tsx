import type {Metadata} from 'next'
import {notFound, permanentRedirect} from 'next/navigation'

import {PAGE_SIZE, SectionView} from '@/components/section/SectionView'
import {buildMetadata} from '@/lib/seo'
import {getTagArchive} from '@/lib/tags'

type Params = {params: Promise<{tag: string; n: string}>}

export async function generateMetadata({params}: Params): Promise<Metadata> {
  const {tag, n} = await params
  const archive = await getTagArchive(tag)
  if (!archive) return {}
  return buildMetadata({title: `${archive.name} Archives — page ${n}`, path: `/tag/${tag}/page/${n}`})
}

export default async function TagPaged({params}: Params) {
  const {tag, n} = await params
  const page = Number(n)
  if (!Number.isInteger(page) || page < 1) notFound()
  if (page === 1) permanentRedirect(`/tag/${tag}`)
  const archive = await getTagArchive(tag)
  if (!archive) notFound()
  const from = (page - 1) * PAGE_SIZE
  const posts = archive.posts.slice(from, from + PAGE_SIZE)
  if (!posts.length) notFound()
  return <SectionView section={archive.section} posts={posts} page={page} total={archive.posts.length} />
}
