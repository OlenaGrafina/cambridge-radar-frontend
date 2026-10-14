import {NOINDEX} from '@/lib/seo'
import {absolute} from '@/lib/utils'

export const dynamic = 'force-static'

/** Pages for people and forms: nothing a reader or an assistant needs. /md/ is the internal address behind every ".md" page. */
const PRIVATE = ['/api/', '/md/', '/search', '/subscription']

/**
 * AI crawlers, by what they do. Naming them matters: a crawler obeys only the
 * most specific group that names it (RFC 9309), so the general group below is
 * ignored by a bot that has its own, and each named group repeats the rules.
 *   search / answers   find pages and quote them for a reader's question
 *   user agents        fetch a page because a person asked an assistant about it
 *   training           collect text for models
 */
const AI_AGENTS = [
  // OpenAI
  'OAI-SearchBot',
  'ChatGPT-User',
  'GPTBot',
  // Anthropic
  'Claude-SearchBot',
  'Claude-User',
  'ClaudeBot',
  'anthropic-ai',
  // Perplexity
  'PerplexityBot',
  'Perplexity-User',
  // Google (Gemini / Vertex grounding and training control; Search itself is Googlebot)
  'Google-Extended',
  'Google-CloudVertexBot',
  // Microsoft, Apple, Amazon, Meta, others
  'Applebot',
  'Applebot-Extended',
  'Amazonbot',
  'meta-externalagent',
  'meta-externalfetcher',
  'DuckAssistBot',
  'MistralAI-User',
  'cohere-ai',
  'YouBot',
  'Diffbot',
  'CCBot',
  'Bytespider',
]

/**
 * The publication wants to be read, quoted and cited: search, AI answers and
 * model training are all allowed. Content-Signal is Cloudflare's CC0 policy
 * vocabulary (contentsignals.org): a stated preference, no confirmed effect on
 * any one crawler. Change `ai-train=yes` to `no` to opt out of training only.
 * Preview deployments (NEXT_PUBLIC_NOINDEX=1) block everything.
 */
const SIGNAL = 'Content-Signal: search=yes, ai-input=yes, ai-train=yes'

export function GET() {
  const rules = (agents: string[]) => [...agents.map((a) => `User-agent: ${a}`), SIGNAL, 'Allow: /', ...PRIVATE.map((p) => `Disallow: ${p}`)].join('\n')

  const body = NOINDEX
    ? 'User-agent: *\nDisallow: /\n'
    : [
        '# Cambridge Radar welcomes search engines, AI assistants and answer engines.',
        `# Plain-text index for assistants: ${absolute('/llms.txt')}`,
        `# Full text of every article:    ${absolute('/llms-full.txt')}`,
        '# Every page also has a Markdown version at its address plus ".md".',
        '',
        rules(['*']),
        '',
        rules(AI_AGENTS),
        '',
        `Host: ${absolute('/')}`,
        `Sitemap: ${absolute('/sitemap.xml')}`,
        '',
      ].join('\n')

  return new Response(body, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=0, s-maxage=86400, stale-while-revalidate=604800',
    },
  })
}
