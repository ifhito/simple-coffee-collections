'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

type ActionResult = { success: true } | { error: string }

const DISPLAY_NAME_MAX = 100
const BIO_MAX = 500

export async function updateProfile(formData: FormData): Promise<ActionResult> {
  const supabase = await createClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { error: '認証が必要です' }
  }

  const displayName = (formData.get('display_name') as string | null)?.trim() ?? ''
  const bio = (formData.get('bio') as string | null)?.trim() ?? ''

  if (displayName.length > DISPLAY_NAME_MAX) {
    return { error: '表示名は100文字以内で入力してください' }
  }

  if (bio.length > BIO_MAX) {
    return { error: '自己紹介は500文字以内で入力してください' }
  }

  const { error } = await supabase
    .from('user_profiles')
    .upsert({
      id: user.id,
      display_name: displayName || null,
      bio: bio || null,
    })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/profile')
  return { success: true }
}
