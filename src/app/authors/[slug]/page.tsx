import type {Metadata} from 'next'
import {PortableText} from '@portabletext/react'
import {notFound} from 'next/navigation'

import {PrevNext} from '@/components/article/PostNav'
import {Share} from '@/components/article/Share'
import {NewsletterForm} from '@/components/forms/NewsletterForm'
import {NETWORK_LABEL, SocialIcon} from '@/components/icons'
import {SanityImg} from '@/components/media/SanityImg'
import {Reveal} from '@/components/motion/Reveal'
import {JsonLd} from '@/components/seo/JsonLd'
import {SectionHeading} from '@/components/story/SectionHeading'
import {StoryRow} from '@/components/story/Story'
import {getSettings} from '@/lib/data'
import {sanityFetch} from '@/lib/sanity/client'
import {imageUrl} from '@/lib/sanity/image'
import {authorQuery, authorSlugsQuery} from '@/lib/sanity/queries'
import type {Author, PostCard} from '@/lib/sanity/types'
import {buildMetadata} from '@/lib/seo'
import {absolute, initials, SITE_URL} from '@/lib/utils'

type Params = {params: Promise<{slug: string}>}
type AuthorPage = Author & {
  posts: PostCard[]
  prevProfile?: {name: string; slug: string} | null
  nextProfile?: {name: string; slug: string} | null
}

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
  const subtitle = author.subtitle || author.profileCategories?.join(', ')
  const url = absolute(`/authors/${author.slug}`)
  const settings = await getSettings()

  const details: [string, string | undefined][] = [
    ['Country', author.country],
    ['Industry', author.industry],
    ['Skills', author.skills?.join(', ')],
    ['Categories', author.profileCategories?.join(', ')],
  ]

  return (
    <div className="shell">
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'ProfilePage',
          mainEntity: {
            '@type': 'Person',
            name: author.name,
            url,
            jobTitle: author.role,
            description: author.shortBio,
            ...(author.photo ? {image: imageUrl(author.photo, 800)} : {}),
            ...(author.country ? {nationality: author.country} : {}),
            ...(author.skills?.length ? {knowsAbout: author.skills} : {}),
            sameAs: (author.links ?? []).map((l) => l.url),
            worksFor: {'@id': `${SITE_URL}/#organization`},
          },
        }}
      />

      {/* Name first; on phones the portrait and details follow it, on desktop they sit in the right column. */}
      <div className="grid-12 gap-y-block pt-page lg:grid-rows-[auto_1fr]">
        <div className="col-span-12 lg:col-span-8">
          <header className="rise">
            {subtitle && <p className="meta">{subtitle}</p>}
            <h1 className="t-h1 mt-4">{author.name}</h1>
            {author.role && <p className="t-ui mt-4 text-ink">{author.role}</p>}
            {author.expertise && <p className="t-ui-sm mt-1 text-muted">{author.expertise}</p>}
          </header>
        </div>

        {/* Right: portrait, profile details, share */}
        <aside className="col-span-12 lg:col-span-4 lg:col-start-9 lg:row-span-2 lg:row-start-1">
          <div className="space-y-8">
            {author.photo?.asset ? (
              <div className="rise" style={{'--i': 1} as React.CSSProperties}>
                <SanityImg image={author.photo} ratio={4 / 5} priority sizes="(min-width: 1024px) 30vw, 100vw" alt={author.name} />
              </div>
            ) : (
              <div className="frame grid aspect-[4/5] place-items-center">
                <span className="t-display text-muted">{initials(author.name)}</span>
              </div>
            )}

            <section aria-labelledby="profile-details">
              <h2 id="profile-details" className="kicker border-t-2 border-rule-strong pt-3">
                Profile details
              </h2>
              <dl className="mt-2 divide-y divide-rule">
                {details
                  .filter(([, v]) => v)
                  .map(([k, v]) => (
                    <div key={k} className="grid grid-cols-[6rem_1fr] gap-3 py-3">
                      <dt className="meta pt-[0.2em]">{k}</dt>
                      <dd className="t-ui-sm text-ink-2">{v}</dd>
                    </div>
                  ))}
              </dl>
              {author.links && author.links.length > 0 && (
                <ul className="mt-4 flex flex-wrap gap-2">
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
            </section>

            <section aria-labelledby="share-profile">
              <h2 id="share-profile" className="kicker border-t border-rule pt-3">
                Like this profile?
              </h2>
              <Share className="mt-4" url={url} title={author.name} image={imageUrl(author.photo, 1000)} />
            </section>
          </div>
        </aside>
        {/* Bio, published content, subscribe */}
        <div className="col-span-12 lg:col-span-8 lg:col-start-1">
          <div className="border-t border-rule pt-6">
            {author.bio?.length ? (
              <div className="prose-small max-w-measure">
                <PortableText value={author.bio} />
              </div>
            ) : (
              author.shortBio && <p className="prose-small max-w-measure">{author.shortBio}</p>
            )}
          </div>

          <section aria-label="Published content" className="mt-block">
            <SectionHeading title="Published content" className="mb-2" />
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

          <aside aria-label="Newsletter" className="mt-block border border-rule-strong p-6 md:p-8">
            <p className="t-h3">{settings.newsletterTitle}</p>
            {settings.newsletterText && <p className="t-body-sm mt-2 text-ink-2">{settings.newsletterText}</p>}
            <div className="mt-6">
              <NewsletterForm source={`author:${author.slug}`} />
            </div>
          </aside>
        </div>
      </div>

      <PrevNext
        className="mt-section"
        prevLabel="Previous Profiles"
        nextLabel="Next Profiles"
        prev={author.prevProfile ? {title: author.prevProfile.name, href: `/authors/${author.prevProfile.slug}`} : null}
        next={author.nextProfile ? {title: author.nextProfile.name, href: `/authors/${author.nextProfile.slug}`} : null}
      />
    </div>
  )
}
