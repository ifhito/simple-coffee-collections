import { SignupForm } from './SignupForm'

export const metadata = {
  title: 'サインアップ | Coffee Collections',
  description: 'Coffee Collectionsのアカウントを作成',
}

export default function SignupPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          アカウントを作成
        </h2>
      </div>
      <SignupForm />
    </div>
  )
}
