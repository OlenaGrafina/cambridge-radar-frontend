import {NewsletterForm} from '@/components/forms/NewsletterForm'
import type {Settings} from '@/lib/sanity/types'

/** Sign-up band. The radar rings are drawn in CSS — no image weight. */
export function NewsletterBand({settings, source}: {settings: Settings; source: string}) {
  return (
    <section aria-labelledby="newsletter-band" className="relative overflow-hidden bg-paper-2">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 -right-40 h-[44rem] w-[44rem] -translate-y-1/2 rounded-full opacity-60 md:-right-24"
        style={{
          background:
            'repeating-radial-gradient(circle at center, transparent 0 63px, var(--rule) 63px 64px)',
          maskImage: 'radial-gradient(circle at center, black 30%, transparent 70%)',
        }}
      />
      <div className="shell relative grid gap-8 py-14 md:grid-cols-12 md:items-end md:gap-8 md:py-20">
        <div className="md:col-span-6">
          <p className="kicker text-signal">Newsletter</p>
          <h2 id="newsletter-band" className="display mt-4 text-[2.5rem] md:text-[3.5rem]">
            {settings.newsletterTitle}
          </h2>
          {settings.newsletterText && (
            <p className="mt-4 max-w-md font-serif text-[1.125rem] leading-relaxed text-ink-2">{settings.newsletterText}</p>
          )}
        </div>
        <div className="md:col-span-5 md:col-start-8">
          <NewsletterForm source={source} />
        </div>
      </div>
    </section>
  )
}
