export default defineOAuthCognitoEventHandler({
  // Empty config or only override specific values if needed
  // The default configuration from useRuntimeConfig().oauth.cognito will be used
  config: {},

  // onSuccess receives user information directly from userinfo endpoint
  async onSuccess(event, { user /* , tokens */ }) {
    // User already contains information from userinfo endpoint
    await setUserSession(event, {
      user: {
        // Keep only necessary user information to avoid session size limits
        preferred_username: user.preferred_username,
        email: user.email,
        email_verified: user.email_verified
      },
      loggedInAt: new Date().toISOString()
    })
    return sendRedirect(event, '/')
  },

  // Optional error handling
  onError(event, error) {
    console.error('Cognito OAuth error:', error)
    return sendRedirect(event, '/')
  }
})
