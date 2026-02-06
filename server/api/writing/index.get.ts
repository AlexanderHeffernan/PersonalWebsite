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

export default defineEventHandler((): WritingPost[] => {
  const rows = db.prepare(`
    SELECT id, slug, title, excerpt, content, date, read_time, tags, hero_image_url, hero_image_alt, sort_order
    FROM writing_posts
    WHERE published = 1
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
    sortOrder: row.sort_order,
  }))
})
