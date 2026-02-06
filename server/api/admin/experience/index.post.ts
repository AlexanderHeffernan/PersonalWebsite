import { createError, readBody } from 'h3'
import db from '../../../utils/db'
import type { WorkExperience } from '../../experience/index.get'

interface CreateExperienceBody {
  company: string
  role: string
  dateRange: string
  description: string
  technologies: string[]
  sortOrder: number
}

export default defineEventHandler(async (event): Promise<WorkExperience> => {
  const body = await readBody<CreateExperienceBody>(event)

  if (!body.company || !body.role || !body.dateRange || !body.description) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Missing required fields',
    })
  }

  const stmt = db.prepare(`
    INSERT INTO work_experience (company, role, date_range, description, technologies, sort_order)
    VALUES (?, ?, ?, ?, ?, ?)
    RETURNING *
  `)

  const row: any = stmt.get(
    body.company,
    body.role,
    body.dateRange,
    body.description,
    JSON.stringify(body.technologies || []),
    body.sortOrder ?? 0
  )

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
