import { createError, readBody, getRouterParam } from 'h3'
import db from '../../../utils/db'

interface Education {
  id: number
  institution: string
  degree: string
  field: string | null
  dateRange: string
  description: string | null
  achievements: string[]
  sortOrder: number
}

interface UpdateEducationBody {
  institution: string
  degree: string
  field?: string
  dateRange: string
  description?: string
  achievements: string[]
  sortOrder: number
}

export default defineEventHandler(async (event): Promise<Education> => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid education ID',
    })
  }

  const body = await readBody<UpdateEducationBody>(event)

  if (!body.institution || !body.degree || !body.dateRange) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    })
  }

  const stmt = db.prepare(`
    UPDATE education
    SET institution = ?, degree = ?, field = ?, date_range = ?, description = ?, achievements = ?, sort_order = ?, updated_at = datetime('now')
    WHERE id = ?
    RETURNING *
  `)

  const row: any = stmt.get(
    body.institution,
    body.degree,
    body.field || null,
    body.dateRange,
    body.description || null,
    JSON.stringify(body.achievements || []),
    body.sortOrder ?? 0,
    id
  )

  if (!row) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Education not found',
    })
  }

  return {
    id: row.id,
    institution: row.institution,
    degree: row.degree,
    field: row.field,
    dateRange: row.date_range,
    description: row.description,
    achievements: JSON.parse(row.achievements),
    sortOrder: row.sort_order,
  }
})
