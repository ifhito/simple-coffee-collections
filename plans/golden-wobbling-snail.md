# Google AdSense 導入プラン

## Context

コーヒーアプリに Google AdSense 広告を追加して収益化を図る。
全ページ共通レイアウトに配信スクリプトを組み込み、AdSense の自動広告機能を使って最適な位置に自動表示する方針とする。

---

## 実装方針

AdSense には **自動広告** と **手動配置** の2種類がある。

- **自動広告（推奨）**: スクリプトを1箇所追加するだけで Google が最適位置を自動判断。実装が最小限。
- **手動配置**: `<ins>` タグで配置場所を明示的に指定。UI の制御が必要な場合に使う。

今回は **自動広告方式** で実装する（最小変更で全ページに広告が出る）。

---

## 前提条件（事前に必要な作業）

1. [Google AdSense](https://www.google.com/adsense/) でアカウント登録・承認を受ける
2. サイトを AdSense に登録して **パブリッシャーID** を取得する
   - 形式: `ca-pub-XXXXXXXXXXXXXXXX`
3. 取得した ID を環境変数に設定する
   - `.env.local` に `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX`

---

## 変更ファイル

### 1. `app/layout.tsx` — AdSense スクリプトを追加

`next/script` を使ってルートレイアウトの `<head>` に AdSense スクリプトを挿入する。

```tsx
import Script from 'next/script'

// <body> の直前に追加
<Script
  async
  src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
  crossOrigin="anonymous"
  strategy="afterInteractive"
/>
```

### 2. `.env.local` — 環境変数（ユーザーが手動設定）

```
NEXT_PUBLIC_ADSENSE_PUBLISHER_ID=ca-pub-XXXXXXXXXXXXXXXX
```

---

## 実装手順

1. `app/layout.tsx` に `next/script` の `import` を追加
2. `<body>` タグの直後に `<Script>` コンポーネントを追加
3. `.env.local` に `NEXT_PUBLIC_ADSENSE_PUBLISHER_ID` を追加（ユーザー作業）
4. AdSense 管理画面で自動広告をオンにする（ユーザー作業）
5. 本番デプロイ後、AdSense 側でサイト審査が完了すれば広告が自動表示される

---

## 自動広告 vs 手動配置の切り替え

将来的に手動配置が必要になった場合は `components/AdUnit.tsx` を作成して対応できる:

```tsx
'use client'
import { useEffect } from 'react'

export function AdUnit({ slot }: { slot: string }) {
  useEffect(() => {
    (window.adsbygoogle = window.adsbygoogle || []).push({})
  }, [])
  return (
    <ins
      className="adsbygoogle"
      style={{ display: 'block' }}
      data-ad-client={process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}
      data-ad-slot={slot}
      data-ad-format="auto"
      data-full-width-responsive="true"
    />
  )
}
```

---

## 注意事項

- AdSense の審査には数日〜数週間かかる場合がある
- ローカル開発環境では広告は表示されない（`localhost` は AdSense 対象外）
- 個人データの取り扱いのため、プライバシーポリシーページの設置が AdSense の要件になる場合がある

---

## 検証方法

1. 本番環境（`https://your-domain.com`）にデプロイ
2. ブラウザの開発者ツール → Network タブで `pagead2.googlesyndication.com` へのリクエストが発生していることを確認
3. AdSense 管理画面 → 「コード確認」でサイトが認識されていることを確認
4. 自動広告オン後、数時間〜数日で広告が表示され始める
