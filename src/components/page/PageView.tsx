import {toPlainText} from '@portabletext/react'

import {Body} from '@/components/article/Body'
import {Share} from '@/components/article/Share'
import {ContactForm} from '@/components/forms/ContactForm'
import {NewsletterForm} from '@/components/forms/NewsletterForm'
import {MailIcon, PinIcon, UsersIcon} from '@/components/icons'
import {PageHeader} from '@/components/layout/PageHeader'
import {SanityImg} from '@/components/media/SanityImg'
import {LatestArticles} from '@/components/sidebar/LatestArticles'
import {imageUrl, naturalRatio} from '@/lib/sanity/image'
import type {Page, Settings} from '@/lib/sanity/types'
import {absolute} from '@/lib/utils'

/**
 * Static pages, laid out like the original: content on the left 8 columns,
 * "Latest Articles" on the right, "Share this:" under the content.
 *  - contact:    contact details (1/3) beside the contact form (2/3)
 *  - contribute: intro text (1/2) beside the contribution form (1/2)
 *  - newsletter: image (1/2) beside the text, then the closing heading
 *                with the sign-up form
 */
export function PageView({page, settings}: {page: Page; settings: Settings}) {
  const template = page.template ?? 'default'
  const hasImage = Boolean(page.image?.asset)
  const portrait = hasImage && naturalRatio(page.image) < 1.05
  // Newsletter: the closing heading introduces the sign-up form, as on the original.
  const body = page.body ?? []
  const lastHeading = body.findLastIndex((b) => b._type === 'block' && b.style === 'h2')
  const intro = lastHeading > 0 ? body.slice(0, lastHeading) : body
  const outro = lastHeading > 0 ? body.slice(lastHeading) : []

  return (
    <article className="shell">
      <PageHeader
        crumbs={[{label: 'Home', href: '/'}, {label: page.title}]}
        title={page.title}
        lede={template === 'contribute' ? undefined : page.lede}
      />

      <div className="grid-12 gap-y-section">
        <div className="col-span-12 lg:col-span-8">
          {template === 'contact' && (
            <div className="grid gap-x-col gap-y-10 md:grid-cols-3">
              <section aria-labelledby="contact-details">
                <h2 id="contact-details" className="kicker border-t-2 border-rule-strong pt-3">
                  {page.title}
                </h2>
                <ContactDetails page={page} />
              </section>
              <div className="md:col-span-2">
                <ContactForm />
              </div>
            </div>
          )}

          {template === 'contribute' && (
            <div className="grid gap-x-col gap-y-10 md:grid-cols-2">
              <div>
                {page.lede && <p className="t-lead text-ink-2">{page.lede}</p>}
                {page.body?.length ? (
                  <div className="mt-6">
                    <Body value={page.body} dropCap={false} />
                  </div>
                ) : null}
              </div>
              <ContactForm variant="contribute" />
            </div>
          )}

          {template === 'newsletter' && (
            <>
              <div className="grid items-center gap-x-col gap-y-8 md:grid-cols-2">
                {hasImage && <SanityImg image={page.image} ratio={1} priority sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 100vw" />}
                {intro.length > 0 && <Body value={intro} dropCap={false} />}
              </div>
              <div className="mt-block border border-rule-strong p-6 md:p-8">
                {outro.length > 0 ? (
                  <Body value={outro} dropCap={false} />
                ) : (
                  <>
                    <p className="t-h3">{settings.newsletterTitle}</p>
                    {settings.newsletterText && <p className="t-body-sm mt-2 text-ink-2">{settings.newsletterText}</p>}
                  </>
                )}
                <div className="mt-6">
                  <NewsletterForm source={`page:${page.slug}`} />
                </div>
              </div>
            </>
          )}

          {template === 'default' && (
            <>
              {hasImage && (
                <SanityImg
                  image={page.image}
                  ratio={portrait ? 4 / 5 : 2 / 1}
                  priority
                  sizes="(min-width: 1024px) 60vw, 100vw"
                  className={portrait ? 'mb-10 w-5/12' : 'mb-10'}
                />
              )}
              {page.body?.length ? (
                <div className="max-w-measure">
                  <Body value={page.body} dropCap={false} />
                </div>
              ) : null}
            </>
          )}

          <div className="mt-section flex flex-wrap items-center justify-between gap-4 border-y border-rule py-4">
            <p className="kicker">Share this:</p>
            <Share url={absolute(`/${page.slug}`)} title={page.seo?.title || page.title} image={hasImage ? imageUrl(page.image, 1200) : null} />
          </div>
        </div>

        <aside className="col-span-12 lg:col-span-4 lg:border-l lg:border-rule lg:pl-rule">
          <LatestArticles />
        </aside>
      </div>
    </article>
  )
}

/**
 * The contact page's icon list. Each line of the page text becomes a row:
 * an email address gets a mail icon and a working mailto link, a line with
 * a postcode gets a pin, anything else the people icon.
 */
function ContactDetails({page}: {page: Page}) {
  const lines = (page.body ?? [])
    .filter((b) => b._type === 'block')
    .map((b) => toPlainText([b]).trim())
    .filter(Boolean)

  return (
    <ul className="mt-4 grid gap-4">
      {lines.map((line) => {
        const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(line)
        const isPlace = !isEmail && /\d/.test(line)
        const Icon = isEmail ? MailIcon : isPlace ? PinIcon : UsersIcon
        return (
          <li key={line} className="t-ui flex items-start gap-3 text-ink-2">
            <Icon size={18} className="mt-0.5 shrink-0 text-muted" />
            {isEmail ? (
              <a href={`mailto:${line}`} className="hover-line break-all">
                {line}
              </a>
            ) : (
              <span>{line}</span>
            )}
          </li>
        )
      })}
    </ul>
  )
}
