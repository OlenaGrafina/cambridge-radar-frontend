import {PortableText, type PortableTextBlock, type PortableTextComponents, toPlainText} from '@portabletext/react'

import {SanityImg} from '@/components/media/SanityImg'
import type {SanityImage} from '@/lib/sanity/types'
import {cn, slugify} from '@/lib/utils'

export type TocItem = {id: string; text: string}

/**
 * Stable, unique ids for the headings that make up the contents. Uses h2s;
 * imported WordPress articles often only have h3s, so those are the fallback.
 */
export function headingIds(blocks: PortableTextBlock[] = []) {
  const isHeading = (b: PortableTextBlock, style: string) => b._type === 'block' && b.style === style
  const level = blocks.filter((b) => isHeading(b, 'h2')).length >= 2 ? 'h2' : 'h3'
  const used = new Map<string, number>()
  const ids = new Map<string, string>()
  const toc: TocItem[] = []
  for (const block of blocks) {
    if (!isHeading(block, level)) continue
    const text = toPlainText([block]).replace(/\s+/g, ' ').trim().replace(/:$/, '')
    if (!text) continue
    const base = slugify(text) || 'section'
    const n = used.get(base) ?? 0
    used.set(base, n + 1)
    const id = n ? `${base}-${n + 1}` : base
    ids.set(block._key as string, id)
    toc.push({id, text})
  }
  return {ids, toc}
}

/** Drop an opening heading that only repeats the standfirst shown above the body. */
export function withoutRepeatedDek(blocks: PortableTextBlock[] = [], excerpt?: string) {
  const first = blocks[0]
  if (!first || !excerpt || first._type !== 'block' || !['h2', 'h3', 'h4'].includes(first.style as string)) return blocks
  const norm = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
  const head = norm(toPlainText([first]))
  return head.length > 20 && norm(excerpt).startsWith(head.slice(0, 60)) ? blocks.slice(1) : blocks
}

function youTubeId(url: string) {
  const m = url.match(/(?:youtu\.be\/|v=|embed\/|shorts\/)([\w-]{11})/)
  return m?.[1]
}

function vimeoId(url: string) {
  return url.match(/vimeo\.com\/(?:video\/)?(\d+)/)?.[1]
}

function Embed({value}: {value: {url: string; caption?: string}}) {
  const yt = youTubeId(value.url)
  const vm = vimeoId(value.url)
  const src = yt
    ? `https://www.youtube-nocookie.com/embed/${yt}`
    : vm
      ? `https://player.vimeo.com/video/${vm}?dnt=1`
      : null
  if (!src) {
    return (
      <p>
        <a href={value.url} target="_blank" rel="noopener noreferrer">
          {value.caption || value.url}
        </a>
      </p>
    )
  }
  return (
    <figure className="not-prose">
      <div className="frame aspect-video">
        <iframe
          src={src}
          title={value.caption || 'Video'}
          loading="lazy"
          allow="accelerometer; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      </div>
      {value.caption && <figcaption className="meta mt-3 normal-case tracking-normal">{value.caption}</figcaption>}
    </figure>
  )
}

export function Body({
  value,
  dropCap = true,
  skipAssetId,
}: {
  value: PortableTextBlock[]
  dropCap?: boolean
  /** The lead image's asset: WordPress often repeated it as the first body image. */
  skipAssetId?: string
}) {
  const {ids} = headingIds(value)

  const components: PortableTextComponents = {
    block: {
      h2: ({children, value: block}) => <h2 id={ids.get(block._key as string)}>{children}</h2>,
      h3: ({children, value: block}) => <h3 id={ids.get(block._key as string)}>{children}</h3>,
      h1: ({children}) => <h2>{children}</h2>,
    },
    marks: {
      link: ({children, value: mark}) => {
        const href = (mark as {href?: string})?.href ?? '#'
        const external = /^https?:\/\//.test(href) && !href.includes('cambridge-radar.com')
        return (
          <a href={href} {...(external || (mark as {blank?: boolean})?.blank ? {target: '_blank', rel: 'noopener noreferrer'} : {})}>
            {children}
          </a>
        )
      },
      underline: ({children}) => <span className="underline underline-offset-4">{children}</span>,
      sup: ({children}) => <sup>{children}</sup>,
    },
    types: {
      figure: ({value: img}: {value: SanityImage}) => {
        if (skipAssetId && img.asset?._id === skipAssetId) return null
        const portrait = (img.asset?.metadata?.dimensions?.aspectRatio ?? 1.5) < 1
        return (
          <figure className={cn('my-10', portrait ? 'mx-auto max-w-md' : 'md:-mx-10 lg:-mx-20')}>
            <SanityImg image={img} sizes={portrait ? '28rem' : '(min-width: 1024px) 840px, 100vw'} />
            {(img.caption || img.credit) && (
              <figcaption className="mt-3 flex flex-wrap justify-between gap-x-6 gap-y-1 font-sans text-[13px] leading-snug text-muted">
                {img.caption && <span>{img.caption}</span>}
                {img.credit && <span className="meta">{img.credit}</span>}
              </figcaption>
            )}
          </figure>
        )
      },
      pullQuote: ({value: q}: {value: {text: string; attribution?: string}}) => (
        <figure className="my-12 border-y border-rule-strong py-8 md:-mx-10">
          <blockquote className="display text-[1.75rem] leading-[1.18] md:text-[2.25rem]">“{q.text}”</blockquote>
          {q.attribution && <figcaption className="meta mt-4">— {q.attribution}</figcaption>}
        </figure>
      ),
      embed: Embed,
      divider: ({value: d}: {value: {style?: string}}) =>
        d.style === 'dots' ? (
          <p aria-hidden="true" className="meta py-4 text-center tracking-[1em]">
            •••
          </p>
        ) : (
          <hr className="my-12 border-rule" />
        ),
    },
  }

  return (
    <div className={cn('prose-radar', dropCap && 'has-dropcap')}>
      <PortableText value={value} components={components} />
    </div>
  )
}
