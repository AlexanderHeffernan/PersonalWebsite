import { getQuery } from 'h3'
import db from '../../../utils/db'

interface StreakDayRow {
  date: string
  has_contributions: number
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/

export default defineEventHandler((event) => {
  const query = getQuery(event)
  const from = typeof query.from === 'string' && DATE_RE.test(query.from) ? query.from : undefined
  const to = typeof query.to === 'string' && DATE_RE.test(query.to) ? query.to : undefined

  let rows: StreakDayRow[]

  if (from && to) {
    rows = db.prepare(
      'SELECT date, has_contributions FROM github_streak_days WHERE date >= ? AND date <= ? ORDER BY date DESC'
    ).all(from, to) as StreakDayRow[]
  } else if (from) {
    rows = db.prepare(
      'SELECT date, has_contributions FROM github_streak_days WHERE date >= ? ORDER BY date DESC'
    ).all(from) as StreakDayRow[]
  } else if (to) {
    rows = db.prepare(
      'SELECT date, has_contributions FROM github_streak_days WHERE date <= ? ORDER BY date DESC'
    ).all(to) as StreakDayRow[]
  } else {
    rows = db.prepare(
      'SELECT date, has_contributions FROM github_streak_days ORDER BY date DESC'
    ).all() as StreakDayRow[]
  }

  return rows.map((row) => ({
    date: row.date,
    hasContributions: row.has_contributions === 1,
  }))
})
