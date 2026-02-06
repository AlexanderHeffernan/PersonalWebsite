import db from '../../../utils/db'

interface ProjectRow {
  id: number
  slug: string
  title: string
  description: string
  featured_order: number | null
  created_at: string
}

export default defineEventHandler(() => {
  const rows = db.prepare(`
    SELECT id, slug, title, description, featured_order, created_at
    FROM projects
    ORDER BY created_at DESC
  `).all() as ProjectRow[]

  return rows.map(row => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    featuredOrder: row.featured_order,
    createdAt: row.created_at,
  }))
})
