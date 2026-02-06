import db from '../../../utils/db'
import type { WritingPost } from '../../../api/writing/index.get'

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
  published: number
  sort_order: number
}

export default defineEventHandler((): WritingPost[] => {
  const rows = db.prepare(`
    SELECT id, slug, title, excerpt, content, date, read_time, tags, hero_image_url, hero_image_alt, published, sort_order
    FROM writing_posts
    ORDER BY sort_order ASC, date DESC
  `).all() as WritingPostRow[]

  return rows.map(row => ({
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
    published: row.published,
    sortOrder: row.sort_order,
  }))
})
