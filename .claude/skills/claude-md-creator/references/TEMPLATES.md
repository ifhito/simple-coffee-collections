# CLAUDE.mdテンプレート

60行以下を目標。WHY/WHAT/HOWの本質のみ記載。
詳細は `@path/to/file` 構文でインポート。

---

## テンプレート

```markdown
# CLAUDE.md

## WHY: このプロジェクトについて

[1-2文でプロジェクトの存在意義を説明]

**対象者**: [誰のためか]
**言語**: [使用言語]

## WHAT: 含まれるもの

| スキル名 | 概要 |
|---------|------|
| skill-1 | 一行説明 |
| skill-2 | 一行説明 |

> 各スキルの詳細は `path/to/[skill-name]/SKILL.md` を参照

## HOW: 使い方

- 原則 @docs/PRINCIPLES.md
- リファレンス @docs/REFERENCE.md
```

---

## インポート構文

`@path/to/file` で外部ファイルをインクルード。
コードブロック・コードスパン内では評価されない。
