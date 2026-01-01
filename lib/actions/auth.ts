'use server'

import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export async function signUp(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validation
  if (!email) {
    return { error: 'メールアドレスを入力してください' }
  }

  if (!EMAIL_REGEX.test(email)) {
    return { error: '有効なメールアドレスを入力してください' }
  }

  if (!password) {
    return { error: 'パスワードを入力してください' }
  }

  if (password.length < 6) {
    return { error: 'パスワードは6文字以上である必要があります' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signUp({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/')
}

export async function signIn(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  // Validation
  if (!email) {
    return { error: 'メールアドレスを入力してください' }
  }

  if (!password) {
    return { error: 'パスワードを入力してください' }
  }

  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  redirect('/')
}

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}
