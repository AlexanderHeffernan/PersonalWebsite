import db from '../../../utils/db'

interface CreateProjectBody {
  slug: string
  title: string
  description: string
  content?: string
  githubUrl?: string
  liveUrl?: string
  featuredOrder?: number | null
  tags?: string[]
}

export default defineEventHandler(async (event) => {
  const body = await readBody<CreateProjectBody>(event)

  if (!body.slug || !body.title || !body.description) {
    throw createError({ statusCode: 400, message: 'slug, title, and description are required' })
  }

  const existing = db.prepare('SELECT id FROM projects WHERE slug = ?').get(body.slug)
  if (existing) {
    throw createError({ statusCode: 400, message: 'A project with this slug already exists' })
  }

  const result = db.prepare(`
    INSERT INTO projects (slug, title, description, content, github_url, live_url, featured_order, tags)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    body.slug,
    body.title,
    body.description,
    body.content || null,
    body.githubUrl || null,
    body.liveUrl || null,
    body.featuredOrder ?? null,
    JSON.stringify(body.tags || [])
  )

  return { id: result.lastInsertRowid }
})
