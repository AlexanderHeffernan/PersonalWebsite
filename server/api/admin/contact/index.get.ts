import { defineEventHandler } from 'h3'
import db from '../../../utils/db'

export interface ContactSubmission {
  id: number
  name: string
  email: string
  message: string
  status: 'unread' | 'read' | 'archived'
  createdAt: string
}

export default defineEventHandler((): ContactSubmission[] => {

  const rows: any[] = db.prepare(`
    SELECT id, name, email, message, status, created_at
    FROM contact_submissions
    ORDER BY created_at DESC
  `).all()

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    message: row.message,
    status: row.status,
    createdAt: row.created_at,
  }))
})
