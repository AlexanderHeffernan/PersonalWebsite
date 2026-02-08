import type { H3Event } from 'h3'
import { getCookie, setCookie, deleteCookie } from 'h3'
import db from './db'

const SESSION_COOKIE = 'session_id'
const SESSION_MAX_AGE = 60 * 60 * 24 * 7 // 7 days

interface Session {
  id: string
  github_user_id: number
  github_username: string
  created_at: string
  expires_at: string
}

export function generateSessionId(): string {
  const array = new Uint8Array(32)
  crypto.getRandomValues(array)
  return Array.from(array, b => b.toString(16).padStart(2, '0')).join('')
}

export function createSession(event: H3Event, githubUserId: number, githubUsername: string): string {
  const sessionId = generateSessionId()
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE * 1000).toISOString()

  db.prepare(`
    INSERT INTO sessions (id, github_user_id, github_username, expires_at)
    VALUES (?, ?, ?, ?)
  `).run(sessionId, githubUserId, githubUsername, expiresAt)

  setCookie(event, SESSION_COOKIE, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SESSION_MAX_AGE,
    path: '/',
  })

  return sessionId
}

export function getAuthSession(event: H3Event): Session | null {
  const sessionId = getCookie(event, SESSION_COOKIE)
  if (!sessionId) return null

  const session = db.prepare(`
    SELECT * FROM sessions 
    WHERE id = ? AND expires_at > datetime('now')
  `).get(sessionId) as Session | undefined

  if (!session) {
    deleteCookie(event, SESSION_COOKIE)
    return null
  }

  return session
}

export function deleteSession(event: H3Event): void {
  const sessionId = getCookie(event, SESSION_COOKIE)
  if (sessionId) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId)
  }
  deleteCookie(event, SESSION_COOKIE)
}

export function isAllowedUser(githubUserId: number): boolean {
  const allowedId = process.env.ALLOWED_GITHUB_USER_ID
  if (!allowedId) return false
  return githubUserId === parseInt(allowedId, 10)
}
