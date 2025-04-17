declare module '#auth-utils' {
  interface User {
    // Add your own fields
    preferred_username?: string
    email?: string
    email_verified?: boolean
  }

  interface UserSession {
    // Add your own fields
    user: User
    loggedInAt: string
  }

//  interface SecureSessionData {
//    // Add your own fields
//  }
}

export {}
