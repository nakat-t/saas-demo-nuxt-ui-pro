# Cognito Resource Deployment Procedure

This directory contains a CloudFormation template (cognito.yml) for deploying AWS Cognito User Pool, App Client, Domain, and the branding designer UI.

## Deployment Steps

Example:
```sh
aws cloudformation deploy \
  --template-file cognito.yml \
  --stack-name saas-demo-cognito-dev \
  --parameter-overrides \
      ProjectName=saas-demo \
      Environment=dev \
      CallbackURLs='http://YOUR_DOMAIN/auth/cognito,http://YOUR_DOMAIN/auth/cognito_signup' \
      LogoutURLs='http://YOUR_DOMAIN/'
```

- Multiple CallbackURLs and LogoutURLs can be specified, separated by commas.
- `YOUR_DOMAIN` specifies the domain where you deploy production, or `localhost:3000` during development.

## Parameter Examples

| Parameter Name | Description                                                                 |
|:---------------|:----------------------------------------------------------------------------|
| ProjectName    | Project name                                                                |
| Environment    | Environment name (e.g., dev, stg, prd)                                      |
| CallbackURLs   | Redirect URI after OAuth authentication (multiple URIs can be specified, comma-separated) |
| LogoutURLs     | Redirect URI after logout (multiple URIs can be specified, comma-separated) |
