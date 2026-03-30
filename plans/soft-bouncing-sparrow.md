# Plan: 新規登録確認メールのテンプレート作成

## Context

現在の確認メールは英語のシンプルなデフォルトテンプレート。
このアプリはコーヒージャーナル（日本語UI）なので、
ブランドに合った日本語メールテンプレートを作成する。

## 作成ファイル

- `supabase/templates/confirmation.html` — 確認メールHTML

## テンプレート内容

```html
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>メールアドレスの確認</title>
</head>
<body style="margin:0;padding:0;background:#faf7f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#faf7f4;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#3d2b1f;padding:32px 40px;text-align:center;">
              <p style="margin:0;font-size:24px;color:#f5e6d3;letter-spacing:0.05em;">☕ Coffee Collections</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px 40px 32px;">
              <h1 style="margin:0 0 16px;font-size:20px;color:#1a1a1a;font-weight:600;">
                メールアドレスの確認
              </h1>
              <p style="margin:0 0 12px;font-size:15px;color:#444;line-height:1.7;">
                Coffee Collections へのご登録ありがとうございます。
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#444;line-height:1.7;">
                以下のボタンをクリックして、メールアドレスの確認を完了してください。
              </p>
              <table cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#3d2b1f;border-radius:8px;">
                    <a href="{{ .ConfirmationURL }}"
                       style="display:inline-block;padding:14px 32px;font-size:15px;font-weight:600;color:#f5e6d3;text-decoration:none;letter-spacing:0.03em;">
                      メールアドレスを確認する
                    </a>
                  </td>
                </tr>
              </table>
              <p style="margin:24px 0 0;font-size:13px;color:#888;line-height:1.6;">
                ボタンが機能しない場合は、以下のURLをブラウザに貼り付けてください：<br>
                <a href="{{ .ConfirmationURL }}" style="color:#7b5c3e;word-break:break-all;">{{ .ConfirmationURL }}</a>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid #f0ebe5;">
              <p style="margin:0;font-size:12px;color:#aaa;line-height:1.6;">
                このメールに心当たりがない場合は、無視していただいて構いません。<br>
                このリンクの有効期限は1時間です。
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
```

## config.toml への追記

`supabase/config.toml` の `[auth.email.template.confirmation]` セクションを有効化：

```toml
[auth.email.template.confirmation]
subject = "【Coffee Collections】メールアドレスの確認"
content_path = "./supabase/templates/confirmation.html"
```

## デザイン方針

- カラー: ダークブラウン `#3d2b1f`、クリーム `#f5e6d3`、ベージュ背景 `#faf7f4`
- コーヒーらしい温かみのある配色
- シンプルで読みやすい構造（ヘッダー / 本文 / フッター）
- フォールバック用テキストURLも掲載

## Verification

1. `npx supabase start` でローカル起動
2. 新規ユーザー登録
3. Inbucket (`http://127.0.0.1:54324`) でメールを確認
4. デザイン・リンクの動作を検証
