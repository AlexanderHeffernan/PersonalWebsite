import { createError, readBody, getRouterParam } from 'h3'
import db from '../../../utils/db'

interface WorkExperience {
  id: number
  company: string
  role: string
  dateRange: string
  description: string
  technologies: string[]
  sortOrder: number
}

interface UpdateExperienceBody {
  company: string
  role: string
  dateRange: string
  description: string
  technologies: string[]
  sortOrder: number
}

export default defineEventHandler(async (event): Promise<WorkExperience> => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid experience ID',
    })
  }

  const body = await readBody<UpdateExperienceBody>(event)

  if (!body.company || !body.role || !body.dateRange || !body.description) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    })
  }

  const stmt = db.prepare(`
    UPDATE work_experience
    SET company = ?, role = ?, date_range = ?, description = ?, technologies = ?, sort_order = ?, updated_at = datetime('now')
    WHERE id = ?
    RETURNING *
  `)

  const row: any = stmt.get(
    body.company,
    body.role,
    body.dateRange,
    body.description,
    JSON.stringify(body.technologies || []),
    body.sortOrder ?? 0,
    id
  )

  if (!row) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Experience not found',
    })
  }

  return {
    id: row.id,
    company: row.company,
    role: row.role,
    dateRange: row.date_range,
    description: row.description,
    technologies: JSON.parse(row.technologies),
    sortOrder: row.sort_order,
  }
})
