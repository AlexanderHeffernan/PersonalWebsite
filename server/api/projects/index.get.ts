import db from '../../utils/db'

interface ProjectRow {
  id: number
  slug: string
  title: string
  description: string
  github_url: string | null
  live_url: string | null
  tags: string
  created_at: string
}

export default defineEventHandler(() => {
  const rows = db.prepare(`
    SELECT id, slug, title, description, github_url, live_url, tags, created_at
    FROM projects
    WHERE published = 1
    ORDER BY created_at DESC
  `).all() as ProjectRow[]

  return rows.map(row => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    githubUrl: row.github_url,
    liveUrl: row.live_url,
    tags: JSON.parse(row.tags),
    createdAt: row.created_at,
  }))
})
