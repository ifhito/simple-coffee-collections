'use client'

import { Input } from '@/components/ui/Input'

export type BeanInfoState = {
  beanName: string
  beanType: string
  shopName: string
  roastLevel: string
}

type BeanInfoFieldsProps = {
  values: BeanInfoState
  onChange: (values: BeanInfoState) => void
  errors?: { bean_name?: string }
}

const ROAST_LEVELS = [
  { value: '', label: '選択してください' },
  { value: 'light', label: 'ライト（浅煎り）' },
  { value: 'cinnamon', label: 'シナモン（浅中煎り）' },
  { value: 'medium', label: 'ミディアム（中煎り）' },
  { value: 'high', label: 'ハイ（中深煎り）' },
  { value: 'city', label: 'シティ（やや深煎り）' },
  { value: 'full_city', label: 'フルシティ（深煎り）' },
  { value: 'french', label: 'フレンチ（極深煎り）' },
]

export function BeanInfoFields({ values, onChange, errors }: BeanInfoFieldsProps) {
  const update = (field: keyof BeanInfoState, value: string) =>
    onChange({ ...values, [field]: value })

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Input
        label="豆の名前"
        value={values.beanName}
        onChange={(e) => update('beanName', e.target.value)}
        placeholder="例: エチオピア イルガチェフェ G1"
        required
        error={errors?.bean_name}
      />
      <Input
        label="豆の産地"
        value={values.beanType}
        onChange={(e) => update('beanType', e.target.value)}
      />
      <Input
        label="店名"
        value={values.shopName}
        onChange={(e) => update('shopName', e.target.value)}
      />
      <div className="flex flex-col gap-2">
        <label htmlFor="roast-level" className="text-sm font-medium text-neutral-800">
          焙煎度
        </label>
        <select
          id="roast-level"
          value={values.roastLevel}
          onChange={(e) => update('roastLevel', e.target.value)}
          className="rounded-md border border-neutral-300 bg-white px-3 py-2 text-sm text-neutral-800 focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-200"
          aria-label="焙煎度"
        >
          {ROAST_LEVELS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  )
}
