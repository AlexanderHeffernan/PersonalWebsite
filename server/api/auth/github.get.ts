export default defineEventHandler((event) => {
  const config = useRuntimeConfig()
  
  const params = new URLSearchParams({
    client_id: config.githubClientId,
    redirect_uri: config.githubCallbackUrl,
    scope: 'read:user',
  })

  return sendRedirect(event, `https://github.com/login/oauth/authorize?${params}`)
})
