import { createError, readBody, getRouterParam } from 'h3'
import db from '../../../utils/db'

interface UpdateBody {
  hasContributions: boolean | number
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export default defineEventHandler(async (event) => {
  const date = getRouterParam(event, 'date')

  if (!date || !DATE_RE.test(date)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date format' })
  }

  const body = await readBody<UpdateBody>(event)
  const hasContributions = body?.hasContributions

  if (hasContributions === undefined || hasContributions === null) {
    throw createError({ statusCode: 400, statusMessage: 'hasContributions is required' })
  }

  const value = hasContributions === true || hasContributions === 1 ? 1 : 0

  db.prepare(
    'INSERT INTO github_streak_days (date, has_contributions) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET has_contributions = excluded.has_contributions'
  ).run(date, value)

  return { success: true, date, hasContributions: value === 1 }
})
