import { defineEventHandler, createError } from 'h3'
import db from '../../../utils/db'

export default defineEventHandler((event) => {
  const id = event.context.params?.id

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Submission ID is required',
    })
  }

  const stmt = db.prepare('DELETE FROM contact_submissions WHERE id = ?')

  try {
    const result = stmt.run(id)

    if (result.changes === 0) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Submission not found',
      })
    }

    return { success: true }
  } catch (error: any) {
    if (error.statusCode) throw error
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Failed to delete submission',
    })
  }
})
