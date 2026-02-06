import db from '../../utils/db'

interface EducationRow {
  id: number
  institution: string
  degree: string
  field: string | null
  date_range: string
  description: string | null
  achievements: string
  sort_order: number
}

export interface Education {
  id: number
  institution: string
  degree: string
  field: string | null
  dateRange: string
  description: string | null
  achievements: string[]
  sortOrder: number
}

export default defineEventHandler((): Education[] => {
  const rows = db.prepare(`
    SELECT id, institution, degree, field, date_range, description, achievements, sort_order
    FROM education
    ORDER BY sort_order ASC, created_at DESC
  `).all() as EducationRow[]

  return rows.map(row => ({
    id: row.id,
    institution: row.institution,
    degree: row.degree,
    field: row.field,
    dateRange: row.date_range,
    description: row.description,
    achievements: JSON.parse(row.achievements),
    sortOrder: row.sort_order,
  }))
})
