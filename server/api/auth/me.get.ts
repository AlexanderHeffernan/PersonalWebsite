import { getSession } from '../../utils/auth'

export default defineEventHandler((event) => {
  const session = getSession(event)

  if (!session) {
    throw createError({ statusCode: 401, message: 'Not authenticated' })
  }

  return {
    githubUserId: session.github_user_id,
    githubUsername: session.github_username,
  }
})
