import type {NextConfig} from 'next'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'polcbwiw'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

type Redirect = {
  source: string
  destination: string
  permanent: boolean
  has?: {type: 'query'; key: string; value?: string}[]
}

/** Strip the trailing slash: Next normalises /path/ → /path before matching. */
const clean = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path)

/**
 * Redirects managed in Sanity (the WordPress import writes one per old URL).
 * Read at build as a snapshot for src/proxy.ts, which applies them and keeps
 * them fresh while the site runs. A failed request must never break the build.
 */
async function sanityRedirects(): Promise<Redirect[]> {
  const query = encodeURIComponent('*[_type == "redirect" && defined(source) && defined(destination)]{source, destination, permanent}')
  try {
    const res = await fetch(`https://${projectId}.apicdn.sanity.io/v2025-02-19/data/query/${dataset}?query=${query}`)
    if (!res.ok) return []
    const {result} = (await res.json()) as {result: {source: string; destination: string; permanent?: boolean}[]}
    return result
      .map((r) => ({source: clean(r.source), destination: r.destination, permanent: r.permanent !== false}))
      .filter((r) => r.source !== clean(r.destination))
  } catch {
    return []
  }
}

const securityHeaders = [
  {key: 'X-Content-Type-Options', value: 'nosniff'},
  {key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin'},
  {key: 'X-Frame-Options', value: 'SAMEORIGIN'},
  {key: 'Content-Security-Policy', value: "frame-ancestors 'self'"},
  {key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'},
  {key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload'},
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Trailing slashes are stripped by src/proxy.ts together with the Sanity
  // redirects, so every old WordPress URL (they all end in "/") takes one hop.
  skipTrailingSlashRedirect: true,
  poweredByHeader: false,
  // ~11 KB of Tailwind CSS inlined: no render-blocking request for first-time readers.
  experimental: {inlineCss: true},
  images: {
    loader: 'custom',
    loaderFile: './src/lib/sanity/image-loader.ts',
    remotePatterns: [{protocol: 'https', hostname: 'cdn.sanity.io'}],
  },
  async headers() {
    return [
      {source: '/:path*', headers: securityHeaders},
      {
        source: '/fonts/:path*',
        headers: [{key: 'Cache-Control', value: 'public, max-age=31536000, immutable'}],
      },
    ]
  },
  async redirects() {
    const fixed: Redirect[] = [
      {source: '/feed', destination: '/rss.xml', permanent: true},
      {source: '/category/all', destination: '/all', permanent: true},
      {source: '/category/:slug', destination: '/:slug', permanent: true},
      {source: '/profile/:slug', destination: '/authors/:slug', permanent: true},
      {source: '/about_us', destination: '/about', permanent: true},
      {source: '/home', destination: '/', permanent: true},
      {source: '/artificial-intelligence', destination: '/ai', permanent: true},
      {source: '/analysis-cambridge-radar', destination: '/analysis', permanent: true},
      // WordPress archive URLs: paged categories, search aliases, date archives
      {source: '/category/:slug/page/:n', destination: '/:slug/page/:n', permanent: true},
      {source: '/page/:n', has: [{type: 'query', key: 's', value: '(?<s>.*)'}], destination: '/search?q=:s&page=:n', permanent: true},
      {source: '/search/:q/page/:n', destination: '/search?q=:q&page=:n', permanent: true},
      {source: '/search/:q', destination: '/search?q=:q', permanent: true},
      {source: '/:y(\\d{4})/:m(\\d{2})/:d(\\d{2})', destination: '/all', permanent: true},
      {source: '/:y(\\d{4})/:m(\\d{2})', destination: '/all', permanent: true},
      {source: '/:y(\\d{4})', destination: '/all', permanent: true},
    ]
    // Fixed URL patterns live here; the editor's rules from Sanity are applied
    // by src/proxy.ts so they change without a deploy.
    return [
      // WordPress search: /?s=term
      {source: '/', has: [{type: 'query', key: 's', value: '(?<s>.*)'}], destination: '/search?q=:s', permanent: true},
      ...fixed.flatMap((r) => [r, {...r, source: `${r.source}/`}]),
    ]
  },
}

export default async function config(): Promise<NextConfig> {
  // Build-time snapshot of the Sanity redirects for the proxy's first requests.
  const fromSanity = await sanityRedirects()
  return {...nextConfig, env: {...nextConfig.env, CR_REDIRECTS: JSON.stringify(fromSanity)}}
}
