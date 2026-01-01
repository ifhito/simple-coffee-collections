import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'ホーム | Coffee Collections',
  description: 'あなたのコーヒーコレクション',
}

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <div>
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          ようこそ、Coffee Collectionsへ
        </h2>
        <p className="text-gray-600">
          あなたのコーヒー体験を記録しましょう
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-xl font-semibold text-gray-900 mb-4">はじめに</h3>
        <p className="text-gray-600 mb-4">
          Coffee Collectionsへようこそ！このアプリケーションでは、カフェ訪問やコーヒーの体験を記録できます。
        </p>
        <div className="space-y-2 text-sm text-gray-600">
          <p>• コーヒー記録の作成と管理</p>
          <p>• カフェ情報の登録</p>
          <p>• テイスティングノートとタグ付け</p>
          <p>• 検索とフィルタリング</p>
          <p>• 統計とインサイト</p>
        </div>
      </div>

      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          ログイン中: <strong>{user?.email}</strong>
        </p>
      </div>
    </div>
  )
}
