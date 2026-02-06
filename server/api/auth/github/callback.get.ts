import { createSession, isAllowedUser } from '../../../utils/auth'

interface GitHubTokenResponse {
  access_token: string
  token_type: string
  scope: string
}

interface GitHubUser {
  id: number
  login: string
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const query = getQuery(event)
  const code = query.code as string

  if (!code) {
    throw createError({ statusCode: 400, message: 'Missing authorization code' })
  }

  // Exchange code for access token
  const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      client_id: config.githubClientId,
      client_secret: config.githubClientSecret,
      code,
    }),
  })

  const tokenData = await tokenResponse.json() as GitHubTokenResponse

  if (!tokenData.access_token) {
    throw createError({ statusCode: 401, message: 'Failed to get access token' })
  }

  // Get user info
  const userResponse = await fetch('https://api.github.com/user', {
    headers: {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'Accept': 'application/vnd.github+json',
    },
  })

  const user = await userResponse.json() as GitHubUser

  if (!user.id) {
    throw createError({ statusCode: 401, message: 'Failed to get user info' })
  }

  // Check if user is allowed
  if (!isAllowedUser(user.id)) {
    throw createError({ statusCode: 403, message: 'Access denied. You are not authorized to access this admin panel.' })
  }

  // Create session
  createSession(event, user.id, user.login)

  // Redirect to admin
  return sendRedirect(event, '/admin')
})
