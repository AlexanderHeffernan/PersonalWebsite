import db from '../../utils/db'

interface ProjectRow {
  id: number
  slug: string
  title: string
  description: string
  content: string | null
  github_url: string | null
  live_url: string | null
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
  const slug = getRouterParam(event, 'slug')

  const project = db.prepare(`
    SELECT id, slug, title, description, content, github_url, live_url, tags, created_at, updated_at
    FROM projects
    WHERE slug = ? AND published = 1
  `).get(slug) as ProjectRow | undefined

  if (!project) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  const images = db.prepare(`
    SELECT id, url, alt_text, sort_order
    FROM project_images
    WHERE project_id = ?
    ORDER BY sort_order ASC
  `).all(project.id) as ImageRow[]

  return {
    id: project.id,
    slug: project.slug,
    title: project.title,
    description: project.description,
    content: project.content,
    githubUrl: project.github_url,
    liveUrl: project.live_url,
    tags: JSON.parse(project.tags),
    images: images.map(img => ({
      id: img.id,
      url: img.url,
      alt: img.alt_text,
    })),
    createdAt: project.created_at,
    updatedAt: project.updated_at,
  }
})
