# Firebase App Hostingデプロイ手順

## 前提条件
- Firebase CLIがインストール済み ✅
- Firebaseプロジェクトが作成済み

## 手順

### 1. Firebaseにログイン
```bash
firebase login
```

### 2. Firebaseプロジェクトを初期化
```bash
firebase init apphosting
```

### 3. 環境変数の設定
Firebase Consoleで以下の環境変数を設定：
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `NEXTAUTH_URL` (デプロイ後のURL)
- `NEXTAUTH_SECRET`

### 4. デプロイ
```bash
firebase deploy --only apphosting
```

### 5. Google Cloud Console設定
OAuth 2.0クライアントのリダイレクトURIを追加：
`https://your-project.web.app/api/auth/callback/google`

## 注意事項
- 初回デプロイには数分かかる場合があります
- App HostingはGitHubリポジトリとの連携が推奨されます
