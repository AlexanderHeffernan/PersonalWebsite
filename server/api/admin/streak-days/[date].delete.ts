import { createError, getRouterParam } from 'h3'
import db from '../../../utils/db'

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export default defineEventHandler((event) => {
  const date = getRouterParam(event, 'date')

  if (!date || !DATE_RE.test(date)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date format' })
  }

  db.prepare('DELETE FROM github_streak_days WHERE date = ?').run(date)

  return { success: true }
})
