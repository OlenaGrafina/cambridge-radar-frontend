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
  newsletterTitle, newsletterText, newsletterAutoSend,
  gaId, clarityId, googleVerification, bingVerification
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
  allowComments,
  seo{..., image${image}},
  "author": author->{${authorFields}, expertise, shortBio, links},
  "otherSections": otherCategories[]->${sectionRef},
  "series": series->{
    title, "slug": slug.current,
    "posts": *[${published} && series._ref == ^._id] | order(publishedAt asc){_id, title, "slug": slug.current, "section": category->slug.current}
  },
  "related": *[${published} && _id != ^._id && (category._ref == ^.category._ref || author._ref == ^.author._ref)] | order(publishedAt desc)[0...6]${postCard},
  "comments": *[_type == "comment" && post._ref == ^._id && status == "approved"] | order(createdAt asc){
    _id, name, body, createdAt, "parent": parent._ref, "staffAuthor": staffAuthor->{name, "slug": slug.current}
  }
}`

export const latestQuery = /* groq */ `*[${published}] | order(publishedAt desc)[0...$limit]${postCard}`

export const postPathsQuery = /* groq */ `*[${published}]{"slug": slug.current, "section": category->slug.current}`

export const sectionQuery = /* groq */ `*[_type == "category" && slug.current == $slug][0]{
  ${sectionFields}, description, seo
}`

export const sectionPostsQuery = /* groq */ `{
  "posts": *[${published} && ${inSection}] | order(publishedAt desc)[$from...$to]${postCard},
  "total": count(*[${published} && ${inSection}])
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
  ${authorFields}, expertise, shortBio, isEditorial,
  "count": count(*[${published} && author._ref == ^._id])
}`

export const authorQuery = /* groq */ `*[_type == "author" && slug.current == $slug][0]{
  ${authorFields}, expertise, shortBio, bio, links, isEditorial, seo,
  "posts": *[${published} && author._ref == ^._id] | order(publishedAt desc)${postCard}
}`

export const authorSlugsQuery = /* groq */ `*[_type == "author" && defined(slug.current)].slug.current`

export const seriesQuery = /* groq */ `*[_type == "series" && slug.current == $slug][0]{
  _id, title, "slug": slug.current, description, image${image}, seo,
  "posts": *[${published} && series._ref == ^._id] | order(publishedAt asc)${postCard}
}`

export const seriesSlugsQuery = /* groq */ `*[_type == "series" && defined(slug.current)].slug.current`

export const searchQuery = /* groq */ `*[${published} && [title, excerpt, pt::text(body), author->name, array::join(tags, " ")] match $q]
  | score(title match $q, excerpt match $q, boost(array::join(tags, " ") match $q, 2), author->name match $q)
  | order(_score desc, publishedAt desc)[0...30]${postCard}`

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
