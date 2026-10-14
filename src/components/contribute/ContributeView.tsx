import Link from 'next/link'

import {ArrowRight, MailIcon} from '@/components/icons'
import {PageHeader} from '@/components/layout/PageHeader'
import {SanityImg} from '@/components/media/SanityImg'
import {StaticImg} from '@/components/media/StaticImg'
import {Reveal} from '@/components/motion/Reveal'
import {SectionHeading} from '@/components/story/SectionHeading'
import type {AuthorRef, MenuItem} from '@/lib/sanity/types'
import {initials, pad} from '@/lib/utils'

import {ContributeForm} from './ContributeForm'
import {FORMATS, HERO, STEPS, TOPIC_NOTES, WHY} from './content'
import {PitchLink} from './PitchLink'

/**
 * Pictures live in public/contribute, already cropped and sized for their slot.
 * Stock (Unsplash licence: free to use, no attribution required; photographers
 * credited here for the record):
 *   hero.webp                 Adil Sattarov, "An old stone hallway with arched windows"
 *   format-organisation.webp  Julius Dūdėnas, "Brown concrete building under blue sky" (graded warmer)
 *   topics.webp               Bogdan Todoran, "Sailing boats under bridge"
 * The three still lifes (format-article, -interview, -perspectives) were
 * generated with ChatGPT for this page.
 */
const IMG = {
  hero: {src: '/contribute/hero.webp', alt: 'A sunlit stone cloister leading to a distant arch'},
  article: {src: '/contribute/format-article.webp', alt: 'Hands typing on a laptop at an oak desk in afternoon light'},
  interview: {src: '/contribute/format-interview.webp', alt: 'A vintage studio microphone beside a sunlit window'},
  perspectives: {src: '/contribute/format-perspectives.webp', alt: 'A fountain pen on an open notebook beside a closed book and round glasses'},
  organisation: {src: '/contribute/format-organisation.webp', alt: 'The front of a Cambridge college under a blue sky'},
  topics: {src: '/contribute/topics.webp', alt: 'A punt passing beneath a wooden footbridge on the River Cam'},
}

export function ContributeView({
  sections,
  voices,
  contactEmail,
}: {
  sections: MenuItem[]
  voices: AuthorRef[]
  contactEmail?: string
}) {
  return (
    <>
      {/* First fold: the promise, the one action, and a Cambridge picture. */}
      <section aria-labelledby="contribute-title" className="shell">
        <div className="grid-12 gap-y-10 lg:items-end">
          <div className="col-span-12 lg:col-span-7">
            <PageHeader
              crumbs={[{label: 'Home', href: '/'}, {label: 'Contribute'}]}
              title={HERO.title}
              titleId="contribute-title"
              lede={HERO.lede}
              size="h1"
            >
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
                <PitchLink className="btn btn-ink group">
                  Pitch your idea
                  <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                </PitchLink>
                <a href="#process" className="t-ui hover-line text-ink">
                  How publishing works
                </a>
              </div>
              <p className="meta mt-5">Your proposal goes straight to the editors</p>
            </PageHeader>
          </div>
          <div className="rise col-span-12 pb-block lg:col-span-5 lg:pb-8" style={{'--i': 3} as React.CSSProperties}>
            <StaticImg src={IMG.hero.src} alt={IMG.hero.alt} ratio={4 / 5} priority sizes="(min-width: 1024px) 38vw, 100vw" className="max-h-[34rem] w-full lg:max-h-none" />
          </div>
        </div>
      </section>

      {voices.length > 0 && (
        <section aria-labelledby="voices-title" className="shell mt-section">
          <SectionHeading title="Who writes here" href="/authors" className="mb-3" id="voices-title" />
          <p className="t-body-sm max-w-measure text-ink-2">
            Researchers, founders and practitioners publish under their own name, each with a profile page that lists their work.
          </p>
          <ul className="mt-8 grid grid-cols-2 gap-x-col gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
            {voices.map((a, i) => (
              <Reveal as="li" key={a._id} index={i}>
                <Link href={`/authors/${a.slug}`} className="group block">
                  {a.photo?.asset ? (
                    <SanityImg
                      image={a.photo}
                      ratio={4 / 5}
                      sizes="(min-width: 1024px) 16vw, (min-width: 640px) 30vw, 46vw"
                      alt={a.name}
                      imgClassName="grayscale transition-[filter,transform] duration-700 group-hover:grayscale-0"
                    />
                  ) : (
                    <div className="frame grid aspect-[4/5] place-items-center">
                      <span className="t-h2 text-muted">{initials(a.name)}</span>
                    </div>
                  )}
                  <p className="t-h5 mt-3">
                    <span className="hover-line">{a.name}</span>
                  </p>
                  {a.role && <p className="t-ui-sm mt-1 line-clamp-2 text-muted">{a.role}</p>}
                </Link>
              </Reveal>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="why-title" className="shell mt-section">
        <div className="grid-12 gap-y-10">
          <div className="col-span-12 lg:col-span-4">
            <SectionHeading title="Why publish with Cambridge Radar" id="why-title" />
          </div>
          <ul className="col-span-12 grid gap-x-col gap-y-10 sm:grid-cols-2 lg:col-span-8">
            {WHY.map((w, i) => (
              <Reveal as="li" key={w.title} index={i % 2} className="border-t border-rule pt-5">
                <h3 className="t-h4">{w.title}</h3>
                <p className="t-body-sm mt-3 text-ink-2">{w.text}</p>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="formats-title" className="shell mt-section">
        <SectionHeading title="Four ways to publish" id="formats-title" className="mb-3" />
        <p className="t-body-sm max-w-measure text-ink-2">
          We work with authors and organisations to shape editorial content in the format that fits the idea.
        </p>
        <ul className="mt-8 grid gap-x-col gap-y-12 sm:grid-cols-2 lg:grid-cols-4">
          {FORMATS.map((f, i) => (
            <Reveal as="li" key={f.key} index={i}>
              <StaticImg src={IMG[f.key].src} alt={IMG[f.key].alt} ratio={4 / 3} sizes="(min-width: 1024px) 20vw, (min-width: 640px) 45vw, 100vw" />
              <h3 className="t-h3 mt-5">{f.title}</h3>
              <p className="t-body-sm mt-2 text-ink-2">{f.text}</p>
              <PitchLink format={f.key} className="group meta mt-4 inline-flex items-center gap-2 text-ink hover:text-signal">
                {f.cta}
                <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-0.5" />
              </PitchLink>
            </Reveal>
          ))}
        </ul>
      </section>

      {/* The topics are the live sections, so each line is also a link into the archive. */}
      <section aria-labelledby="topics-title" className="surface-dark mt-section bg-paper text-ink">
        <div className="shell grid-12 gap-y-10 py-section">
          <div className="col-span-12 md:col-span-5">
            <StaticImg src={IMG.topics.src} alt={IMG.topics.alt} ratio={4 / 5} sizes="(min-width: 768px) 38vw, 100vw" className="max-h-[32rem] w-full md:max-h-none" />
          </div>
          <div className="col-span-12 md:col-span-7 lg:col-span-6 lg:col-start-7">
            <h2 id="topics-title" className="t-h2">
              Topics we cover
            </h2>
            <p className="t-body-sm mt-4 max-w-measure text-ink-2">
              We welcome original perspectives across our sections. If your idea sits between two of them, pitch it anyway.
            </p>
            <ul className="mt-8 divide-y divide-rule border-y border-rule">
              {sections.map((s) => (
                <li key={s.slug}>
                  <Link href={`/${s.slug}`} className="group grid grid-cols-[1fr_auto] items-baseline gap-x-6 gap-y-1 py-4 sm:grid-cols-[9rem_1fr_auto]">
                    <span className="t-h4 hover-line w-fit">{s.title}</span>
                    <span className="t-ui-sm order-3 col-span-2 text-ink-2 sm:order-none sm:col-span-1">{TOPIC_NOTES[s.slug] ?? ''}</span>
                    <ArrowRight size={14} className="text-muted transition-all duration-300 group-hover:translate-x-0.5 group-hover:text-signal" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section id="process" aria-labelledby="process-title" className="shell mt-section">
        <SectionHeading title="From idea to publication" id="process-title" className="mb-3" />
        <p className="t-body-sm max-w-measure text-ink-2">A clear process, with an editor beside you at each step.</p>
        <ol className="mt-8 grid gap-x-col gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <Reveal as="li" key={s.title} index={i} className="border-t-2 border-rule-strong pt-4">
              <span className="meta">{pad(i + 1)}</span>
              <h3 className="t-h4 mt-3">{s.title}</h3>
              <p className="t-body-sm mt-2 text-ink-2">{s.text}</p>
            </Reveal>
          ))}
        </ol>
      </section>

      {/* The footer brings its own top margin; pulling this band down over it keeps grey straight into black. */}
      <section id="pitch" aria-labelledby="pitch-title" className="-mb-section mt-section bg-paper-2">
        <div className="shell grid-12 gap-y-10 py-section">
          <div className="col-span-12 lg:col-span-5">
            <h2 id="pitch-title" className="t-h2">
              Pitch your idea
            </h2>
            <p className="t-lead mt-4 text-ink-2">Tell us who you are and what you would like to write. An editor will reply to the email you give.</p>
            <div className="mt-8 border-t border-rule-strong pt-5">
              <p className="kicker">What helps a pitch</p>
              <ul className="t-body-sm mt-4 space-y-2 text-ink-2">
                <li>A working title or the topic in a sentence</li>
                <li>Why readers should care now</li>
                <li>A link to your LinkedIn profile or website</li>
              </ul>
            </div>
            {contactEmail && (
              <p className="t-ui mt-8 flex items-center gap-3 text-ink-2">
                <MailIcon size={18} className="shrink-0 text-muted" />
                <span>
                  Prefer email?{' '}
                  <a href={`mailto:${contactEmail}`} className="hover-line break-all text-ink">
                    {contactEmail}
                  </a>
                </span>
              </p>
            )}
          </div>
          <div className="col-span-12 lg:col-span-6 lg:col-start-7">
            <ContributeForm />
          </div>
        </div>
      </section>
    </>
  )
}
