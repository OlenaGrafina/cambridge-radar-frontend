# Cambridge Radar — website

Next.js 16 (App Router) + Tailwind CSS 4, content from Sanity
([cambridge-radar-admin](https://github.com/cyanidium1/cambridge-radar-admin)).

## Run

```bash
npm install --no-audit --no-fund --maxsockets=3 --fetch-retries=8
cp .env.example .env.local   # fill in
npm run dev                  # http://localhost:3044 (via .claude/launch.json) or :3000
npm run build && npm start
```

## How it works

- **Static by default.** Every page is pre-rendered and cached. Sanity reads are tagged; the publish
  webhook (`/api/revalidate`) expires them, so a published change is live on the next request.
- **Images** go through Sanity’s CDN (`src/lib/sanity/image-loader.ts`): resized to the slot,
  AVIF/WebP, editor crop + hotspot, blurred placeholder from asset metadata. No server-side optimiser.
- **Fonts**: Newsreader (text + display, optical sizes), Geist (UI), Geist Mono (metadata), self-hosted
  by `next/font`.
- **Day / night**: `data-theme` on `<html>`, set before first paint from `localStorage`, defaulting to the
  system setting. The switch animates with the View Transitions API where available.
- **Motion** is CSS-first (`globals.css`): first-fold rise, scroll reveal, hover underline/zoom, lead
  slider, reading progress (scroll-driven animation with a JS fallback). All of it respects
  `prefers-reduced-motion`.

## Routes

| Path | |
|---|---|
| `/` | Front page: latest index · lead slider · daily feed / editor’s picks, section rows, newsletter, voices, archive |
| `/<section>` · `/<section>/page/<n>` | Section with pagination |
| `/<section>/<slug>` | Article: contents (scroll-spy), reading time, share, author, series, related, comments, newsletter |
| `/<page>` | About, Contribute, Newsletter, Contacts, Privacy policy (same top-level slug space as sections) |
| `/authors` · `/authors/<slug>` | Authors index and profiles |
| `/series/<slug>` | Series |
| `/search?q=` | Full-text search (GROQ) |
| `/rss.xml` · `/sitemap.xml` · `/robots.txt` | Feeds and crawling |
| `/api/comments` · `/api/subscribe` · `/api/contact` | Forms (honeypot, rate limit, Turnstile) |
| `/api/revalidate` | Sanity webhook: cache refresh, newsletter send, reply notifications |

Old WordPress addresses are redirected (301) — fixed rules in `next.config.ts` plus `redirect`
documents from Sanity.

## SEO

- Per page: title, description, canonical, Open Graph + Twitter card (lead image cropped to 1200×630,
  or the generated brand card `/opengraph-image`), `robots` from the Sanity SEO field.
- JSON-LD: `NewsMediaOrganization` + `WebSite` (search action) site-wide, `NewsArticle` + `BreadcrumbList`
  on articles, `CollectionPage` + `ItemList` on sections, `ProfilePage` + `Person` on authors.
- `/sitemap.xml`, `/robots.txt`, `/rss.xml`, `/manifest.webmanifest`, `/icon.svg`, `/apple-icon`.
- `/llms.txt` (map of sections, articles with summaries, authors) and `/llms-full.txt` (full text) for AI
  assistants and answer engines.
- Search Console and Bing verification codes come from Site settings.
- `NEXT_PUBLIC_NOINDEX=1` on preview/staging deployments: `noindex` everywhere and `Disallow: /`.

## Analytics

Nothing loads until the reader accepts cookies. IDs are set in Sanity → Site settings → Analytics
(GA4 `G-…`, Microsoft Clarity project, optional Google Tag Manager `GTM-…`) — no deploy needed.

`src/lib/analytics.ts` → `track(name, params)` sends each event to GA4, GTM (dataLayer) and Clarity:

| Event | When | Params | Mark as key event in GA4 |
|---|---|---|---|
| `sign_up` | newsletter sign-up | `method: newsletter`, `source` (page/block) | ✅ |
| `generate_lead` | contact / contribute form sent | `form` | ✅ |
| `comment_submit` | comment sent for review | `post_id`, `reply` | ✅ |
| `share` | share buttons, copy link | `method`, `content_type`, `item_id` | |
| `search` | search results shown | `search_term`, `results` | |
| `article_read` | 25 / 50 / 75 / 100 % of an article body | `percent`, `article`, `section`, `author` | 100 % optional |
| `outbound_click` | link to another site | `link_url`, `link_domain` | |
| `theme_change` | day / night switch | `theme` | |

Page views are sent on every client-side navigation.

## Environment

See `.env.example`. Without `RESEND_API_KEY` and Turnstile keys the forms still work: everything is
saved in Sanity, emails are skipped, spam protection falls back to honeypot + rate limiting.

## Deploy (planned: Cloudflare)

Target is Cloudflare Workers via `@opennextjs/cloudflare`. Not wired yet — add the adapter, set the
env vars as Worker secrets, point the domain, then create the Sanity webhook.
