# 型定義は `type` に統一する

- 日付: 2026-04-29
- Issue: #20

## 決定

TypeScript の型定義は **`type` のみ使用**し、`interface` は使わない。
`@typescript-eslint/consistent-type-definitions: ['error', 'type']` で強制する。

## 背景

`type` と `interface` が混在しており（123 vs 42、約 75% が `type`）、命名・拡張・union の表現で揺れていた。

## なぜ `type` か

- 既に大多数 (75%) が `type`。`type` 統一の方が改修コストが小さい。
- `type` は `interface` の機能を包含する:
  - 拡張: `type X = A & { foo: string }` (vs `interface X extends A { foo: string }`)
  - 共用体: `type R = { ok: true } | { ok: false }`（`interface` 不可）
  - mapped / conditional / utility types
- ESLint の auto-fix が効くため、ルール導入と一括変換を 1 PR で完結できる。

## 却下した案

- **`interface` 統一**: 共用体が書けず、123 件の置換も大規模。
- **両方許容 + 命名規約**: ESLint で表現できず、レビューに依存して揺れる。
- **オブジェクト形は `interface`、union は `type`**: ルールが文脈依存で機械的に enforce できない。

## 影響

- 既存の 42 件の `interface` を `type` に自動変換（`pnpm lint --fix`）。
- 新規コードは ESLint が違反を error 報告する。
- `declare module ... { interface ... }` のような型拡張は `.d.ts` で個別に許可（必要時に override コメント）。

## 適用範囲外

- サードパーティの型拡張（例: `@testing-library/jest-dom` が `jest.Matchers` を augment）は `interface` のままで問題ない。これは外部ライブラリの仕様であり、本リポジトリのコードには該当しない。
