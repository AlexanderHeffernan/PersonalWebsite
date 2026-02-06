import { defineEventHandler, readBody, createError } from 'h3'
import db from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = event.context.params?.id
  const body = await readBody(event)

  if (!id) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Submission ID is required',
    })
  }

  // Only allow updating status
  if (!body.status || !['unread', 'read', 'archived'].includes(body.status)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid status. Must be unread, read, or archived',
    })
  }

  const stmt = db.prepare(`
    UPDATE contact_submissions
    SET status = ?
    WHERE id = ?
  `)

  try {
    const result = stmt.run(body.status, id)

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
      statusMessage: 'Failed to update submission',
    })
  }
})
