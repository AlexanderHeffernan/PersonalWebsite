import db from '../../../utils/db'
import type { WorkExperience } from '../../../api/experience/index.get'

interface WorkExperienceRow {
  id: number
  company: string
  role: string
  date_range: string
  description: string
  technologies: string
  sort_order: number
}

export default defineEventHandler((): WorkExperience[] => {
  const rows = db.prepare(`
    SELECT id, company, role, date_range, description, technologies, sort_order
    FROM work_experience
    ORDER BY sort_order ASC, created_at DESC
  `).all() as WorkExperienceRow[]

  return rows.map(row => ({
    id: row.id,
    company: row.company,
    role: row.role,
    dateRange: row.date_range,
    description: row.description,
    technologies: JSON.parse(row.technologies),
    sortOrder: row.sort_order,
  }))
})
