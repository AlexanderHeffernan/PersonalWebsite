import { createError, getRouterParam } from 'h3'
import db from '../../utils/db'

interface WritingPostRow {
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
  sort_order: number
}

export interface WritingPost {
  id: number
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  readTime: string
  tags: string[]
  heroImageUrl: string | null
  heroImageAlt: string | null
  sortOrder: number
}

export default defineEventHandler((event): WritingPost => {
  const slug = getRouterParam(event, 'slug')
  
  if (!slug) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug is required',
    })
  }

  const row: WritingPostRow | undefined = db.prepare(`
    SELECT id, slug, title, excerpt, content, date, read_time, tags, hero_image_url, hero_image_alt, sort_order
    FROM writing_posts
    WHERE slug = ? AND published = 1
  `).get(slug) as WritingPostRow | undefined

  if (!row) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Post not found',
    })
  }

  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    date: row.date,
    readTime: row.read_time,
    tags: JSON.parse(row.tags),
    heroImageUrl: row.hero_image_url,
    heroImageAlt: row.hero_image_alt,
    sortOrder: row.sort_order,
  }
})
