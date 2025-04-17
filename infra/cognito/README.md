# Cognitoリソースデプロイ手順

このディレクトリには、AWS Cognito User Pool, App Client, Domain, ブランディングデザイナーUIをCloudFormationでデプロイするためのテンプレート（cognito.yml）が含まれています。

---

## デプロイ手順

1. AWS CLIでCloudFormationスタックを作成または更新します。

例:
```sh
aws cloudformation deploy \
  --template-file cognito.yml \
  --stack-name saas-demo-cognito-dev \
  --parameter-overrides \
      ProjectName=saas-demo \
      Environment=dev \
      CallbackURLs='http://localhost:3000/auth/cognito' \
      LogoutURLs='http://localhost:3000/'
```

- CallbackURLs, LogoutURLsはカンマ区切りで複数指定可能です。

2. デプロイ後、AWSマネジメントコンソールで以下を確認してください。
   - User Pool, App Client, Domain, UIカスタマイズが作成されていること
   - マネージドログインUIが有効化されていること
   - リダイレクトURIが正しく設定されていること

---

## パラメータ例

| パラメータ名   | 例                                    | 説明                       |
|:--------------|:--------------------------------------|:---------------------------|
| ProjectName   | saas-demo                             | プロジェクト名             |
| Environment   | dev                                   | 環境名（dev, stg, prd等）  |
| CallbackURLs  | http://localhost:3000/auth/cognito    | OAuth認証後のリダイレクトURI |
| LogoutURLs    | http://localhost:3000/                | ログアウト後のリダイレクトURI |

---

## 注意事項

- signup（自己登録）は現状無効です（AdminCreateUserOnly: true）。
- テストユーザー登録・ログインは後続タスクで実施してください。
- 詳細なカスタマイズや環境ごとのパラメータは必要に応じて調整してください。
