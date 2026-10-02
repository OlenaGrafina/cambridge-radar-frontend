import type {NextConfig} from 'next'

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'polcbwiw'
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || 'production'

type Redirect = {source: string; destination: string; permanent: boolean}

/** Strip the trailing slash: Next normalises /path/ → /path before matching. */
const clean = (path: string) => (path.length > 1 ? path.replace(/\/+$/, '') : path)

/**
 * Redirects managed in Sanity (the WordPress import writes one per old URL).
 * Read once at build/start; a failed request must never break the build.
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
  // We strip trailing slashes ourselves (last rule in redirects) so every old
  // WordPress URL — they all end in "/" — reaches its new address in one hop.
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
      {source: '/category/all', destination: '/', permanent: true},
      {source: '/category/:slug', destination: '/:slug', permanent: true},
      {source: '/profile/:slug', destination: '/authors/:slug', permanent: true},
      {source: '/about_us', destination: '/about', permanent: true},
      {source: '/home', destination: '/', permanent: true},
      {source: '/artificial-intelligence', destination: '/ai', permanent: true},
      {source: '/analysis-cambridge-radar', destination: '/analysis', permanent: true},
    ]
    const fromSanity = await sanityRedirects()
    const seen = new Set(fixed.map((r) => r.source))
    const rules = [...fixed, ...fromSanity.filter((r) => !seen.has(r.source) && seen.add(r.source))]
    return [
      ...rules.flatMap((r) => [r, {...r, source: `${r.source}/`}]),
      {source: '/:path+/', destination: '/:path+', permanent: true},
    ]
  },
}

export default nextConfig
