import {PortableText, type PortableTextBlock, type PortableTextComponents, toPlainText} from '@portabletext/react'

import {Lightbox} from '@/components/media/Lightbox'
import {SanityImg} from '@/components/media/SanityImg'
import {imageUrl} from '@/lib/sanity/image'
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
  return {ids, toc, level}
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
  const {ids, level} = headingIds(value)
  // Articles without h2s: their h3s become the h2 level (same look) so the
  // outline goes h1 → h2 with no skipped level.
  const promoteH3 = level === 'h3' && !value.some((b) => b._type === 'block' && b.style === 'h2')

  const components: PortableTextComponents = {
    block: {
      h2: ({children, value: block}) => <h2 id={ids.get(block._key as string)}>{children}</h2>,
      h3: ({children, value: block}) =>
        promoteH3 ? (
          <h2 id={ids.get(block._key as string)} className="as-h3">
            {children}
          </h2>
        ) : (
          <h3 id={ids.get(block._key as string)}>{children}</h3>
        ),
      h4: ({children}) => (promoteH3 ? <h3 className="as-h4">{children}</h3> : <h4>{children}</h4>),
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
        const caption = (img.caption || img.credit) && (
          <figcaption className="t-ui-sm text-muted">
            {img.caption && <span className="block">{img.caption}</span>}
            {img.credit && <span className="meta mt-1.5 block">{img.credit}</span>}
          </figcaption>
        )
        // Every figure keeps the text column's edges. Portraits sit at the
        // left at 5/12 with the caption beside them, never floating mid-column.
        if (portrait) {
          return (
            <figure className="my-10 grid grid-cols-12 items-end gap-x-6 gap-y-3">
              <div className="col-span-7 sm:col-span-5">
                <Lightbox src={imageUrl(img, 2000)} alt={img.alt}>
                  <SanityImg image={img} ratio={4 / 5} sizes="(min-width: 640px) 18rem, 60vw" />
                </Lightbox>
              </div>
              <div className="col-span-12 sm:col-span-7">{caption}</div>
            </figure>
          )
        }
        return (
          <figure className="my-10">
            <Lightbox src={imageUrl(img, 2000)} alt={img.alt}>
              <SanityImg image={img} sizes="(min-width: 1280px) 720px, (min-width: 1024px) 62vw, 100vw" />
            </Lightbox>
            {caption && <div className="mt-3">{caption}</div>}
          </figure>
        )
      },
      pullQuote: ({value: q}: {value: {text: string; attribution?: string}}) => (
        <figure className="my-12 border-y border-rule-strong py-8">
          <blockquote className="t-h3">“{q.text}”</blockquote>
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
