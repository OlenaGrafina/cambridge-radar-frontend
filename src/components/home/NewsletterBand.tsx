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
      <div className="shell relative grid-12 gap-y-8 py-section md:items-end">
        <div className="col-span-12 md:col-span-6">
          <p className="kicker text-signal">Newsletter</p>
          <h2 id="newsletter-band" className="t-h2 mt-4">
            {settings.newsletterTitle}
          </h2>
          {settings.newsletterText && (
            <p className="t-lead mt-4 max-w-md text-ink-2">{settings.newsletterText}</p>
          )}
        </div>
        <div className="col-span-12 md:col-span-5 md:col-start-8">
          <NewsletterForm source={source} />
        </div>
      </div>
    </section>
  )
}
