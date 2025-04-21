declare module '#auth-utils' {
  interface User {
    preferred_username?: string
    email?: string
  }

  interface UserSession {
    user: User
    secure: SecureSessionData
  }

  interface SecureSessionData {
    access_token?: string
  }
}

export {}
