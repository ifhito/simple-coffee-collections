'use client'

import { Input } from '@/components/ui/Input'
import { ShopAutocomplete } from './shop-autocomplete'

export type BeanInfoState = {
  beanName: string
  beanType: string
  shopName: string
  shopId: string | null
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
  const update = (field: keyof BeanInfoState, value: string | null) =>
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
      <ShopAutocomplete
        value={values.shopName}
        shopId={values.shopId}
        onChange={(name, shopId) =>
          onChange({ ...values, shopName: name, shopId })
        }
      />
      <div className="flex flex-col gap-2">
        <label htmlFor="roast-level" className="text-sm font-medium text-[var(--ink-2)]">
          焙煎度
        </label>
        <select
          id="roast-level"
          value={values.roastLevel}
          onChange={(e) => update('roastLevel', e.target.value)}
          className="rounded-sm border border-[var(--rule)] bg-[var(--paper)] px-3 py-2 text-sm text-[var(--ink)] focus:border-[var(--espresso)] focus:outline-none focus:ring-2 focus:ring-[var(--espresso)]/30"
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
