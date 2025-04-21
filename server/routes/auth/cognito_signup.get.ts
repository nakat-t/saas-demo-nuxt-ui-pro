import { defu } from 'defu'
import type { H3Error, H3Event } from 'h3'
import { getRequestURL } from 'h3'
import { FetchError } from 'ofetch'
import { discovery } from 'openid-client'
import { snakeCase, upperFirst } from 'scule'
import { withQuery } from 'ufo'
import type { OAuthProvider, OnError } from '#auth-utils'

// The following code is taken from nuxt-auth-utils module:
// @see https://github.com/atinux/nuxt-auth-utils/
// @see https://github.com/atinux/nuxt-auth-utils/blob/main/src/runtime/server/lib/utils.ts
// @see https://github.com/atinux/nuxt-auth-utils/blob/main/src/runtime/server/lib/oauth/cognito.ts

function getOAuthRedirectURL(event: H3Event): string {
  const requestURL = getRequestURL(event)

  return `${requestURL.protocol}//${requestURL.host}${requestURL.pathname}`
}

/**
 * Request an access token body.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.3
 */
export interface RequestAccessTokenBody {
  grant_type: 'authorization_code'
  code: string
  redirect_uri: string
  client_id: string
  client_secret?: string
  [key: string]: string | undefined
}

interface RequestAccessTokenOptions {
  body?: RequestAccessTokenBody
  params?: Record<string, string | undefined>
  headers?: Record<string, string>
}

/**
 * Request an access token from the OAuth provider.
 *
 * When an error occurs, only the error data is returned.
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.3
 */
// TODO: waiting for https://github.com/atinux/nuxt-auth-utils/pull/140
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function requestAccessToken(url: string, options: RequestAccessTokenOptions): Promise<any> {
  const headers = {
    'Content-Type': 'application/x-www-form-urlencoded',
    ...options.headers
  }

  // Encode the body as a URLSearchParams if the content type is 'application/x-www-form-urlencoded'.
  const body = headers['Content-Type'] === 'application/x-www-form-urlencoded'
    ? new URLSearchParams(options.body as unknown as Record<string, string> || options.params || {}
      ).toString()
    : options.body

  return $fetch(url, {
    method: 'POST',
    headers,
    body
  }).catch((error) => {
    /**
     * For a better error handling, only unauthorized errors are intercepted, and other errors are re-thrown.
     */
    if (error instanceof FetchError && error.status === 401) {
      return error.data
    }
    throw error
  })
}

/**
 * Handle OAuth access token error response
 *
 * @see https://datatracker.ietf.org/doc/html/rfc6749#section-5.2
 */
// TODO: waiting for https://github.com/atinux/nuxt-auth-utils/pull/140
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function handleAccessTokenErrorResponse(event: H3Event, oauthProvider: OAuthProvider, oauthError: any, onError?: OnError) {
  const message = `${upperFirst(oauthProvider)} login failed: ${oauthError.error_description || oauthError.error || 'Unknown error'}`

  const error = createError({
    statusCode: 401,
    message,
    data: oauthError
  })

  if (!onError) throw error
  return onError(event, error)
}

function handleMissingConfiguration(event: H3Event, provider: OAuthProvider, missingKeys: string[], onError?: OnError) {
  const environmentVariables = missingKeys.map(key => `NUXT_OAUTH_${provider.toUpperCase()}_${snakeCase(key).toUpperCase()}`)

  const error = createError({
    statusCode: 500,
    message: `Missing ${environmentVariables.join(' or ')} env ${missingKeys.length > 1 ? 'variables' : 'variable'}.`
  })

  if (!onError) throw error
  return onError(event, error)
}

export default defineEventHandler(async (event: H3Event) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onSuccess = async (event: H3Event, { user, tokens }: { user: any, tokens: Record<string, unknown> }) => {
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
  }

  const onError = (event: H3Event, error: H3Error<unknown>) => {
    console.error('Cognito OAuth error:', error)
    return sendRedirect(event, '/')
  }

  // scope cannot be set in runtimeConfig. Therefore, specify it here.
  const scopes: string[] = process.env.NUXT_OAUTH_COGNITO_SCOPE?.split(',') || []
  const config = defu(
    { scope: scopes },
    useRuntimeConfig(event).oauth?.cognito,
    { authorizationParams: {} }
  ) as OAuthCognitoConfig

  if (!config.clientId || !config.clientSecret || !config.userPoolId || !config.region) {
    return handleMissingConfiguration(event, 'cognito', ['clientId', 'clientSecret', 'userPoolId', 'region'], onError)
  }

  const congitoDiscoveryUrl = new URL(`https://cognito-idp.${config.region}.amazonaws.com/${config.userPoolId}/.well-known/openid-configuration`)
  const issuer = await discovery(congitoDiscoveryUrl, config.clientId, config.clientSecret)
  const {
    authorization_endpoint: authorizationURL,
    token_endpoint: tokenURL,
    userinfo_endpoint: userinfoURL,
    // TODO: implement logout
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    end_session_endpoint: logoutURL
  } = issuer.serverMetadata()
  const query = getQuery<{ code?: string }>(event)
  const redirectURL = process.env.NUXT_OAUTH_COGNITO_SIGNUP_REDIRECT_URL || config.redirectURL || getOAuthRedirectURL(event)
  const signupURL = authorizationURL?.replace('oauth2/authorize', 'signup')

  if (!query.code) {
    config.scope = config.scope || ['openid', 'profile']
    // Redirect to Cognito login page
    return sendRedirect(
      event,
      withQuery(signupURL as string, {
        client_id: config.clientId,
        redirect_uri: redirectURL,
        response_type: 'code',
        scope: config.scope.join(' '),
        ...config.authorizationParams
      })
    )
  }

  const tokens = await requestAccessToken(
    tokenURL as string,
    {
      body: {
        grant_type: 'authorization_code',
        client_id: config.clientId,
        client_secret: config.clientSecret,
        redirect_uri: redirectURL,
        code: query.code
      }
    }
  )

  if (tokens.error) {
    return handleAccessTokenErrorResponse(event, 'cognito', tokens, onError)
  }

  const tokenType = tokens.token_type
  const accessToken = tokens.access_token
  // TODO: improve typing of user profile
  const user: unknown = await $fetch(userinfoURL as string, {
    headers: {
      Authorization: `${tokenType} ${accessToken}`
    }
  })

  return onSuccess(event, {
    tokens,
    user
  })
})
