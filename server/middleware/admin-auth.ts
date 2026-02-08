import { getAuthSession } from '../utils/auth'

export default defineEventHandler((event) => {
  const path = getRequestURL(event).pathname

  // Only protect /api/admin/* routes
  if (!path.startsWith('/api/admin')) {
    return
  }

  const session = getAuthSession(event)

  if (!session) {
    throw createError({ statusCode: 401, message: 'Authentication required' })
  }
})
