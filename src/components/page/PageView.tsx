import {Body} from '@/components/article/Body'
import {ContactForm} from '@/components/forms/ContactForm'
import {NewsletterForm} from '@/components/forms/NewsletterForm'
import {MailIcon} from '@/components/icons'
import {PageHeader} from '@/components/layout/PageHeader'
import {SanityImg} from '@/components/media/SanityImg'
import {naturalRatio} from '@/lib/sanity/image'
import type {Page, Settings} from '@/lib/sanity/types'

/**
 * Static page on the article grid: text in the left 7 columns, the form
 * (contact / newsletter) or a portrait image in the right 4 — the same
 * columns an article uses, so every long read on the site lines up.
 */
export function PageView({page, settings}: {page: Page; settings: Settings}) {
  const hasImage = Boolean(page.image?.asset)
  const portrait = hasImage && naturalRatio(page.image) < 1.05
  const side = page.template === 'contact' || page.template === 'newsletter' || portrait

  return (
    <article className="shell">
      <PageHeader kicker="Cambridge Radar" title={page.title} lede={page.lede} />

      {hasImage && !portrait && (
        <SanityImg image={page.image} ratio={2 / 1} priority sizes="(min-width: 1320px) 1256px, 100vw" className="mb-block" />
      )}

      <div className="grid-12 gap-y-14">
        <div className="col-span-12 lg:col-span-8 xl:col-span-7">
          {page.body?.length ? <Body value={page.body} dropCap={false} /> : null}
        </div>

        {side && (
          <aside className="col-span-12 lg:col-span-4 lg:col-start-9">
            <div className="space-y-10 lg:sticky lg:top-24">
              {portrait && <SanityImg image={page.image} ratio={4 / 5} sizes="(min-width: 1024px) 30vw, 100vw" />}

              {page.template === 'contact' && (
                <div>
                  <ContactForm />
                  {settings.contactEmail && (
                    <p className="t-ui mt-8 flex items-center gap-3 text-ink-2">
                      <MailIcon />
                      <a href={`mailto:${settings.contactEmail}`} className="hover-line">
                        {settings.contactEmail}
                      </a>
                    </p>
                  )}
                </div>
              )}

              {page.template === 'newsletter' && (
                <div className="bg-paper-2 p-6 md:p-8">
                  <p className="kicker text-signal">Subscribe</p>
                  <p className="t-h3 mt-3">{settings.newsletterTitle}</p>
                  {settings.newsletterText && <p className="t-body-sm mt-3 text-ink-2">{settings.newsletterText}</p>}
                  <div className="mt-6">
                    <NewsletterForm source={`page:${page.slug}`} />
                  </div>
                </div>
              )}
            </div>
          </aside>
        )}
      </div>
    </article>
  )
}
