# Demo with Nuxt UI Pro SaaS template and AWS Cognito Authentication

This repository demonstrates a working sign-in/sign-up functionality added to the [Nuxt UI Pro - SaaS template](https://github.com/nuxt-ui-pro/saas) using AWS Cognito User Pools and its managed login UI. Authentication is handled by [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils).

## Important Note

Nuxt UI Pro is a paid product. You need a valid [Nuxt UI Pro license](https://ui.nuxt.com/pro/pricing) to run this demo.

## How to Run the Demo

1.  **Deploy the AWS CloudFormation template** to your AWS account.

    Example:

    ```sh
    aws cloudformation deploy \
      --template-file infra/cognito/cognito.yml \
      --stack-name saas-demo-cognito-dev \
      --parameter-overrides \
          ProjectName=saas-demo \
          Environment=dev \
          CallbackURLs='http://YOUR_DOMAIN/auth/cognito,http://YOUR_DOMAIN/auth/cognito_signup' \
          LogoutURLs='http://YOUR_DOMAIN/'
    ```

    > [!NOTE]
    > Replace `YOUR_DOMAIN` with the domain where you deploy the application in production, or use `localhost:3000` during development.

2.  **Create a `.env` file** in the root directory with the following content, replacing the placeholder values with your actual Cognito details obtained from the CloudFormation stack outputs and your Nuxt UI Pro license:

    ```dotenv
    # Production license for @nuxt/ui-pro, get one at https://ui.nuxt.com/pro/purchase
    NUXT_UI_PRO_LICENSE=your_license_code

    # AWS Cognito App Client ID
    NUXT_OAUTH_COGNITO_CLIENT_ID=your_client_id
    # AWS Cognito App Client Secret
    NUXT_OAUTH_COGNITO_CLIENT_SECRET=your_client_secret
    # AWS Cognito User Pool ID
    NUXT_OAUTH_COGNITO_USER_POOL_ID=your_user_pool_id
    # AWS Cognito Region
    NUXT_OAUTH_COGNITO_REGION=your_cognito_region
    # AWS Cognito Scope (comma-separated)
    NUXT_OAUTH_COGNITO_SCOPE=openid,email,profile,saas-demo-dev/basic
    # Redirect URL for signin
    NUXT_OAUTH_COGNITO_REDIRECT_URL=http://YOUR_DOMAIN/auth/cognito
    # Redirect URL for signup
    NUXT_OAUTH_COGNITO_SIGNUP_REDIRECT_URL=http://YOUR_DOMAIN/auth/cognito_signup

    # nuxt-auth-utils password for encoding user sessions
    NUXT_SESSION_PASSWORD=password-with-at-least-32-characters
    ```
    > [!NOTE]
    > Ensure `NUXT_SESSION_PASSWORD` is a strong, random string of at least 32 characters.

3.  **Install dependencies and run the development server:**

    ```sh
    pnpm install
    pnpm dev
    ```

4.  **Access the application** at http://localhost:3000/.

## How It Works

-   The sign-in and sign-up features utilize AWS Cognito User Pools and the managed login UI.
-   Authentication is handled by [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils).
-   When you click **[Sign in]**, the authentication flow is as follows:

    ```mermaid
    sequenceDiagram
        participant Browser
        participant Server
        participant Cognito

        Browser->>Server: GET /auth/cognito
        Server->>Browser: 302 Redirect (to Cognito Login)
        Browser->>Cognito: Navigate to Managed Login UI
        Browser->>Cognito: User signs in
        Cognito->>Browser: 302 Redirect (with auth code)
        Browser->>Server: GET /auth/cognito?code=...
        Server->>Cognito: POST /oauth2/token (Get Token)
        Cognito->>Server: Token Response
        Server->>Server: Set user session
        Server->>Browser: Sign in successful, redirect to home
    ```

-   The **[Sign up]** button uses the AWS Cognito [signup endpoint](https://docs.aws.amazon.com/cognito/latest/developerguide/managed-login-endpoints.html). The basic flow is similar to the sign-in process, directing the user to the Cognito hosted UI for registration.

## Note on original `login.vue` and `signup.vue` pages

The original `login.vue` and `signup.vue` pages from the Nuxt UI Pro SaaS template are **not used** in this demo, as authentication is handled entirely by the AWS Cognito managed login UI.

## References

-   [Nuxt UI Pro - SaaS template](https://github.com/nuxt-ui-pro/saas)
-   [nuxt-auth-utils](https://github.com/atinux/nuxt-auth-utils)
-   [AWS Cognito Developer Guide](https://docs.aws.amazon.com/cognito/latest/developerguide/what-is-amazon-cognito.html)
-   [AWS User pool endpoints and managed login reference](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-userpools-server-contract-reference.html)
