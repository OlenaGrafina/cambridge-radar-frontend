import type {Metadata} from 'next'
import Link from 'next/link'

import {PageHeader} from '@/components/layout/PageHeader'
import {SanityImg} from '@/components/media/SanityImg'
import {Reveal} from '@/components/motion/Reveal'
import {sanityFetch} from '@/lib/sanity/client'
import {authorsQuery} from '@/lib/sanity/queries'
import type {Author} from '@/lib/sanity/types'
import {buildMetadata} from '@/lib/seo'
import {initials, pad} from '@/lib/utils'

type AuthorListItem = Author & {count: number}

export const metadata: Metadata = buildMetadata({
  title: 'Authors',
  description: 'The strategists, researchers and practitioners who write for Cambridge Radar.',
  path: '/authors',
})

export default async function AuthorsPage() {
  const authors = await sanityFetch<AuthorListItem[]>(authorsQuery)
  const editorial = authors.filter((a) => a.isEditorial)
  const contributors = authors.filter((a) => !a.isEditorial)

  return (
    <div className="shell">
      <PageHeader
        kicker="Cambridge Radar"
        title="Authors"
        aside={`${pad(authors.length)} voices`}
        lede="Strategists, researchers and practitioners. Each writes from inside the systems they analyse."
      />

      {editorial.length > 0 && (
        <section aria-labelledby="editorial" className="mb-section">
          <h2 id="editorial" className="kicker mb-6">
            Editorial
          </h2>
          <ul className="grid gap-y-12">
            {editorial.map((a) => (
              <li key={a._id}>
                {/* Same column width as every contributor card below. */}
                <Link href={`/authors/${a.slug}`} className="group grid grid-cols-2 gap-x-col md:grid-cols-3 lg:grid-cols-4">
                  <Portrait author={a} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" />
                  <div className="self-end md:col-span-2 lg:col-span-3">
                    <p className="t-h2">
                      <span className="hover-line">{a.name}</span>
                    </p>
                    {a.role && <p className="t-ui mt-2 text-ink-2">{a.role}</p>}
                    {a.expertise && <p className="t-ui-sm mt-1 text-muted">{a.expertise}</p>}
                    <p className="meta mt-4">{pad(a.count)} articles</p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="contributors">
        <h2 id="contributors" className="kicker mb-6 border-t border-rule pt-4">
          Contributors
        </h2>
        <ul className="grid grid-cols-2 gap-x-col gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {contributors.map((a, i) => (
            <Reveal as="li" key={a._id} index={i % 4}>
              <Link href={`/authors/${a.slug}`} className="group block">
                <Portrait author={a} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" />
                <p className="t-h4 mt-4">
                  <span className="hover-line">{a.name}</span>
                </p>
                {a.role && <p className="t-ui-sm mt-1.5 line-clamp-2 text-muted">{a.role}</p>}
                <p className="meta mt-3">{pad(a.count)} articles</p>
              </Link>
            </Reveal>
          ))}
        </ul>
      </section>
    </div>
  )
}

function Portrait({author, sizes}: {author: Author; sizes: string}) {
  if (!author.photo?.asset) {
    return (
      <div className="frame grid aspect-[4/5] place-items-center">
        <span className="t-h2 text-muted">{initials(author.name)}</span>
      </div>
    )
  }
  return (
    <SanityImg
      image={author.photo}
      ratio={4 / 5}
      sizes={sizes}
      alt={author.name}
      imgClassName="grayscale transition-[filter,transform] duration-700 group-hover:grayscale-0"
    />
  )
}
