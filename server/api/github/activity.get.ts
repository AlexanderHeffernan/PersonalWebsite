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

function getGitHubToken() {
  const token = process.env.GITHUB_TOKEN
  console.log('GitHub token exists:', !!token, token ? `(${token.substring(0, 10)}...)` : 'NOT SET')
  return token
}

function getTimeOfDay(): GitHubActivity['timeOfDay'] {
  const hour = new Date().getHours()
  if (hour >= 3 && hour < 9) return 'sleep'
  if (hour >= 9 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 18) return 'office'
  if (hour >= 18 && hour < 24) return 'evening'
  return 'night'
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
    
    // Use GraphQL API for accurate contribution data
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()
    const now = new Date().toISOString()
    
    const graphqlQuery = {
      query: `
        query($username: String!, $from: DateTime!, $to: DateTime!) {
          user(login: $username) {
            contributionsCollection(from: $from, to: $to) {
              contributionCalendar {
                totalContributions
                weeks {
                  contributionDays {
                    contributionCount
                    date
                  }
                }
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

    // Calculate streak (simplified - days with commits)
    const commitDates = new Set(
      pushEvents.map((e: any) => new Date(e.created_at).toDateString())
    )
    let streak = 0
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today)
      checkDate.setDate(today.getDate() - i)
      if (commitDates.has(checkDate.toDateString())) {
        streak++
      } else if (i > 0) {
        break
      }
    }

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
