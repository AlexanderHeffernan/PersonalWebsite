import db from '../../../utils/db'

interface UpdateProjectBody {
  slug?: string
  title?: string
  description?: string
  content?: string | null
  githubUrl?: string | null
  liveUrl?: string | null
  featuredOrder?: number | null
  tags?: string[]
  published?: boolean
}

export default defineEventHandler(async (event) => {
  const id = getRouterParam(event, 'id')
  const body = await readBody<UpdateProjectBody>(event)

  const existing = db.prepare('SELECT id FROM projects WHERE id = ?').get(id)
  if (!existing) {
    throw createError({ statusCode: 404, message: 'Project not found' })
  }

  if (body.slug) {
    const slugConflict = db.prepare('SELECT id FROM projects WHERE slug = ? AND id != ?').get(body.slug, id)
    if (slugConflict) {
      throw createError({ statusCode: 400, message: 'A project with this slug already exists' })
    }
  }

  db.prepare(`
    UPDATE projects SET
      slug = COALESCE(?, slug),
      title = COALESCE(?, title),
      description = COALESCE(?, description),
      content = COALESCE(?, content),
      github_url = ?,
      live_url = ?,
      featured_order = ?,
      tags = COALESCE(?, tags),
      published = COALESCE(?, published),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(
    body.slug || null,
    body.title || null,
    body.description || null,
    body.content,
    body.githubUrl ?? null,
    body.liveUrl ?? null,
    body.featuredOrder ?? null,
    body.tags ? JSON.stringify(body.tags) : null,
    body.published !== undefined ? (body.published ? 1 : 0) : null,
    id
  )

  return { success: true }
})
