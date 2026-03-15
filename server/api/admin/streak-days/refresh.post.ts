import { createError, readBody } from 'h3'
import db from '../../../utils/db'

const GITHUB_USERNAME = 'AlexanderHeffernan'
const TIME_ZONE = 'Pacific/Auckland'
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const MAX_RANGE_DAYS = 365

interface RefreshBody {
  from?: string
  to?: string
}

interface StreakRow {
  date: string
  has_contributions: number
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().split('T')[0]!
}

function getTodayDateString(): string {
  return new Date().toLocaleDateString('en-CA', { timeZone: TIME_ZONE })
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const map = Object.fromEntries(parts.map((p) => [p.type, p.value]))
  const asUTC = Date.UTC(
    Number(map.year),
    Number(map.month) - 1,
    Number(map.day),
    Number(map.hour),
    Number(map.minute),
    Number(map.second)
  )

  return (asUTC - date.getTime()) / 60000
}

function zonedStartOfDayISO(dateStr: string, timeZone: string): string {
  const [year, month, day] = dateStr.split('-').map(Number)
  let utcDate = new Date(Date.UTC(year!, (month! - 1), day!, 0, 0, 0))
  let offset = getTimeZoneOffsetMinutes(utcDate, timeZone)
  let adjusted = new Date(Date.UTC(year!, (month! - 1), day!, 0, 0, 0) - offset * 60000)

  const offset2 = getTimeZoneOffsetMinutes(adjusted, timeZone)
  if (offset2 !== offset) {
    adjusted = new Date(Date.UTC(year!, (month! - 1), day!, 0, 0, 0) - offset2 * 60000)
  }

  return adjusted.toISOString()
}

function buildRanges(dates: string[]): { from: string; to: string }[] {
  if (dates.length === 0) return []
  const sorted = Array.from(new Set(dates)).sort()
  const ranges: { from: string; to: string }[] = []
  let start = sorted[0]!
  let prev = sorted[0]!

  for (let i = 1; i < sorted.length; i++) {
    const current = sorted[i]!
    if (current === shiftDate(prev, 1)) {
      prev = current
      continue
    }
    ranges.push({ from: start, to: prev })
    start = current
    prev = current
  }
  ranges.push({ from: start, to: prev })
  return ranges
}

async function fetchContributionDays(from: string, to: string, token: string): Promise<{ date: string; contributionCount: number }[]> {
  const graphqlQuery = {
    query: `
      query($username: String!, $from: DateTime!, $to: DateTime!) {
        user(login: $username) {
          contributionsCollection(from: $from, to: $to) {
            contributionCalendar {
              weeks {
                contributionDays {
                  contributionCount
                  date
                }
              }
            }
          }
        }
      }
    `,
    variables: {
      username: GITHUB_USERNAME,
      from,
      to
    }
  }

  const response = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      'Authorization': `bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(graphqlQuery)
  })

  if (!response.ok) {
    throw createError({ statusCode: 502, statusMessage: `GitHub GraphQL API error: ${response.status}` })
  }

  const data = await response.json()
  const weeks = data.data?.user?.contributionsCollection?.contributionCalendar?.weeks || []
  return weeks.flatMap((w: any) => w.contributionDays)
}

function upsertStreakDays(days: { date: string; contributionCount: number }[]): void {
  const upsert = db.prepare(
    'INSERT INTO github_streak_days (date, has_contributions) VALUES (?, ?) ON CONFLICT(date) DO UPDATE SET has_contributions = excluded.has_contributions'
  )
  const tx = db.transaction((rows: { date: string; contributionCount: number }[]) => {
    for (const day of rows) {
      upsert.run(day.date, day.contributionCount > 0 ? 1 : 0)
    }
  })
  tx(days)
}

export default defineEventHandler(async (event) => {
  const token = process.env.GITHUB_TOKEN
  if (!token) {
    throw createError({ statusCode: 400, statusMessage: 'GITHUB_TOKEN not set' })
  }

  const body = await readBody<RefreshBody>(event)
  const today = getTodayDateString()

  const dbBounds = db.prepare(
    'SELECT MIN(date) as min_date, MAX(date) as max_date FROM github_streak_days'
  ).get() as { min_date: string | null; max_date: string | null }

  if (!dbBounds?.min_date) {
    return { updatedDays: 0, ranges: 0, message: 'No streak data available.' }
  }

  const from = body?.from && DATE_RE.test(body.from) ? body.from : dbBounds.min_date
  const to = body?.to && DATE_RE.test(body.to) ? body.to : today

  if (from > to) {
    throw createError({ statusCode: 400, statusMessage: 'Invalid date range' })
  }

  const rows = db.prepare(
    'SELECT date, has_contributions FROM github_streak_days WHERE date >= ? AND date <= ? ORDER BY date ASC'
  ).all(from, to) as StreakRow[]

  const existingDates = new Set(rows.map((r) => r.date))
  const zeroDates = rows.filter((r) => r.has_contributions === 0).map((r) => r.date)

  const missingDates: string[] = []
  for (let d = from; d <= to; d = shiftDate(d, 1)) {
    if (!existingDates.has(d)) {
      missingDates.push(d)
    }
  }

  const targetDates = [...zeroDates, ...missingDates]
  const ranges = buildRanges(targetDates)

  const chunkedRanges: { from: string; to: string }[] = []
  for (const range of ranges) {
    let cursor = range.from
    while (cursor <= range.to) {
      const chunkEnd = shiftDate(cursor, MAX_RANGE_DAYS - 1)
      const toDate = chunkEnd <= range.to ? chunkEnd : range.to
      chunkedRanges.push({ from: cursor, to: toDate })
      cursor = shiftDate(toDate, 1)
    }
  }

  let updatedDays = 0
  for (const range of chunkedRanges) {
    const fromISO = zonedStartOfDayISO(range.from, TIME_ZONE)
    const toISO = zonedStartOfDayISO(shiftDate(range.to, 1), TIME_ZONE)
    const days = await fetchContributionDays(fromISO, toISO, token)
    if (days.length > 0) {
      upsertStreakDays(days)
      updatedDays += days.length
    }
  }

  return {
    updatedDays,
    ranges: chunkedRanges.length,
    zerosChecked: zeroDates.length,
    missingChecked: missingDates.length,
    from,
    to,
  }
})
