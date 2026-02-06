import { createError, readBody, getRouterParam } from 'h3'
import db from '../../../utils/db'

interface WritingPost {
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

interface UpdateWritingBody {
  slug: string
  title: string
  excerpt: string
  content: string
  date: string
  readTime: string
  tags: string[]
  heroImageUrl?: string
  heroImageAlt?: string
  published: boolean
  sortOrder: number
}

export default defineEventHandler(async (event): Promise<WritingPost> => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid post ID',
    })
  }

  const body = await readBody<UpdateWritingBody>(event)

  if (!body.slug || !body.title || !body.excerpt || !body.content || !body.date || !body.readTime) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    })
  }

  // Check for duplicate slug (excluding current post)
  const existing = db.prepare('SELECT id FROM writing_posts WHERE slug = ? AND id != ?').get(body.slug, id)
  if (existing) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Slug already exists',
    })
  }

  const stmt = db.prepare(`
    UPDATE writing_posts
    SET slug = ?, title = ?, excerpt = ?, content = ?, date = ?, read_time = ?, tags = ?, hero_image_url = ?, hero_image_alt = ?, published = ?, sort_order = ?, updated_at = datetime('now')
    WHERE id = ?
    RETURNING *
  `)

  const row: any = stmt.get(
    body.slug,
    body.title,
    body.excerpt,
    body.content,
    body.date,
    body.readTime,
    JSON.stringify(body.tags || []),
    body.heroImageUrl || null,
    body.heroImageAlt || null,
    body.published ? 1 : 0,
    body.sortOrder ?? 0,
    id
  )

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
