import { ContactForm } from './_components/contact-form'

export const metadata = {
  title: 'お問い合わせ | Coffee Collections',
  description: 'Simple Coffee Collections へのお問い合わせ方法',
}

export default function ContactPage() {
  return (
    <div className="max-w-2xl mx-auto py-12 px-4 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900">お問い合わせ</h1>

      <p className="text-gray-600">
        本サービスに関するご質問・ご要望・不具合のご報告は、以下のフォームよりご連絡ください。
      </p>

      <div className="space-y-4">
        <h2 className="text-lg font-semibold text-gray-900">メールで直接お問い合わせ</h2>
        <ContactForm />
      </div>

      <p className="text-sm text-gray-500">
        ※ 本サービスは個人が運営しています。返答までお時間をいただく場合がございます。
      </p>
    </div>
  )
}
