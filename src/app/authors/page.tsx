import type {Metadata} from 'next'
import Link from 'next/link'

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
      <header className="rise pt-10 pb-10 md:pt-16 md:pb-14">
        <p className="meta">Cambridge Radar</p>
        <div className="mt-6 flex flex-col gap-6 border-b border-rule-strong pb-8 md:flex-row md:items-end md:justify-between">
          <h1 className="display text-[3.5rem] md:text-[6.5rem] lg:text-[8rem]">Authors</h1>
          <p className="meta md:pb-4">{pad(authors.length)} voices</p>
        </div>
        <p className="mt-6 max-w-2xl font-serif text-[1.25rem] leading-relaxed text-ink-2">
          Strategists, researchers and practitioners. Each writes from inside the systems they analyse.
        </p>
      </header>

      {editorial.length > 0 && (
        <section aria-labelledby="editorial" className="mb-20">
          <h2 id="editorial" className="kicker mb-6">
            Editorial
          </h2>
          <ul className="grid gap-8 md:grid-cols-2">
            {editorial.map((a) => (
              <li key={a._id}>
                <Link href={`/authors/${a.slug}`} className="group grid grid-cols-[8rem_1fr] gap-6 sm:grid-cols-[11rem_1fr]">
                  <Portrait author={a} sizes="176px" />
                  <div className="self-end">
                    <p className="display text-[2rem] md:text-[2.5rem]">
                      <span className="hover-line">{a.name}</span>
                    </p>
                    {a.role && <p className="mt-2 text-[15px] text-ink-2">{a.role}</p>}
                    {a.expertise && <p className="mt-1 text-[14px] text-muted">{a.expertise}</p>}
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
        <ul className="grid grid-cols-2 gap-x-6 gap-y-12 md:grid-cols-3 lg:grid-cols-4">
          {contributors.map((a, i) => (
            <Reveal as="li" key={a._id} index={i % 4}>
              <Link href={`/authors/${a.slug}`} className="group block">
                <Portrait author={a} sizes="(min-width: 1024px) 25vw, (min-width: 768px) 33vw, 50vw" />
                <p className="headline mt-4 text-[1.25rem]">
                  <span className="hover-line">{a.name}</span>
                </p>
                {a.role && <p className="mt-1.5 line-clamp-2 text-[14px] leading-snug text-muted">{a.role}</p>}
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
        <span className="display text-5xl text-muted">{initials(author.name)}</span>
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
