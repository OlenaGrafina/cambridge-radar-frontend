import {Body} from '@/components/article/Body'
import {ContactForm} from '@/components/forms/ContactForm'
import {NewsletterForm} from '@/components/forms/NewsletterForm'
import {MailIcon} from '@/components/icons'
import {SanityImg} from '@/components/media/SanityImg'
import type {Page, Settings} from '@/lib/sanity/types'

/** Static page: About, Contribute, Newsletter, Contacts, Privacy policy. */
export function PageView({page, settings}: {page: Page; settings: Settings}) {
  const hasForm = page.template === 'contact' || page.template === 'newsletter'

  return (
    <article className="shell">
      <header className="rise grid gap-8 pt-10 pb-10 md:grid-cols-12 md:pt-16 md:pb-14">
        <div className="md:col-span-10 lg:col-span-9">
          <p className="meta">Cambridge Radar</p>
          <h1 className="display mt-5 text-[3rem] md:text-[5rem] lg:text-[6rem]">{page.title}</h1>
          {page.lede && (
            <p className="mt-6 max-w-3xl font-serif text-[1.375rem] leading-snug text-ink-2 md:text-[1.625rem]">{page.lede}</p>
          )}
        </div>
      </header>

      {page.image?.asset && (
        <SanityImg image={page.image} ratio={21 / 9} priority sizes="100vw" className="mb-14" />
      )}

      <div className="grid gap-14 border-t border-rule-strong pt-10 md:grid-cols-12 md:gap-8">
        <div className={hasForm ? 'md:col-span-7' : 'md:col-span-8 md:col-start-3 lg:col-span-7 lg:col-start-3'}>
          {page.body?.length ? <Body value={page.body} dropCap={false} /> : null}
        </div>

        {page.template === 'contact' && (
          <aside className="md:col-span-5">
            <div className="md:sticky md:top-24">
              <ContactForm />
              {settings.contactEmail && (
                <p className="mt-8 flex items-center gap-3 text-[15px] text-ink-2">
                  <MailIcon />
                  <a href={`mailto:${settings.contactEmail}`} className="hover-line">
                    {settings.contactEmail}
                  </a>
                </p>
              )}
            </div>
          </aside>
        )}

        {page.template === 'newsletter' && (
          <aside className="md:col-span-5">
            <div className="bg-paper-2 p-6 md:sticky md:top-24 md:p-8">
              <p className="kicker text-signal">Subscribe</p>
              <p className="display mt-3 text-[2rem]">{settings.newsletterTitle}</p>
              {settings.newsletterText && <p className="mt-3 font-serif text-[1.0625rem] text-ink-2">{settings.newsletterText}</p>}
              <div className="mt-6">
                <NewsletterForm source={`page:${page.slug}`} />
              </div>
            </div>
          </aside>
        )}
      </div>
    </article>
  )
}
