import db from '../../utils/db'

interface ProjectRow {
  id: number
  slug: string
  title: string
  description: string
  github_url: string | null
  live_url: string | null
  featured_order: number
  tags: string
  thumbnail_url: string | null
  thumbnail_alt: string | null
}

export default defineEventHandler(() => {
  const rows = db.prepare(`
    SELECT 
      p.id, p.slug, p.title, p.description, p.github_url, p.live_url, p.featured_order, p.tags,
      (SELECT url FROM project_images WHERE project_id = p.id ORDER BY sort_order LIMIT 1) as thumbnail_url,
      (SELECT alt_text FROM project_images WHERE project_id = p.id ORDER BY sort_order LIMIT 1) as thumbnail_alt
    FROM projects p
    WHERE p.featured_order IS NOT NULL
    ORDER BY p.featured_order ASC
  `).all() as ProjectRow[]

  return rows.map(row => ({
    id: row.id,
    slug: row.slug,
    title: row.title,
    description: row.description,
    githubUrl: row.github_url,
    liveUrl: row.live_url,
    featuredOrder: row.featured_order,
    tags: JSON.parse(row.tags),
    thumbnail: row.thumbnail_url ? { url: row.thumbnail_url, alt: row.thumbnail_alt } : null,
  }))
})
