# Google Drive Monitor

Google Driveのフォルダをリアルタイムで監視するウェブアプリケーションです。

## 機能

- **Google OAuth 2.0認証**: Googleアカウントでログイン
- **フォルダ監視**: Google Driveのフォルダをリアルタイムで監視
- **プロジェクト管理**: 複数のフォルダをプロジェクト単位で管理
- **更新ログ**: ファイルの追加・変更・削除をログで確認
- **フォルダ検索**: フォルダ名で検索

## セットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Google Cloud Projectのセットアップ

1. [Google Cloud Console](https://console.cloud.google.com/)にアクセス
2. 新しいプロジェクトを作成
3. 「APIとサービス」→「ライブラリ」から「Google Drive API」を有効化
4. 「認証情報」→「認証情報を作成」→「OAuth 2.0 クライアント ID」を選択
5. アプリケーションの種類: ウェブアプリケーション
6. 承認済みのリダイレクト URI: `http://localhost:3000/api/auth/callback/google`
7. クライアントIDとクライアントシークレットをコピー

### 3. 環境変数の設定

`.env.local.example`を`.env.local`にコピーして、以下の値を設定します：

```bash
cp .env.local.example .env.local
```

`.env.local`を編集：

```
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Google OAuth 2.0
GOOGLE_CLIENT_ID=あなたのクライアントID
GOOGLE_CLIENT_SECRET=あなたのクライアントシークレット

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=ランダムな文字列（openssl rand -base64 32で生成）

# Webhook URL (Ngrok等で公開)
WEBHOOK_URL=https://your-ngrok-url.ngrok.io/api/drive/webhook
```

### 4. Push通知（Webhook）のセットアップ

Google Drive APIのPush通知を受信するには、アプリケーションを公開URLでアクセス可能にする必要があります。

#### Ngrokを使用する場合

1. Ngrokをインストール: https://ngrok.com/download
2. アプリケーションを起動:
   ```bash
   npm run dev
   ```
3. 別のターミナルでNgrokを起動:
   ```bash
   ngrok http 3000
   ```
4. Ngrokが割り当てたURLを`.env.local`の`WEBHOOK_URL`に設定
5. アプリケーションを再起動

## 使い方

### 開発サーバーの起動

```bash
npm run dev
```

ブラウザで http://localhost:3000 を開きます。

### プロジェクトの作成

1. Googleアカウントでログイン
2. 「Googleドライブ」タブを開く
3. 「URL指定欄」をクリック
4. Google DriveのフォルダURLを入力
5. プロジェクト名を入力（省略可）
6. 「追加」ボタンをクリック

### フォルダの監視

プロジェクトを作成すると、自動的にフォルダの監視が開始されます。

- **ドライブシート**: フォルダ階層を表示
- **更新ログ**: ファイルの変更履歴を表示
- **検索**: フォルダ名で検索

## 技術スタック

- **フレームワーク**: Next.js 14
- **認証**: NextAuth.js
- **API**: Google Drive API
- **スタイリング**: CSS Modules
- **データ保存**: LocalStorage

## ライセンス

MIT
