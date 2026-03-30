'use server'

import { Resend } from 'resend'

type ActionResult = { success: true } | { error: string }

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function sendContactEmail(
  _prev: ActionResult | null,
  formData: FormData
): Promise<ActionResult> {
  const name = formData.get('name') as string
  const email = formData.get('email') as string
  const message = formData.get('message') as string

  if (!email) {
    return { error: 'メールアドレスを入力してください。' }
  }

  if (!EMAIL_REGEX.test(email)) {
    return { error: '有効なメールアドレスを入力してください。' }
  }

  if (!message || message.trim().length === 0) {
    return { error: 'お問い合わせ内容を入力してください。' }
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return { error: 'メール送信の設定が完了していません。' }
  }

  const resend = new Resend(apiKey)

  const { error } = await resend.emails.send({
    from: 'お問い合わせ <noreply@mail.coffee-collections.uk>',
    to: ['hito01010101@gmail.com'],
    replyTo: email,
    subject: `[Simple Coffee Collections] お問い合わせ: ${name || '名前なし'}`,
    text: `お名前: ${name || '未入力'}\nメールアドレス: ${email}\n\n${message}`,
  })

  if (error) {
    console.error('Failed to send email:', error)
    return { error: 'メールの送信に失敗しました。しばらくしてから再度お試しください。' }
  }

  return { success: true }
}
