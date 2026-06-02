# Web Push Notification MVP (Next.js + TS + App Router)

Next.js (App Router) と TypeScript、Web Push API (Service Worker) を使用して構築された、最もシンプルなプッシュ通知の最小限の実証コード（MVP）です。
画面上の「送信」ボタンをクリックすることで、OSの通知バナーが飛び出し、通知センターにもしっかりと残る挙動を検証できます。

- **本番環境 URL**: [https://push-ten-wheat.vercel.app/](https://push-ten-wheat.vercel.app/)

---

## 🚀 機能特徴

- **TypeScript 完全対応**: App Router のクライアントコンポーネントによる型安全な実装。
- **Service Worker の統合**: `public/sw.js` によるバックグラウンドでの通知受信・クリック制御。
- **モバイル（iOS Safari / Android Chrome）対応**: PWA 基準を満たすマニフェストファイルを同梱し、スマホでのプッシュ通知検証に対応。

---

## 🛠️ ローカル開発環境のセットアップ

### 1. 依存関係のインストール

```bash
npm install
```

### 2. 環境変数の設定 (.env.local)
プロジェクトのルートに .env.local ファイルを作成し、以下の通り鍵と宛先情報を設定します。
(※ VAPID鍵は npx web-push generate-vapid-keys で生成したものです)

```Plaintext
# 公開鍵（ブラウザ・サーバー両用）
NEXT_PUBLIC_VAPID_PUBLIC_KEY=あなたのVAPID公開鍵

# 秘密鍵（サーバー専用・隠蔽必須）
VAPID_PRIVATE_KEY=あなたのVAPID秘密鍵

# 開発者の端末情報（スマホ/PCで取得したJSONを1行の文字列にしたもの）
PC_SUBSCRIPTION={"endpoint":"https://...","keys":{"p256dh":"...","auth":"..."}}
MOBILE_SUBSCRIPTION={"endpoint":"https://...","keys":{"p256dh":"...","auth":"..."}}
```

### 3. 開発サーバーの起動

```bash
npm run dev
```

起動後、PCのブラウザで [http://localhost:3000](http://localhost:3000) にアクセスします。

## 📱 スマホ（特に iOS Safari）での検証手順

iOS 16.4 以降の Safari では、セキュリティの制限により「ホーム画面に追加（PWA化）」しないと Web Push 機能（Service Worker / Notification API）が有効化されません。 本番環境の URL を使って以下の手順でテストを行ってください。

1. **URL を開く**
  iPhone の Safari を開き、本番 URL ([https://push-ten-wheat.vercel.app/](https://push-ten-wheat.vercel.app/)) にアクセスします。
2. **ホーム画面に追加**
  Safari 下部の「共有ボタン（四角から上矢印が出ているアイコン）」をタップし、メニューから「ホーム画面に追加」を選択します。
3. **アプリとして起動**
  ホーム画面に生成されたアイコンからアプリを開きます。（これにより通知機能が解禁されます）
4. **通知の許可とテスト送信**
  - 画面上の「① 通知を許可する」ボタンをタップし、iOS 標準の通知許可ダイアログで「許可」を選択します。
  - 「② 送信（通知を受け取る）」ボタンをタップすると、スマホの上部からプッシュ通知が届き、通知センターに格納されます。

⚠️ **注意**: PC やスマホの OS 側で「集中モード」や「通知拒否設定」が有効になっていると、バナーが表示されない場合があります。その場合は設定を確認してください。

---

## 📝 今後の拡張ポイント（本番運用に向けて）

このリポジトリはフロントエンド完結型の MVP です。ボタンを押した瞬間以外の「サーバーからいつでも届く本番仕様のプッシュ通知」へ拡張する場合は、以下の実装が必要になります。

- **VAPID 鍵の発行**: サーバーとブラウザ間の暗号化通信のための公開鍵・秘密鍵ペアの作成。
- **サブスクリプション情報の保存**: ユーザーが通知を許可した際にブラウザから発行されるエンドポイント（URL）を、バックエンドのデータベース（PostgreSQL / MongoDB など）に保存する。
- **Web-Push ライブラリの導入**: Node.js の `web-push` ライブラリなどを使用し、サーバー側のトリガー（例: ユーザーへのメッセージ新着時など）でバックグラウンドからプッシュ通知を配信する。

