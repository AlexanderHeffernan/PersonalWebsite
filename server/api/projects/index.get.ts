import db from '../../utils/db'

interface ProjectRow {
  id: number
  slug: string
  title: string
  description: string
  github_url: string | null
  live_url: string | null
  featured_order: number | null
  tags: string
  created_at: string
}

export default defineEventHandler(() => {
  const rows = db.prepare(`
    SELECT id, slug, title, description, github_url, live_url, featured_order, tags, created_at
    FROM projects
    ORDER BY created_at DESC
  `).all() as ProjectRow[]

  return rows.map(row => ({
    ...row,
    tags: JSON.parse(row.tags),
  }))
})
