export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || 'https://cambridge-radar.com').replace(/\/$/, '')

export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

const dateFmt = new Intl.DateTimeFormat('en-GB', {day: 'numeric', month: 'long', year: 'numeric', timeZone: 'Europe/London'})
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const londonParts = new Intl.DateTimeFormat('en-GB', {day: '2-digit', month: 'numeric', timeZone: 'Europe/London'})

/** 16 September 2026 */
export const formatDate = (iso: string) => dateFmt.format(new Date(iso))

/** 16 Sep — always three letters (Intl gives "Sept" in en-GB). */
export function formatShortDate(iso: string) {
  const parts = londonParts.formatToParts(new Date(iso))
  const day = parts.find((p) => p.type === 'day')?.value ?? ''
  const month = Number(parts.find((p) => p.type === 'month')?.value ?? 1)
  return `${day} ${MONTHS[month - 1]}`
}

/** Average adult reading speed for analytical prose, ~230 wpm ≈ 1 150 chars. */
export function readingTime(chars?: number) {
  if (!chars) return null
  return Math.max(1, Math.round(chars / 1150))
}

export const postPath = (post: {slug: string; section?: {slug: string} | null}) =>
  `/${post.section?.slug ?? 'analysis'}/${post.slug}`

export const absolute = (path: string) => `${SITE_URL}${path.startsWith('/') ? path : `/${path}`}`

export function slugify(text: string) {
  return text
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80)
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

export const pad = (n: number) => String(n).padStart(2, '0')
