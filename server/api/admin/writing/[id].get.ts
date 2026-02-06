import db from '../../../utils/db'

interface PostRow {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  read_time: string
  tags: string
  hero_image_url: string | null
  hero_image_alt: string | null
  published: number
  sort_order: number
  created_at: string
  updated_at: string
}

interface ImageRow {
  id: number
  url: string
  alt_text: string | null
  sort_order: number
}

export default defineEventHandler((event) => {
  const id = getRouterParam(event, 'id')

  const post = db.prepare(`
    SELECT * FROM writing_posts WHERE id = ?
  `).get(id) as PostRow | undefined

  if (!post) {
    throw createError({ statusCode: 404, message: 'Post not found' })
  }

  const images = db.prepare(`
    SELECT id, url, alt_text, sort_order
    FROM writing_post_images
    WHERE post_id = ?
    ORDER BY sort_order ASC
  `).all(id) as ImageRow[]

  return {
    id: post.id,
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    content: post.content,
    date: post.date,
    readTime: post.read_time,
    tags: JSON.parse(post.tags),
    heroImageUrl: post.hero_image_url,
    heroImageAlt: post.hero_image_alt,
    published: post.published,
    sortOrder: post.sort_order,
    images: images.map(img => ({
      id: img.id,
      url: img.url,
      alt: img.alt_text,
      sortOrder: img.sort_order,
    })),
    createdAt: post.created_at,
    updatedAt: post.updated_at,
  }
})
