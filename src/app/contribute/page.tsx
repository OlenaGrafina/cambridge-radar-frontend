import type {Metadata} from 'next'

import {ContributeView} from '@/components/contribute/ContributeView'
import {CONTRIBUTE_DESCRIPTION, CONTRIBUTE_TITLE} from '@/components/contribute/content'
import {JsonLd} from '@/components/seo/JsonLd'
import {getSettings, getVoices} from '@/lib/data'
import {buildMetadata} from '@/lib/seo'
import {absolute, SITE_URL} from '@/lib/utils'

/**
 * The one Contribute page. It is a route of its own (not a CMS page) so the
 * layout can be designed; a static route wins over the CMS "[slug]" route, so
 * the old Sanity "contribute" document is no longer reachable.
 */
export const metadata: Metadata = buildMetadata({
  title: CONTRIBUTE_TITLE,
  description: CONTRIBUTE_DESCRIPTION,
  path: '/contribute',
  markdown: '/contribute.md',
})

export default async function ContributePage() {
  const [settings, voices] = await Promise.all([getSettings(), getVoices(5)])

  return (
    <>
      <JsonLd
        data={[
          {
            '@context': 'https://schema.org',
            '@type': 'WebPage',
            '@id': absolute('/contribute'),
            url: absolute('/contribute'),
            name: CONTRIBUTE_TITLE,
            description: CONTRIBUTE_DESCRIPTION,
            isPartOf: {'@id': `${SITE_URL}/#website`},
            publisher: {'@id': `${SITE_URL}/#organization`},
          },
          {
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {'@type': 'ListItem', position: 1, name: settings.title, item: SITE_URL},
              {'@type': 'ListItem', position: 2, name: 'Contribute', item: absolute('/contribute')},
            ],
          },
        ]}
      />
      <ContributeView sections={(settings.mainMenu ?? []).filter(Boolean)} voices={voices} contactEmail={settings.contactEmail} />
    </>
  )
}
