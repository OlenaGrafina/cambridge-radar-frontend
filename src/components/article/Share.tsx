'use client'

import {useState} from 'react'

import {CheckIcon, FacebookIcon, LinkIcon, LinkedInIcon, PinterestIcon, TelegramIcon, ThreadsIcon, XIcon} from '@/components/icons'
import {track} from '@/lib/analytics'
import {cn} from '@/lib/utils'

/**
 * Share links — the same networks as the original site (Jetpack: X,
 * Facebook, LinkedIn, Telegram, Threads; theme: Pinterest) — as plain
 * links with no third-party scripts, plus copy link / the native share sheet.
 */
export function Share({url, title, image, className}: {url: string; title: string; image?: string | null; className?: string}) {
  const [copied, setCopied] = useState(false)
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(title)

  const targets = [
    {network: 'linkedin', label: 'Share on LinkedIn', href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`, icon: <LinkedInIcon size={15} />},
    {network: 'x', label: 'Share on X', href: `https://x.com/intent/post?url=${u}&text=${t}`, icon: <XIcon size={14} />},
    {network: 'facebook', label: 'Share on Facebook', href: `https://www.facebook.com/sharer/sharer.php?u=${u}`, icon: <FacebookIcon size={16} />},
    {network: 'telegram', label: 'Share on Telegram', href: `https://t.me/share/url?url=${u}&text=${t}`, icon: <TelegramIcon size={15} />},
    {network: 'threads', label: 'Share on Threads', href: `https://www.threads.net/intent/post?text=${t}%20${u}`, icon: <ThreadsIcon size={15} />},
    {
      network: 'pinterest',
      label: 'Pin on Pinterest',
      href: `https://pinterest.com/pin/create/button/?url=${u}&description=${t}${image ? `&media=${encodeURIComponent(image)}` : ''}`,
      icon: <PinterestIcon size={16} />,
    },
  ]

  const shared = (method: string) => track('share', {method, content_type: 'article', item_id: url})

  async function copy() {
    shared('copy_link')
    try {
      if (navigator.share && matchMedia('(pointer: coarse)').matches) {
        await navigator.share({url, title})
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <ul className={cn('flex flex-wrap items-center gap-1.5', className)} aria-label="Share" data-share>
      {targets.map((s) => (
        <li key={s.label}>
          <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.label} title={s.label} className="icon-btn" onClick={() => shared(s.network)}>
            {s.icon}
          </a>
        </li>
      ))}
      <li>
        <button
          type="button"
          onClick={copy}
          aria-label={copied ? 'Link copied' : 'Copy link'}
          title={copied ? 'Link copied' : 'Copy link'}
          className={cn('icon-btn', copied && '!border-signal text-signal')}
        >
          {copied ? <CheckIcon size={16} /> : <LinkIcon size={16} />}
        </button>
      </li>
      <li aria-live="polite" className="sr-only">
        {copied ? 'Link copied to clipboard' : ''}
      </li>
    </ul>
  )
}
