---
name: clean-arch-boundary
description: Clean Architecture の層境界 (`domain ← application ← infrastructure / presentation`) が守られているか確認する。コミット前と新規モジュール作成時に使う。
---

# Clean Arch Boundary Check

## Layers (内側 → 外側)

```
lib/domain         (純粋なエンティティ / 値オブジェクト)
lib/application    (ユースケース / DTO)
lib/infrastructure (Supabase / 外部 SDK / Repository)
app/, lib/actions/ (Server Actions / 画面)
```

## Forbidden imports

- `lib/domain/**` から `lib/infrastructure/**` を import しない
- `lib/domain/**` から `next/**` / `react` / `@supabase/**` を import しない
- `lib/application/**` から `next/**` / `react` を import しない（DTO は framework-free）

## Procedure

1. 触ったファイルが `lib/domain` か `lib/application` 配下か確認。
2. import 文を見て、外側レイヤや framework に依存していないか確認。
3. 違反があれば `lib/infrastructure/` に責務を移すか、interface を `lib/domain` に置いて DI で注入する。

## Verify

```bash
pnpm test --testPathPattern=__tests__/architecture
```

このテストは正規表現で domain/application の禁止 import を検出する。

## Output

違反ゼロなら 1 行で「OK」。違反があればファイル + 該当 import 行 + 推奨アクション。
