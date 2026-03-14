import { defineEventHandler } from 'h3'
import db from '../../utils/db'

interface GitHubActivity {
  isActive: boolean
  lastCommit: {
    message: string
    hoursAgo: number
    timeText: string
    url: string
  } | null
  weekCommits: number
  streak: number
  languages: Record<string, number>
  currentRepo: string | null
  timeOfDay: 'morning' | 'office' | 'evening' | 'night' | 'sleep'
}

const CACHE_TTL_MINUTES = 15
const GITHUB_USERNAME = 'AlexanderHeffernan'

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0]!
}

function getLatestStreakDay(): { date: string } | undefined {
  return db.prepare('SELECT date FROM github_streak_days ORDER BY date DESC LIMIT 1').get() as { date: string } | undefined
}

function getCachedStreakForToday(): number | null {
  const row: any = db.prepare(
    'SELECT streak_days, streak_calculated_date FROM github_activity_cache WHERE id = 1'
  ).get()
  if (row?.streak_calculated_date === getTodayDateString()) {
    return row.streak_days
  }
  return null
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
    throw new Error(`GitHub GraphQL API error: ${response.status}`)
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
        // Day-0 grace: today has no contributions yet, skip but don't break
        expectedDate = shiftDate(expectedDate, -1)
        continue
      } else {
        break
      }
      expectedDate = shiftDate(expectedDate, -1)
    } else if (row.date < expectedDate) {
      // There's a gap — missing day means no contributions
      // But if the gap is just today (expectedDate === today), apply grace
      if (expectedDate === today) {
        expectedDate = shiftDate(expectedDate, -1)
        // Re-check this row against the new expectedDate
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

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00Z')
  d.setUTCDate(d.getUTCDate() + days)
  return d.toISOString().split('T')[0]!
}

function pruneOldStreakDays(): void {
  // Find the most recent completed day with 0 contributions (not today)
  const today = getTodayDateString()
  const breakDay: any = db.prepare(
    'SELECT date FROM github_streak_days WHERE has_contributions = 0 AND date < ? ORDER BY date DESC LIMIT 1'
  ).get(today)

  if (breakDay) {
    db.prepare('DELETE FROM github_streak_days WHERE date < ?').run(breakDay.date)
  }
}

async function calculateStreak(token: string): Promise<number> {
  // 1. Check if we already calculated today
  const cachedStreak = getCachedStreakForToday()
  if (cachedStreak !== null) {
    return cachedStreak
  }

  // 2. Determine GraphQL fetch window
  const today = getTodayDateString()
  const latestRow = getLatestStreakDay()
  let fromDate: string

  if (latestRow) {
    // Fetch from the day after our latest stored date (but always re-fetch today)
    const dayAfterLatest = shiftDate(latestRow.date, 1)
    fromDate = dayAfterLatest <= today ? dayAfterLatest : today
  } else {
    // Bootstrap: fetch last 90 days
    fromDate = shiftDate(today, -90)
  }

  // Always include today in the fetch (today's count can change)
  const toDate = new Date().toISOString()
  const fromISO = new Date(fromDate + 'T00:00:00Z').toISOString()

  // 3. Fetch and upsert
  const days = await fetchContributionDays(fromISO, toDate, token)
  if (days.length > 0) {
    upsertStreakDays(days)
  }

  // 4. Calculate streak from DB
  const streak = calculateStreakFromDb()

  // 5. Prune old data
  pruneOldStreakDays()

  // 6. Cache the streak for today
  db.prepare(
    'UPDATE github_activity_cache SET streak_days = ?, streak_calculated_date = ? WHERE id = 1'
  ).run(streak, today)

  return streak
}

function getGitHubToken() {
  const token = process.env.GITHUB_TOKEN
  console.log('GitHub token exists:', !!token, token ? `(${token.substring(0, 10)}...)` : 'NOT SET')
  return token
}

function getTimeOfDay(): GitHubActivity['timeOfDay'] {
  const hour = Number(new Intl.DateTimeFormat('en-NZ', { timeZone: 'Pacific/Auckland', hour: '2-digit', hour12: false}).format(new Date()))
  if (hour >= 6 && hour < 9) return 'morning'
  if (hour >= 9 && hour < 16) return 'office'
  if (hour >= 16 && hour < 19) return 'evening'
  if (hour >= 19 && hour < 23) return 'night'
  return 'sleep'
}

function formatTimeAgo(hoursAgo: number): string {
  if (hoursAgo < 1) return 'JUST NOW'
  if (hoursAgo < 2) return '1H AGO'
  if (hoursAgo < 24) return `${Math.floor(hoursAgo)}H AGO`
  const daysAgo = Math.floor(hoursAgo / 24)
  if (daysAgo === 1) return '1 DAY AGO'
  return `${daysAgo} DAYS AGO`
}

async function fetchGitHubActivity(): Promise<GitHubActivity | null> {
  const GITHUB_TOKEN = getGitHubToken()
  
  if (!GITHUB_TOKEN) {
    console.warn('GITHUB_TOKEN not set, skipping GitHub activity fetch')
    return null
  }

  try {
    console.log(`Fetching GitHub activity for ${GITHUB_USERNAME}...`)
    
    // Use GraphQL API for accurate contribution data (week commits + languages)
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const now = new Date().toISOString()
    
    const graphqlQuery = {
      query: `
        query($username: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $username) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                totalContributions
              }
              commitContributionsByRepository {
                repository {
                  name
                  primaryLanguage {
                    name
                  }
                }
                contributions {
                  totalCount
                }
              }
            }
          }
        }
      `,
      variables: {
        username: GITHUB_USERNAME,
        from: oneWeekAgo,
        to: now
      }
    }
    
    const graphqlResponse = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `bearer ${GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(graphqlQuery)
    })
    
    if (!graphqlResponse.ok) {
      const errorText = await graphqlResponse.text()
      console.error(`GitHub GraphQL API error: ${graphqlResponse.status}`, errorText)
      throw new Error(`GitHub GraphQL API error: ${graphqlResponse.status}`)
    }
    
    const graphqlData = await graphqlResponse.json()
    console.log('GraphQL response:', JSON.stringify(graphqlData, null, 2))
    
    const contributions = graphqlData.data?.user?.contributionsCollection
    const weekCommits = contributions?.contributionCalendar?.totalContributions || 0
    
    console.log(`Accurate week commits from GraphQL: ${weekCommits}`)

    // Calculate streak using persistent DB + GraphQL
    const streak = await calculateStreak(GITHUB_TOKEN)
    
    // Still need REST API for latest commit message and timing
    const eventsResponse = await fetch(
      `https://api.github.com/users/${GITHUB_USERNAME}/events?per_page=50`,
      {
        headers: {
          'Authorization': `token ${GITHUB_TOKEN}`,
          'Accept': 'application/vnd.github.v3+json',
        },
      }
    )

    console.log(`GitHub REST API response status: ${eventsResponse.status}`)

    if (!eventsResponse.ok) {
      const errorText = await eventsResponse.text()
      console.error(`GitHub API error: ${eventsResponse.status}`, errorText)
      throw new Error(`GitHub API error: ${eventsResponse.status}`)
    }

    const events = await eventsResponse.json()
    console.log(`Fetched ${events.length} events`)
    
    // Filter to push events (commits)
    const pushEvents = events.filter((e: any) => e.type === 'PushEvent')
    console.log(`Found ${pushEvents.length} total push events`)
    
    if (pushEvents.length === 0) {
      return {
        isActive: false,
        lastCommit: null,
        weekCommits: 0,
        streak: 0,
        languages: {},
        currentRepo: null,
        timeOfDay: getTimeOfDay(),
      }
    }

    // Last commit info
    const lastPush = pushEvents[0]
    const lastCommitDate = new Date(lastPush.created_at)
    const hoursAgo = (Date.now() - lastCommitDate.getTime()) / (1000 * 60 * 60)
    
    // Fetch actual commit message from the commits API
    let lastCommitMessage = 'Recent commit'
    try {
      const repoFullName = lastPush.repo.name
      const commitSha = lastPush.payload.head
      
      if (commitSha) {
        const commitResponse = await fetch(
          `https://api.github.com/repos/${repoFullName}/commits/${commitSha}`,
          {
            headers: {
              'Authorization': `token ${GITHUB_TOKEN}`,
              'Accept': 'application/vnd.github.v3+json',
            },
          }
        )
        
        if (commitResponse.ok) {
          const commitData = await commitResponse.json()
          lastCommitMessage = commitData.commit.message.split('\n')[0] // First line only
          console.log(`Fetched commit message: ${lastCommitMessage}`)
        }
      }
    } catch (err) {
      console.error('Failed to fetch commit message:', err)
    }

    // Calculate language breakdown from actual repo language data
    const languageStats: Record<string, number> = {}
    const commitsByRepo = contributions?.commitContributionsByRepository || []
    
    // Fetch actual language breakdown for repos committed to this week
    for (const repoData of commitsByRepo) {
      const repoName = repoData.repository.name
      try {
        const langResponse = await fetch(`https://api.github.com/repos/${GITHUB_USERNAME}/${repoName}/languages`, {
          headers: {
            'Authorization': `token ${GITHUB_TOKEN}`,
            'Accept': 'application/vnd.github.v3+json',
          },
        })
        
        if (langResponse.ok) {
          const langData = await langResponse.json()
          // langData is like: { "TypeScript": 12345, "Vue": 5678, "CSS": 1234 }
          // Weight each repo's languages by commit count
          const commitWeight = repoData.contributions.totalCount
          Object.entries(langData).forEach(([lang, bytes]: [string, any]) => {
            languageStats[lang] = (languageStats[lang] || 0) + (bytes * commitWeight)
          })
        }
      } catch (err) {
        console.error(`Failed to fetch languages for ${repoName}:`, err)
      }
    }
    
    // Convert to percentages
    const languages: Record<string, number> = {}
    const totalBytes = Object.values(languageStats).reduce((a: number, b: number) => a + b, 0)
    if (totalBytes > 0) {
      Object.entries(languageStats).forEach(([lang, bytes]) => {
        const pct = Math.round((bytes / totalBytes) * 100)
        if (pct > 0) { // Only include languages with at least 1%
          languages[lang] = pct
        }
      })
    }
    
    console.log('Language breakdown:', languages)

    // Get current repo
    const currentRepo = lastPush.repo.name.split('/')[1]
    const repoFullName = lastPush.repo.name
    const commitSha = lastPush.payload.head
    const commitUrl = `https://github.com/${repoFullName}/commit/${commitSha}`

    // Use actual language data or fallback to mock
    const finalLanguages = Object.keys(languages).length > 0 ? languages : { TypeScript: 85, Vue: 12, SQL: 3 }

    // Truncate commit message if too long (shorter to prevent wrapping)
    const maxLength = 30
    const truncatedMessage = lastCommitMessage.length > maxLength 
      ? lastCommitMessage.substring(0, maxLength) + '...'
      : lastCommitMessage

    return {
      isActive: hoursAgo < 24,
      lastCommit: {
        message: truncatedMessage,
        hoursAgo,
        timeText: formatTimeAgo(hoursAgo),
        url: commitUrl,
      },
      weekCommits,
      streak,
      languages: finalLanguages,
      currentRepo,
      timeOfDay: getTimeOfDay(),
    }
  } catch (error) {
    console.error('Error fetching GitHub activity:', error)
    return null
  }
}

function getCachedActivity(): GitHubActivity | null {
  const row: any = db.prepare(`
    SELECT * FROM github_activity_cache 
    WHERE id = 1 
    AND datetime(cached_at, '+${CACHE_TTL_MINUTES} minutes') > datetime('now')
  `).get()

  if (!row) return null

  return {
    isActive: Boolean(row.is_active),
    lastCommit: row.last_commit_message ? {
      message: row.last_commit_message,
      hoursAgo: row.last_commit_hours_ago,
      timeText: formatTimeAgo(row.last_commit_hours_ago),
      url: row.last_commit_url || '',
    } : null,
    weekCommits: row.week_commit_count || 0,
    streak: row.streak_days || 0,
    languages: JSON.parse(row.languages_json || '{}'),
    currentRepo: row.current_repo,
    timeOfDay: getTimeOfDay(),
  }
}

function saveActivityCache(activity: GitHubActivity): void {
  db.prepare(`
    UPDATE github_activity_cache
    SET 
      last_commit_date = ?,
      last_commit_message = ?,
      last_commit_url = ?,
      last_commit_hours_ago = ?,
      week_commit_count = ?,
      streak_days = ?,
      languages_json = ?,
      current_repo = ?,
      is_active = ?,
      cached_at = datetime('now'),
      updated_at = datetime('now')
    WHERE id = 1
  `).run(
    activity.lastCommit ? new Date(Date.now() - activity.lastCommit.hoursAgo * 60 * 60 * 1000).toISOString() : null,
    activity.lastCommit?.message || null,
    activity.lastCommit?.url || null,
    activity.lastCommit?.hoursAgo || null,
    activity.weekCommits,
    activity.streak,
    JSON.stringify(activity.languages),
    activity.currentRepo,
    activity.isActive ? 1 : 0
  )
}

export default defineEventHandler(async (): Promise<GitHubActivity> => {
  console.log('============================================')
  console.log('GitHub activity endpoint called!')
  console.log('============================================')
  
  // Try cache first
  const cached = getCachedActivity()
  if (cached) {
    console.log('Returning cached activity')
    return cached
  }

  console.log('Cache miss, fetching fresh data...')
  
  // Fetch fresh data
  const activity = await fetchGitHubActivity()
  
  if (activity) {
    console.log('Activity fetched successfully:', activity)
    saveActivityCache(activity)
    return activity
  }

  console.log('No activity data, returning fallback')
  
  // Fallback if API fails
  return {
    isActive: false,
    lastCommit: null,
    weekCommits: 0,
    streak: 0,
    languages: {},
    currentRepo: null,
    timeOfDay: getTimeOfDay(),
  }
})
