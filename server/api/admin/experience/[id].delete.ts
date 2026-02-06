import { createError, getRouterParam } from 'h3'
import db from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid experience ID',
    })
  }

  const result = db.prepare('DELETE FROM work_experience WHERE id = ?').run(id)

  if (result.changes === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Experience not found',
    })
  }

  return { success: true }
})
