# Google Places API 連携ガイド

## 概要

このドキュメントでは、Google Places APIを使用して店舗情報を自動取得する方法を説明します。

## 実装パターン

### パターン1: オートコンプリート（推奨）

ユーザーが店舗名を入力する際に、Google Places Autocompleteで候補を表示。

```typescript
// components/features/ShopAutocomplete.tsx
'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';

export function ShopAutocomplete({ onSelect }: { onSelect: (shop: Shop) => void }) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);

  const handleInput = async (value: string) => {
    setQuery(value);

    // Places Autocomplete APIを呼び出し
    const response = await fetch(`/api/places/autocomplete?input=${value}`);
    const data = await response.json();
    setSuggestions(data.predictions);
  };

  const handleSelect = async (placeId: string) => {
    // Place Details APIで詳細情報を取得
    const response = await fetch(`/api/places/details?placeId=${placeId}`);
    const shop = await response.json();
    onSelect(shop);
  };

  return (
    <div className="relative">
      <Input
        value={query}
        onChange={(e) => handleInput(e.target.value)}
        placeholder="店舗名を入力..."
      />
      {suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white border rounded-md mt-1 w-full">
          {suggestions.map((s) => (
            <li
              key={s.place_id}
              onClick={() => handleSelect(s.place_id)}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              {s.description}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

### パターン2: 手動検索

すでに入力された店舗名から後で検索。

```typescript
// app/api/places/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const shopName = request.nextUrl.searchParams.get('name');

  // Google Places Text Search API
  const response = await fetch(
    `https://places.googleapis.com/v1/places:searchText`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': process.env.GOOGLE_PLACES_API_KEY!,
        'X-Goog-FieldMask': 'places.displayName,places.formattedAddress,places.id',
      },
      body: JSON.stringify({
        textQuery: shopName,
        languageCode: 'ja',
      }),
    }
  );

  const data = await response.json();
  return NextResponse.json(data);
}
```

## データベーススキーマの変更案

現在の`shop_name`（TEXT）から、より詳細な情報を保存できるように拡張：

### オプション1: 正規化（推奨）

```sql
-- 店舗マスターテーブル
CREATE TABLE shops (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  google_place_id TEXT UNIQUE,
  name TEXT NOT NULL,
  address TEXT,
  lat DECIMAL(10, 8),
  lng DECIMAL(11, 8),
  phone_number TEXT,
  website TEXT,
  google_rating DECIMAL(2, 1),
  user_id UUID REFERENCES auth.users(id),  -- カスタム店舗用
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- coffee_recordsを変更
ALTER TABLE coffee_records
  DROP COLUMN shop_name,
  ADD COLUMN shop_id UUID REFERENCES shops(id);
```

### オプション2: JSON埋め込み（シンプル）

```sql
-- coffee_recordsにJSONB列を追加
ALTER TABLE coffee_records
  ADD COLUMN shop_data JSONB;

-- shop_dataの例
{
  "name": "〇〇珈琲店",
  "placeId": "ChIJ...",
  "address": "東京都...",
  "location": {"lat": 35.6585, "lng": 139.7454}
}
```

## セキュリティ

### API Keyの保護

```env
# .env.local
GOOGLE_PLACES_API_KEY=your_api_key_here
```

```typescript
// Next.js API Routeで呼び出し（クライアント側に露出しない）
// app/api/places/autocomplete/route.ts
export async function GET(request: NextRequest) {
  const input = request.nextUrl.searchParams.get('input');

  // サーバー側でAPIキーを使用
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${input}&key=${process.env.GOOGLE_PLACES_API_KEY}&language=ja&types=cafe`
  );

  return NextResponse.json(await response.json());
}
```

### API制限の推奨設定

Google Cloud Consoleで以下を設定：
- **Application restrictions**: HTTPリファラー制限
- **API restrictions**: Places API, Maps JavaScript APIのみ
- **Quota**: 1日あたりのリクエスト上限を設定

## コスト最適化

### 1. Autocomplete Session Token

セッショントークンを使うと、複数のオートコンプリートリクエストを1つとしてカウント：

```typescript
const sessionToken = new google.maps.places.AutocompleteSessionToken();

// 複数回のタイプ = 1セッション = $0.00283
autocompleteService.getPlacePredictions({
  input: userInput,
  sessionToken,
});
```

### 2. Field Maskの活用

必要なフィールドのみリクエスト：

```typescript
// ❌ すべて取得（高コスト）
fieldMask: '*'

// ✅ 必要なもののみ（低コスト）
fieldMask: 'places.displayName,places.formattedAddress,places.id'
```

### 3. キャッシュ戦略

```typescript
// Redis or Supabaseでキャッシュ
const cacheKey = `place:${placeId}`;
const cached = await redis.get(cacheKey);

if (cached) {
  return JSON.parse(cached);
}

const data = await fetchFromGoogle(placeId);
await redis.set(cacheKey, JSON.stringify(data), 'EX', 86400); // 24時間
return data;
```

## 参考リンク

- [Places API (New) Documentation](https://developers.google.com/maps/documentation/places/web-service/op-overview)
- [Pricing Calculator](https://mapsplatform.google.com/pricing/)
- [Node.js Client Library](https://github.com/googlemaps/google-maps-services-js)
