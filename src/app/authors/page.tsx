import type {Metadata} from 'next'
import Link from 'next/link'

import {Share} from '@/components/article/Share'
import {NETWORK_LABEL, SocialIcon} from '@/components/icons'
import {PageHeader} from '@/components/layout/PageHeader'
import {SanityImg} from '@/components/media/SanityImg'
import {Reveal} from '@/components/motion/Reveal'
import {LatestArticles} from '@/components/sidebar/LatestArticles'
import {sanityFetch} from '@/lib/sanity/client'
import {authorsQuery} from '@/lib/sanity/queries'
import type {Author} from '@/lib/sanity/types'
import {buildMetadata} from '@/lib/seo'
import {absolute, initials} from '@/lib/utils'

type AuthorListItem = Author & {count: number}

export const metadata: Metadata = buildMetadata({
  title: 'Cambridge Radar Authors | Expert Voices & Contributors',
  description:
    'Meet the authors and contributors behind Cambridge Radar: expert voices exploring leadership, AI, business and global affairs.',
  path: '/authors',
})

/**
 * Authors — the original profiles grid: photo, name, subtitle, social
 * icons and a short bio per card, "Latest Articles" alongside, sharing below.
 * The editor-in-chief opens the page in a wider card, same photo size.
 */
export default async function AuthorsPage() {
  const authors = await sanityFetch<AuthorListItem[]>(authorsQuery)
  const editorial = authors.filter((a) => a.isEditorial)
  const others = authors.filter((a) => !a.isEditorial)

  return (
    <div className="shell">
      <PageHeader crumbs={[{label: 'Home', href: '/'}, {label: 'Authors'}]} title="Authors" />

      <div className="grid-12 gap-y-section">
        <div className="col-span-12 lg:col-span-8">
          {editorial.map((a) => (
            <article key={a._id} className="group mb-14 grid grid-cols-2 gap-x-col gap-y-6 border-b border-rule pb-14 md:grid-cols-3">
              <Link href={`/authors/${a.slug}`} tabIndex={-1} aria-hidden="true">
                <Portrait author={a} sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 50vw" />
              </Link>
              <div className="col-span-2 self-end">
                <Card author={a} large />
              </div>
            </article>
          ))}

          <ul className="grid grid-cols-1 gap-x-col gap-y-14 sm:grid-cols-2 md:grid-cols-3">
            {others.map((a, i) => (
              <Reveal as="li" key={a._id} index={i % 3}>
                <article className="group">
                  <Link href={`/authors/${a.slug}`} tabIndex={-1} aria-hidden="true">
                    <Portrait author={a} sizes="(min-width: 1024px) 18vw, (min-width: 640px) 33vw, 100vw" />
                  </Link>
                  <div className="mt-4">
                    <Card author={a} />
                  </div>
                </article>
              </Reveal>
            ))}
          </ul>

          <div className="mt-section flex flex-wrap items-center justify-between gap-4 border-y border-rule py-4">
            <p className="kicker">Share this:</p>
            <Share url={absolute('/authors')} title="Cambridge Radar Authors" />
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4 lg:border-l lg:border-rule lg:pl-rule">
          <LatestArticles />
        </aside>
      </div>
    </div>
  )
}

function Card({author, large = false}: {author: AuthorListItem; large?: boolean}) {
  const subtitle = author.subtitle || author.profileCategories?.join(', ')
  return (
    <>
      {subtitle && <p className="meta">{subtitle}</p>}
      <h2 className={large ? 't-h2 mt-2' : 't-h4 mt-2'}>
        <Link href={`/authors/${author.slug}`} className="hover-line">
          {author.name}
        </Link>
      </h2>
      {(author.links ?? []).length > 0 && (
        <ul className="mt-3 flex gap-1.5" aria-label={`${author.name} on social media`}>
          {(author.links ?? []).map((l) => (
            <li key={l.url}>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="icon-btn !h-8 !w-8"
                aria-label={`${author.name} on ${NETWORK_LABEL[l.network] ?? l.network}`}
              >
                <SocialIcon network={l.network} size={13} />
              </a>
            </li>
          ))}
        </ul>
      )}
      {author.shortBio && <p className="t-body-sm mt-3 text-ink-2">{author.shortBio}</p>}
    </>
  )
}

function Portrait({author, sizes}: {author: Author; sizes: string}) {
  if (!author.photo?.asset) {
    return (
      <div className="frame grid aspect-square place-items-center">
        <span className="t-h2 text-muted">{initials(author.name)}</span>
      </div>
    )
  }
  return (
    <SanityImg
      image={author.photo}
      ratio={1}
      sizes={sizes}
      alt={author.name}
      imgClassName="grayscale transition-[filter,transform] duration-700 group-hover:grayscale-0"
    />
  )
}
