import { LoginForm } from './LoginForm'

export const metadata = {
  title: 'ログイン | Coffee Collections',
  description: 'Coffee Collectionsにログイン',
}

export default function LoginPage() {
  return (
    <div>
      <div className="mb-6">
        <h2 className="text-center text-2xl font-bold text-gray-900">
          ログイン
        </h2>
      </div>
      <LoginForm />
    </div>
  )
}
