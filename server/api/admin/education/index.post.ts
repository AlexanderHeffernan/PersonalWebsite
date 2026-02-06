import { createError, readBody } from 'h3'
import db from '../../../utils/db'
import type { Education } from '../../education/index.get'

interface CreateEducationBody {
  institution: string
  degree: string
  field?: string
  dateRange: string
  description?: string
  achievements: string[]
  sortOrder: number
}

export default defineEventHandler(async (event): Promise<Education> => {
  const body = await readBody<CreateEducationBody>(event)

  if (!body.institution || !body.degree || !body.dateRange) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    })
  }

  const stmt = db.prepare(`
    INSERT INTO education (institution, degree, field, date_range, description, achievements, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `)

  const row: any = stmt.get(
    body.institution,
    body.degree,
    body.field || null,
    body.dateRange,
    body.description || null,
    JSON.stringify(body.achievements || []),
    body.sortOrder ?? 0
  )

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
