import type {PortableTextBlock} from '@portabletext/react'

export type SanityImage = {
  _type?: string
  asset?: {
    _ref?: string
    _id?: string
    url?: string
    metadata?: {lqip?: string; dimensions?: {width: number; height: number; aspectRatio?: number}}
  }
  crop?: {top: number; bottom: number; left: number; right: number}
  hotspot?: {x: number; y: number; height: number; width: number}
  alt?: string
  caption?: string
  credit?: string
}

export type Seo = {
  title?: string
  description?: string
  image?: SanityImage
  noIndex?: boolean
}

export type SocialLink = {_key?: string; network: string; url: string}

export type SectionRef = {_id: string; title: string; slug: string}

export type AuthorRef = {
  _id: string
  name: string
  slug: string
  role?: string
  photo?: SanityImage
}

export type PostCard = {
  _id: string
  title: string
  slug: string
  excerpt?: string
  publishedAt: string
  section: SectionRef
  author?: AuthorRef
  mainImage?: SanityImage
  chars?: number
}

export type Author = AuthorRef & {
  subtitle?: string
  country?: string
  industry?: string
  skills?: string[]
  profileCategories?: string[]
  expertise?: string
  shortBio?: string
  bio?: PortableTextBlock[]
  links?: SocialLink[]
  isEditorial?: boolean
  seo?: Seo
}

export type Post = PostCard & {
  updatedAt?: string
  body: PortableTextBlock[]
  tags?: string[]
  seo?: Seo
  author: Author
  otherSections?: SectionRef[]
  series?: {title: string; slug: string; posts: {_id: string; title: string; slug: string; section: string}[]}
  related: PostCard[]
  prev?: {title: string; slug: string; section?: {slug: string}} | null
  next?: {title: string; slug: string; section?: {slug: string}} | null
}

export type Section = SectionRef & {
  description?: string
  seo?: Seo
  /** Breadcrumb label when it differs from the title (tag archives). */
  crumb?: string
}

export type Page = {
  _id: string
  title: string
  slug: string
  template?: 'default' | 'contact' | 'contribute' | 'newsletter'
  lede?: string
  image?: SanityImage
  body?: PortableTextBlock[]
  seo?: Seo
}

export type MenuItem = {_type: 'category' | 'page'; title: string; slug: string}

export type Settings = {
  title: string
  tagline?: string
  description?: string
  logo?: SanityImage
  ogImage?: SanityImage
  contactEmail?: string
  social?: SocialLink[]
  footerNote?: string
  mainMenu?: MenuItem[]
  topMenu?: {label: string; href: string}[]
  footerMenu?: {label: string; href: string}[]
  newsletterTitle?: string
  newsletterText?: string
  newsletterAutoSend?: boolean
  gaId?: string
  clarityId?: string
  gtmId?: string
  googleVerification?: string
  bingVerification?: string
}

export type Series = {
  _id: string
  title: string
  slug: string
  description?: string
  image?: SanityImage
  seo?: Seo
  posts: PostCard[]
}
