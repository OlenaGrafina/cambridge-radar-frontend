import type {Metadata} from 'next'
import {PortableText} from '@portabletext/react'
import {notFound} from 'next/navigation'

import {NETWORK_LABEL, SocialIcon} from '@/components/icons'
import {SanityImg} from '@/components/media/SanityImg'
import {Reveal} from '@/components/motion/Reveal'
import {JsonLd} from '@/components/seo/JsonLd'
import {SectionHeading} from '@/components/story/SectionHeading'
import {StoryRow} from '@/components/story/Story'
import {sanityFetch} from '@/lib/sanity/client'
import {imageUrl} from '@/lib/sanity/image'
import {authorQuery, authorSlugsQuery} from '@/lib/sanity/queries'
import type {Author, PostCard} from '@/lib/sanity/types'
import {buildMetadata} from '@/lib/seo'
import {absolute, initials, pad, SITE_URL} from '@/lib/utils'

type Params = {params: Promise<{slug: string}>}
type AuthorPage = Author & {posts: PostCard[]}

const getAuthor = (slug: string) => sanityFetch<AuthorPage | null>(authorQuery, {slug})

export async function generateStaticParams() {
  const slugs = await sanityFetch<string[]>(authorSlugsQuery).catch(() => [])
  return slugs.map((slug) => ({slug}))
}

export async function generateMetadata({params}: Params): Promise<Metadata> {
  const {slug} = await params
  const a = await getAuthor(slug)
  if (!a) return {}
  return buildMetadata({
    title: a.name,
    description: a.shortBio || [a.role, a.expertise].filter(Boolean).join('. '),
    path: `/authors/${a.slug}`,
    seo: a.seo,
    image: a.photo,
    type: 'profile',
  })
}

export default async function AuthorPage({params}: Params) {
  const {slug} = await params
  const author = await getAuthor(slug)
  if (!author) notFound()
  const posts = author.posts ?? []

  return (
    <div className="shell">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          mainEntity: {
            '@type': 'Person',
            name: author.name,
            url: absolute(`/authors/${author.slug}`),
            jobTitle: author.role,
            description: author.shortBio,
            ...(author.photo ? {image: imageUrl(author.photo, 800)} : {}),
            sameAs: (author.links ?? []).map((l) => l.url),
            worksFor: {'@id': `${SITE_URL}/#organization`},
          },
        }}
      />

      <header className="grid-12 gap-y-10 pt-page pb-block">
        <div className="rise col-span-12 sm:col-span-6 md:col-span-4 lg:col-span-3">
          {author.photo?.asset ? (
            <SanityImg image={author.photo} ratio={4 / 5} priority sizes="(min-width: 768px) 25vw, 100vw" alt={author.name} />
          ) : (
            <div className="frame grid aspect-[4/5] place-items-center">
              <span className="t-display text-muted">{initials(author.name)}</span>
            </div>
          )}
        </div>
        <div className="rise col-span-12 md:col-span-8 lg:col-span-8 lg:col-start-5" style={{'--i': 1} as React.CSSProperties}>
          <p className="meta">{author.isEditorial ? 'Editorial' : 'Contributor'}</p>
          <h1 className="t-h1 mt-4">{author.name}</h1>
          {author.role && <p className="t-ui mt-4 text-ink">{author.role}</p>}
          {author.expertise && <p className="t-ui-sm mt-1 text-muted">{author.expertise}</p>}

          <div className="mt-8 border-t border-rule pt-6">
            {author.bio?.length ? (
              <div className="prose-small max-w-measure">
                <PortableText value={author.bio} />
              </div>
            ) : (
              author.shortBio && <p className="prose-small max-w-measure">{author.shortBio}</p>
            )}
          </div>

          {author.links && author.links.length > 0 && (
            <ul className="mt-8 flex flex-wrap gap-2">
              {author.links.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !h-10 !px-4">
                    <SocialIcon network={l.network} size={15} />
                    {NETWORK_LABEL[l.network] ?? l.network}
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </header>

      <section aria-label={`Articles by ${author.name}`}>
        <SectionHeading title="Articles" index={pad(posts.length)} className="mb-2" />
        {posts.length ? (
          <ul className="divide-y divide-rule">
            {posts.map((post, i) => (
              <Reveal as="li" key={post._id} index={i % 3} className="py-6">
                <StoryRow post={post} showExcerpt />
              </Reveal>
            ))}
          </ul>
        ) : (
          <p className="t-lead py-block text-muted">No published articles yet.</p>
        )}
      </section>
    </div>
  )
}
