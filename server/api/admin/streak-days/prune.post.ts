import { createError, readBody } from 'h3'
import db from '../../../utils/db'

interface PruneBody {
  before: string
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export default defineEventHandler(async (event) => {
  const body = await readBody<PruneBody>(event)
  const before = body?.before

  if (!before || !DATE_RE.test(before)) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date format' })
  }

  const result = db.prepare('DELETE FROM github_streak_days WHERE date < ?').run(before)

  return { success: true, deleted: result.changes }
})
