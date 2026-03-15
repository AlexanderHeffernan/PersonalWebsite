import db from '../../../utils/db'

const TIME_ZONE = 'Pacific/Auckland'

function getTodayDateString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TIME_ZONE })
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().split('T')[0]!
}

function calculateStreakFromDb(): number {
  const rows: { date: string; has_contributions: number }[] = db.prepare(
    'SELECT date, has_contributions FROM github_streak_days ORDER BY date DESC'
  ).all() as any[]

  if (rows.length === 0) return 0

  const today = getTodayDateString()
  let streak = 0
  let expectedDate = today

  for (const row of rows) {
    if (row.date === expectedDate) {
      if (row.has_contributions) {
        streak++
      } else if (row.date === today) {
        expectedDate = shiftDate(expectedDate, -1)
        continue
      } else {
        break
      }
      expectedDate = shiftDate(expectedDate, -1)
    } else if (row.date < expectedDate) {
      if (expectedDate === today) {
        expectedDate = shiftDate(expectedDate, -1)
        if (row.date === expectedDate && row.has_contributions) {
          streak++
          expectedDate = shiftDate(expectedDate, -1)
        } else {
          break
        }
      } else {
        break
      }
    }
  }

  return streak
}

export default defineEventHandler(() => {
  const today = getTodayDateString()
  const streak = calculateStreakFromDb()

  db.prepare(
    `UPDATE github_activity_cache
     SET streak_days = ?,
         streak_calculated_date = ?,
         cached_at = datetime('now'),
         updated_at = datetime('now')
     WHERE id = 1`
  ).run(streak, today)

  return { success: true, streak, calculatedDate: today }
})
