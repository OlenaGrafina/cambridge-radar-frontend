/**
 * The words of /contribute, in one place so the page (ContributeView) and its
 * Markdown twin (/contribute.md, llms.txt) always say the same thing.
 */

export const CONTRIBUTE_TITLE = 'Write for Cambridge Radar: pitch an article, interview or feature'

export const CONTRIBUTE_DESCRIPTION =
  'Pitch an expert article, interview, opinion piece or organisation feature to Cambridge Radar, a publication on leadership, innovation and global change.'

export const HERO = {
  title: 'Share your ideas with a global audience',
  lede: 'Cambridge Radar is a thought leadership publication on leadership, innovation and global change. Pitch an article, an interview or a feature to our editors.',
}

export const WHY = [
  {
    title: 'Your name on edited work',
    text: 'Every piece is edited by our team and published under your byline, with an author profile that lists everything you write here.',
  },
  {
    title: 'Work that stays findable',
    text: 'Articles are listed on section and topic pages, included in site search and the RSS feed, so readers can still find yours months later.',
  },
  {
    title: 'Context around your idea',
    text: 'Your piece appears next to related analysis, so a reader who finishes it can follow the conversation to the next one.',
  },
  {
    title: 'Readers beyond your network',
    text: 'New articles go out through our newsletter and social channels, and are indexed for search and AI answer engines.',
  },
]

export const FORMATS = [
  {
    key: 'article',
    title: 'Expert Article',
    text: 'Share your analysis, experience or research with our readers.',
    cta: 'Propose an article',
  },
  {
    key: 'interview',
    title: 'Interview',
    text: 'In-depth conversations with leaders and experts.',
    cta: 'Propose an interview',
  },
  {
    key: 'perspectives',
    title: 'Perspectives',
    text: 'Shorter opinion pieces on key topics and trends.',
    cta: 'Propose a perspective',
  },
  {
    key: 'organisation',
    title: 'Organisation Feature',
    text: 'Highlight your initiative, research or event.',
    cta: 'Propose a feature',
  },
] as const

/** One line per section on the topics list; a new section simply shows its name. */
export const TOPIC_NOTES: Record<string, string> = {
  business: 'Entrepreneurship, strategy and the companies shaping markets',
  technology: 'Tools, platforms and the systems behind them',
  ai: 'Models, applications and what follows from them',
  leadership: 'Decisions, organisations and the future of work',
  economy: 'Markets, policy and the forces behind growth',
  geopolitics: 'Institutions, security and global affairs',
  analysis: 'Long reads on what a development really means',
}

export const STEPS = [
  {title: 'Share your idea', text: 'Tell us your topic or proposal using the form below.'},
  {title: 'Editorial review', text: 'We discuss the angle, the format and the next steps.'},
  {title: 'Content development', text: 'Collaborative editing and refinement.'},
  {title: 'Publication and promotion', text: 'Your piece goes live on Cambridge Radar and goes out to our readers.'},
]
