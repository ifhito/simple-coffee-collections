import { SignupForm } from './SignupForm'

export const metadata = {
  title: 'サインアップ | Coffee Collections',
  description: 'Coffee Collectionsのアカウントを作成',
}

export default function SignupPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="font-serif-display text-center text-2xl text-[var(--ink)]">
          アカウントを作成
        </h2>
      </div>
      <SignupForm />
    </div>
  )
}
