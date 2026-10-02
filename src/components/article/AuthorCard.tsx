import Link from 'next/link'

import {ArrowRight, NETWORK_LABEL, SocialIcon} from '@/components/icons'
import {SanityImg} from '@/components/media/SanityImg'
import type {Author} from '@/lib/sanity/types'
import {initials} from '@/lib/utils'

export function AuthorCard({author}: {author: Author}) {
  return (
    <section aria-label="About the author" className="grid grid-cols-[4.5rem_1fr] gap-5 border-t-2 border-rule-strong pt-6 sm:grid-cols-[6.5rem_1fr] sm:gap-7">
      <Link href={`/authors/${author.slug}`} className="group block" tabIndex={-1} aria-hidden="true">
        {author.photo?.asset ? (
          <SanityImg image={author.photo} ratio={4 / 5} sizes="104px" alt="" imgClassName="grayscale group-hover:grayscale-0 transition-[filter] duration-700" />
        ) : (
          <div className="frame grid aspect-[4/5] place-items-center">
            <span className="display text-3xl text-muted">{initials(author.name)}</span>
          </div>
        )}
      </Link>
      <div>
        <p className="kicker">Written by</p>
        <p className="headline mt-2 text-[1.5rem]">
          <Link href={`/authors/${author.slug}`} className="hover-line">
            {author.name}
          </Link>
        </p>
        {(author.role || author.expertise) && (
          <p className="mt-1 text-[14px] leading-snug text-muted">{[author.role, author.expertise].filter(Boolean).join(' · ')}</p>
        )}
        {author.shortBio && <p className="mt-4 font-serif text-[1.0625rem] leading-relaxed text-ink-2">{author.shortBio}</p>}
        <div className="mt-5 flex flex-wrap items-center gap-2">
          <Link href={`/authors/${author.slug}`} className="group meta mr-3 flex items-center gap-2 text-ink hover:text-signal">
            All articles
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
          </Link>
          {(author.links ?? []).map((l) => (
            <a
              key={l.url}
              href={l.url}
              target="_blank"
              rel="noopener noreferrer"
              className="icon-btn !h-9 !w-9"
              aria-label={`${author.name} on ${NETWORK_LABEL[l.network] ?? l.network}`}
            >
              <SocialIcon network={l.network} size={15} />
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
