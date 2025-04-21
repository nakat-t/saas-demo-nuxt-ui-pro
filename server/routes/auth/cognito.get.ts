export default defineOAuthCognitoEventHandler({
  config: {
    // scope cannot be set in runtimeConfig. Therefore, specify it here.
    scope: process.env.NUXT_OAUTH_COGNITO_SCOPE?.split(',') || []
  },

  async onSuccess(event, { user, tokens }) {
    // [Important]
    // Since we encrypt and store session data in cookies, we're constrained by the 4096-byte cookie size limit.
    // Store only essential information.
    await setUserSession(event, {
      user: {
        preferred_username: user?.preferred_username,
        email: user?.email
      },
      secure: {
        access_token: tokens?.access_token
      }
    })
    return sendRedirect(event, '/')
  },

  onError(event, error) {
    console.error('Cognito OAuth error:', error)
    return sendRedirect(event, '/')
  }
})
