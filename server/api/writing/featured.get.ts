import db from '../../utils/db'

interface WritingPostRow {
  id: number
  slug: string
  title: string
  excerpt: string
  date: string
  read_time: string
  tags: string
}

export default defineEventHandler(() => {
  const rows = db.prepare(`
    SELECT id, slug, title, excerpt, date, read_time, tags
    FROM writing_posts
    WHERE published = 1
    ORDER BY sort_order ASC, date DESC
    LIMIT 3
  `).all() as WritingPostRow[]

  return rows.map(row => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    date: row.date,
    readTime: row.read_time,
    tags: JSON.parse(row.tags),
  }))
})
