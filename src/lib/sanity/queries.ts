/** GROQ queries. Projections are shared so every card has the same shape. */

const image = /* groq */ `{..., asset->{_id, url, metadata{lqip, dimensions}}}`

const sectionFields = /* groq */ `_id, title, "slug": slug.current`
const sectionRef = `{${sectionFields}}`

const authorFields = /* groq */ `_id, name, "slug": slug.current, role, photo${image}`
const authorRef = `{${authorFields}}`

const postCardFields = /* groq */ `
  _id,
  title,
  "slug": slug.current,
  excerpt,
  publishedAt,
  "section": category->${sectionRef},
  "author": author->${authorRef},
  mainImage${image},
  "chars": length(pt::text(body))`
export const postCard = `{${postCardFields}}`

const published = /* groq */ `_type == "post" && defined(slug.current) && defined(category) && publishedAt <= now()`

const inSection = /* groq */ `(category._ref == $sectionId || $sectionId in otherCategories[]._ref)`

export const settingsQuery = /* groq */ `*[_id == "siteSettings"][0]{
  title, tagline, description, contactEmail, footerNote, social,
  logo${image}, ogImage${image},
  "mainMenu": mainMenu[]->{_type, title, "slug": slug.current},
  topMenu[]{label, href},
  footerMenu[]{label, href},
  newsletterTitle, newsletterText, newsletterAutoSend,
  gaId, clarityId, gtmId, googleVerification, bingVerification
}`

export const homeQuery = /* groq */ `{
  "home": *[_id == "homePage"][0]{
    "lead": lead[]->${postCard},
    "picks": editorsPicks[]->${postCard},
    "sections": sections[]->{
      _id, title, "slug": slug.current, description,
      "posts": *[${published} && (category._ref == ^._id || ^._id in otherCategories[]._ref)] | order(publishedAt desc)[0...4]${postCard}
    },
    seo
  },
  "latest": *[${published}] | order(publishedAt desc)[0...14]${postCard},
  "authors": *[_type == "author" && defined(slug.current) && count(*[_type == "post" && references(^._id)]) > 0] | order(coalesce(order, 99) asc, name asc)${authorRef}
}`

export const postQuery = /* groq */ `*[${published} && slug.current == $slug][0]{
  ${postCardFields},
  updatedAt,
  body[]{
    ...,
    _type == "figure" => ${image},
    markDefs[]{...}
  },
  tags,
  seo{..., image${image}},
  "author": author->{${authorFields}, expertise, shortBio, links},
  "otherSections": otherCategories[]->${sectionRef},
  "series": series->{
    title, "slug": slug.current,
    "posts": *[${published} && series._ref == ^._id] | order(publishedAt asc){_id, title, "slug": slug.current, "section": category->slug.current}
  },
  // Editor's picks first (Studio → "Схожі статті (вручну)"), then same section or author.
  "relatedManual": relatedPosts[]->[${published}]${postCard},
  "related": *[${published} && _id != ^._id && (category._ref == ^.category._ref || author._ref == ^.author._ref)] | order(publishedAt desc)[0...6]${postCard},
  "prev": *[${published} && publishedAt < ^.publishedAt] | order(publishedAt desc)[0]{title, "slug": slug.current, "section": category->{"slug": slug.current}},
  "next": *[${published} && publishedAt > ^.publishedAt] | order(publishedAt asc)[0]{title, "slug": slug.current, "section": category->{"slug": slug.current}}
}`

export const tagPostsQuery = /* groq */ `*[${published} && count(tags[@ in $tagNames]) > 0] | order(publishedAt desc)${postCard}`

export const tagListQuery = /* groq */ `array::unique(*[${published} && defined(tags)].tags[])`

export const dailyFeedQuery = /* groq */ `coalesce(*[_id == "homePage"][0].editorsPicks[]->${postCard}, [])`

export const latestQuery = /* groq */ `*[${published}] | order(publishedAt desc)[0...$limit]${postCard}`

export const earliestQuery = /* groq */ `*[${published}] | order(publishedAt asc)[0...$limit]${postCard}`

export const postPathsQuery = /* groq */ `*[${published}]{"slug": slug.current, "section": category->slug.current}`

export const sectionQuery = /* groq */ `*[_type == "category" && slug.current == $slug][0]{
  ${sectionFields}, description, seo
}`

export const sectionPostsQuery = /* groq */ `{
  "posts": *[${published} && ${inSection}] | order(publishedAt desc)[$from...$to]${postCard},
  "total": count(*[${published} && ${inSection}])
}`

export const allPostsQuery = /* groq */ `{
  "posts": *[${published}] | order(publishedAt desc)[$from...$to]${postCard},
  "total": count(*[${published}])
}`

export const sectionSlugsQuery = /* groq */ `*[_type == "category" && defined(slug.current)]{
  "slug": slug.current,
  "total": count(*[${published} && (category._ref == ^._id || ^._id in otherCategories[]._ref)])
}`

export const pageQuery = /* groq */ `*[_type == "page" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, template, lede, image${image},
  body[]{..., _type == "figure" => ${image}, markDefs[]{...}},
  seo{..., image${image}}
}`

export const pageSlugsQuery = /* groq */ `*[_type == "page" && defined(slug.current)].slug.current`

export const authorsQuery = /* groq */ `*[_type == "author" && defined(slug.current)] | order(isEditorial desc, coalesce(order, 99) asc, name asc){
  ${authorFields}, subtitle, expertise, shortBio, isEditorial, links, profileCategories,
  "count": count(*[${published} && author._ref == ^._id])
}`

export const authorQuery = /* groq */ `*[_type == "author" && slug.current == $slug][0]{
  ${authorFields}, subtitle, expertise, shortBio, bio, links, isEditorial, seo,
  country, industry, skills, profileCategories,
  "posts": *[${published} && author._ref == ^._id] | order(publishedAt desc)${postCard},
  "prevProfile": *[_type == "author" && defined(slug.current) && coalesce(order, 99) > coalesce(^.order, 99)] | order(coalesce(order, 99) asc)[0]{name, "slug": slug.current},
  "nextProfile": *[_type == "author" && defined(slug.current) && coalesce(order, 99) < coalesce(^.order, 99)] | order(coalesce(order, 99) desc)[0]{name, "slug": slug.current}
}`

export const authorSlugsQuery = /* groq */ `*[_type == "author" && defined(slug.current)].slug.current`

export const seriesQuery = /* groq */ `*[_type == "series" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, description, image${image}, seo,
  "posts": *[${published} && series._ref == ^._id] | order(publishedAt asc)${postCard}
}`

export const seriesSlugsQuery = /* groq */ `*[_type == "series" && defined(slug.current)].slug.current`

export const searchQuery = /* groq */ `*[${published} && [title, excerpt, pt::text(body), author->name, array::join(tags, " ")] match $q]
  | score(boost(title match $q, 3), boost(excerpt match $q, 2), tags match $q, pt::text(body) match $q)
  | order(_score desc, publishedAt desc)[0...30]${postCard}`

/** Pages, sections and profiles for search — the original results mixed all three with posts. */
export const searchOtherQuery = /* groq */ `{
  "pages": *[_type == "page" && defined(slug.current) && [title, lede, pt::text(body)] match $q]
    | score(title match $q) | order(_score desc)[0...10]{_id, title, "slug": slug.current, "text": lede},
  "sections": *[_type == "category" && defined(slug.current) && [title, description] match $q]
    | score(title match $q) | order(_score desc)[0...10]{_id, title, "slug": slug.current, "text": description},
  "authors": *[_type == "author" && defined(slug.current) && [name, role, subtitle, shortBio, array::join(skills, " ")] match $q]
    | score(name match $q) | order(_score desc)[0...10]{_id, "title": name, "slug": slug.current, "text": shortBio, photo}
}`

export const sitemapQuery = /* groq */ `{
  "posts": *[${published}]{"slug": slug.current, "section": category->slug.current, "updated": coalesce(updatedAt, _updatedAt), "noIndex": seo.noIndex},
  "sections": *[_type == "category" && defined(slug.current)]{"slug": slug.current, _updatedAt},
  "pages": *[_type == "page" && defined(slug.current)]{"slug": slug.current, _updatedAt, "noIndex": seo.noIndex},
  "authors": *[_type == "author" && defined(slug.current)]{"slug": slug.current, _updatedAt},
  "series": *[_type == "series" && defined(slug.current)]{"slug": slug.current, _updatedAt}
}`

export const feedQuery = /* groq */ `*[${published}] | order(publishedAt desc)[0...30]{
  ${postCardFields},
  "body": pt::text(body)
}`
