import { createError, getRouterParam } from 'h3'
import db from '../../../utils/db'

export default defineEventHandler(async (event) => {
  const id = parseInt(getRouterParam(event, 'id') || '')
  
  if (isNaN(id)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid education ID',
    })
  }

  const result = db.prepare('DELETE FROM education WHERE id = ?').run(id)

  if (result.changes === 0) {
    throw createError({
      statusCode: 404,
      statusMessage: 'Education not found',
    })
  }

  return { success: true }
})
