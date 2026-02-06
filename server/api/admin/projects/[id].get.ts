import db from '../../../utils/db'

interface ProjectRow {
  id: number
  slug: string
  title: string
  description: string
  content: string | null
  github_url: string | null
  live_url: string | null
  featured_order: number | null
  tags: string
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

  const project = db.prepare(`
    SELECT * FROM projects WHERE id = ?
  `).get(id) as ProjectRow | undefined

  if (!project) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  const images = db.prepare(`
    SELECT id, url, alt_text, sort_order
    FROM project_images
    WHERE project_id = ?
    ORDER BY sort_order ASC
  `).all(id) as ImageRow[]

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    description: project.description,
    content: project.content,
    githubUrl: project.github_url,
    liveUrl: project.live_url,
    featuredOrder: project.featured_order,
    tags: JSON.parse(project.tags),
    images: images.map(img => ({
      id: img.id,
      url: img.url,
      alt: img.alt_text,
      sortOrder: img.sort_order,
    })),
    createdAt: project.created_at,
    updatedAt: project.updated_at,
  }
})
