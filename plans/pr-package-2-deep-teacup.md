# Plan: Editorial Tasting Journal Redesign — Full Design Consistency Overhaul

## Context

Phase 1 (pr-package 2 redesign) is **complete**: OKLCH design tokens, 3 fonts, 4 new shared components, NavBar, LP, card, feed-card, slider, and tests are all done on branch `redesign/editorial-tasting-journal`.

Phase 2 (comprehensive overhaul) is **in progress**: many pages still use old Tailwind color utilities (`amber-*`, `neutral-*`, `gray-*`) instead of CSS variable tokens. This plan completes the overhaul so the entire app uses the editorial design system consistently.

**Design token mapping:**
- `text-amber-600` / `text-amber-600 uppercase` → `font-mono-caps text-[var(--espresso)]`
- `text-neutral-900` / `font-bold text-2xl` h1 → `font-serif-display text-2xl text-[var(--ink)]`
- `text-neutral-600`, `text-neutral-700`, `text-gray-600`, `text-gray-700` → `text-[var(--ink-2)]` or `text-[var(--ink-3)]`
- `text-neutral-500`, `text-neutral-400` → `text-[var(--ink-3)]`
- `rounded-lg border border-neutral-200 bg-white shadow-sm` → `rounded-sm border border-[var(--rule)] bg-[var(--paper)]`
- `rounded-md border border-neutral-100 bg-neutral-50` → `rounded-sm border border-[var(--rule)] bg-[var(--background-2)]`
- `rounded-md bg-amber-600 px-4 py-2 text-white hover:bg-amber-700` → `rounded-full bg-[var(--ink)] px-4 py-2 text-[var(--background)] hover:bg-[var(--espresso)]`
- `border-neutral-300 focus:border-amber-500 focus:ring-amber-200` → `border-[var(--rule)] focus:border-[var(--espresso)] focus:ring-[var(--espresso)]/30`
- `rounded-md bg-neutral-900 hover:bg-neutral-800` (edit/save buttons) → `rounded-full bg-[var(--ink)] hover:bg-[var(--espresso)]`

**Already completed in Phase 2:**
- `components/ui/Button.tsx` — rounded-full, CSS vars
- `components/ui/Input.tsx` — CSS vars, rounded-sm
- `components/LogoutButton.tsx` — CSS vars
- `app/(app)/layout.tsx` — bg-[var(--background)], border-[var(--rule)]
- `app/(auth)/layout.tsx`, `login/page.tsx`, `signup/page.tsx` — font-serif-display, CSS vars
- `app/(auth)/login/LoginForm.tsx`, `signup/SignupForm.tsx` — CSS vars
- `app/(app)/coffee/_components/shared/public-toggle.tsx` — CSS vars
- `app/(app)/coffee/_components/shared/empty-state.tsx` — CSS vars, rounded-sm
- `app/(app)/coffee/_components/shared/shop-autocomplete.tsx` — CSS vars, rounded-sm
- `app/(app)/coffee/_components/list/search-and-sort.tsx` — CSS vars, font-mono-caps labels
- `app/(app)/coffee/_components/shared/bean-info-fields.tsx` — CSS vars, rounded-sm
- `app/(app)/coffee/_components/evaluate-form.tsx` — CSS vars, rounded-sm
- `app/(app)/coffee/_components/evaluation-form.tsx` — CSS vars, rounded-sm
- `app/(app)/coffee/my/page.tsx`, `community/page.tsx`, `new/page.tsx` — font-serif-display headers
- `app/(app)/coffee/new/_components/new-evaluation-container.tsx` — CSS vars

---

## Remaining Files to Update

### Detail / Edit / Evaluate Pages

**`app/(app)/coffee/[id]/edit/page.tsx`**
- `text-xs font-semibold uppercase tracking-wide text-amber-600` → `font-mono-caps text-[11px] text-[var(--espresso)]`
- `text-2xl font-bold text-neutral-900` → `font-serif-display text-2xl text-[var(--ink)]`
- `text-sm text-neutral-600` → `text-sm text-[var(--ink-3)]`

**`app/(app)/coffee/[id]/evaluate/page.tsx`**
- h1: `text-2xl font-bold text-neutral-900` → `font-serif-display text-2xl text-[var(--ink)]`
- Info card: `rounded-md border border-neutral-100 bg-neutral-50 p-4` → `rounded-sm border border-[var(--rule)] bg-[var(--background-2)] p-4`
- Bean name: `text-lg font-semibold text-neutral-900` → `text-lg font-semibold text-[var(--ink)]`
- Shop/roast: `text-sm text-neutral-600`, `text-xs text-neutral-500` → `text-[var(--ink-3)]`

**`app/(app)/coffee/[id]/_components/evaluation/view.tsx`** _(key file — RatingStars still used)_
- Article: `rounded-lg border border-neutral-200 bg-white shadow-sm` → `rounded-sm border border-[var(--rule)] bg-[var(--paper)]`
- Header texts: `text-neutral-900/600/500` → `text-[var(--ink)]` / `text-[var(--ink-3)]`
- Rating cards: `rounded-md border border-neutral-100 p-3` → `rounded-sm border border-[var(--rule)] p-3`
- Replace `<RatingStars>` with numeric display: `font-mono-num text-2xl text-[var(--rating-*)]`
- No-rating CTA: `rounded-md bg-amber-600 px-4 py-2 text-white hover:bg-amber-700` → `rounded-full bg-[var(--ink)] px-4 py-2 text-[var(--background)] hover:bg-[var(--espresso)]`
- Notes section: `rounded-md border border-neutral-100 bg-neutral-50` → `rounded-sm border border-[var(--rule)] bg-[var(--background-2)]`
- Edit button: `rounded-md bg-neutral-900` → `rounded-full bg-[var(--ink)] text-[var(--background)] hover:bg-[var(--espresso)]`
- Delete button: keep red but `rounded-md` → `rounded-full`

### Profile

**`app/(app)/profile/page.tsx`**
- h1: `text-2xl font-bold text-neutral-900` → `font-serif-display text-2xl text-[var(--ink)]`
- desc: `text-sm text-neutral-600` → `text-sm text-[var(--ink-3)]`

**`app/(app)/profile/profile-form.tsx`**
- Form: `rounded-lg border border-neutral-200 bg-white shadow-sm` → `rounded-sm border border-[var(--rule)] bg-[var(--paper)]`
- Counter: `text-xs text-neutral-500` → `text-xs text-[var(--ink-3)]`
- Label: `text-sm font-medium text-gray-700` → `text-sm font-medium text-[var(--ink-2)]`
- Textarea: `border-gray-300 focus:border-amber-500 focus:ring-amber-200` → `border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)] focus:border-[var(--espresso)] focus:ring-[var(--espresso)]/30`
- Success text: `text-green-600` → `text-[var(--espresso)]`
- Save button: `rounded-md bg-neutral-900 px-4 py-2 text-white hover:bg-neutral-800` → `rounded-full bg-[var(--ink)] px-5 py-2.5 text-[var(--background)] hover:bg-[var(--espresso)]`

### Shops

**`app/(app)/shops/page.tsx`**
- h1: `text-2xl font-bold text-neutral-900` → `font-serif-display text-2xl text-[var(--ink)]`
- desc: `text-sm text-neutral-600` → `text-sm text-[var(--ink-3)]`
- Loading fallback: `text-sm text-neutral-500` → `text-sm text-[var(--ink-3)]`

**`app/(app)/shops/_components/shop-card.tsx`**
- `rounded-lg border border-neutral-200 bg-white shadow-sm hover:shadow-md` → `rounded-sm border border-[var(--rule)] bg-[var(--paper)] transition hover:border-[var(--ink)]`
- `text-base font-medium text-neutral-900` → `font-medium text-[var(--ink)]`

**`app/(app)/shops/_components/shop-list.tsx`**
- Empty/error text: `text-sm text-neutral-500` → `text-sm text-[var(--ink-3)]`

**`app/(app)/shops/_components/shop-search.tsx`**
- Wrapper: `rounded-lg border border-neutral-200 bg-white shadow-sm` → `rounded-sm border border-[var(--rule)] bg-[var(--paper)]`
- Label: `text-sm text-neutral-700` → `text-sm text-[var(--ink-2)]`
- Input: `rounded-md border-neutral-300 focus:border-amber-500 focus:ring-amber-200` → `rounded-sm border-[var(--rule)] bg-[var(--paper)] focus:border-[var(--espresso)] focus:ring-[var(--espresso)]/30`

### List / My Page

**`app/(app)/coffee/_components/list/view.tsx`**
- Empty: `rounded-lg border-dashed border-neutral-300 bg-neutral-50 text-neutral-700` → `rounded-sm border-dashed border-[var(--rule)] bg-[var(--background-2)] text-[var(--ink-2)]`
- CTA: `rounded-md bg-amber-600 hover:bg-amber-700 text-white` → `rounded-full bg-[var(--ink)] text-[var(--background)] hover:bg-[var(--espresso)]`

**`app/(app)/coffee/my/_components/view.tsx`**
- Share card: `rounded-lg border border-neutral-200 bg-white shadow-sm` → `rounded-sm border border-[var(--rule)] bg-[var(--paper)]`
- Share card texts: `text-neutral-900/600` → `text-[var(--ink)]` / `text-[var(--ink-3)]`
- Empty CTA: `rounded-md bg-amber-600 hover:bg-amber-700 text-white` → `rounded-full bg-[var(--ink)] text-[var(--background)] hover:bg-[var(--espresso)]`

**`app/(app)/coffee/my/_components/copy-profile-link-button.tsx`**
- Button: `rounded-md bg-amber-600 hover:bg-amber-700 focus:ring-amber-300 text-white` → `rounded-full bg-[var(--ink)] text-[var(--background)] hover:bg-[var(--espresso)] focus:ring-[var(--espresso)]/30`
- Fallback input: `border-neutral-300 text-neutral-800` → `border-[var(--rule)] text-[var(--ink)]`

### Users (Public Profile)

**`app/(app)/users/[userId]/page.tsx`**
- h2: `text-xl font-bold text-neutral-900` → `font-serif-display text-xl text-[var(--ink)]`

**`app/(app)/users/[userId]/_components/profile-view.tsx`**
- h1: `text-2xl font-bold text-neutral-900` → `font-serif-display text-2xl text-[var(--ink)]`
- bio: `text-sm text-neutral-600` → `text-sm text-[var(--ink-3)]`
- Edit link: `rounded-md bg-amber-600 hover:bg-amber-700 text-white` → `rounded-full bg-[var(--ink)] text-[var(--background)] hover:bg-[var(--espresso)]`

### AI Pages

**`app/(app)/ai/page.tsx`**
- `text-xs font-semibold uppercase tracking-wide text-amber-600` → `font-mono-caps text-[11px] text-[var(--espresso)]`
- h1: `text-2xl font-bold text-neutral-900` → `font-serif-display text-2xl text-[var(--ink)]`
- desc: `text-sm text-neutral-600` → `text-sm text-[var(--ink-3)]`

**`app/(app)/ai/_components/ai-settings-section.tsx`**
- Section: `rounded-lg border border-neutral-200 bg-white shadow-sm` → `rounded-sm border border-[var(--rule)] bg-[var(--paper)]`
- h2: `text-neutral-900` → `text-[var(--ink)]`
- Info card: `bg-neutral-50 text-neutral-700` → `bg-[var(--background-2)] text-[var(--ink-2)]`
- Edit/Cancel buttons: `border-neutral-300 bg-white text-neutral-700 hover:bg-neutral-50` → `rounded-sm border-[var(--rule)] bg-[var(--paper)] text-[var(--ink-2)] hover:border-[var(--ink)]`
- Save button: `rounded-md bg-amber-600 hover:bg-amber-700 text-white` → `rounded-full bg-[var(--ink)] text-[var(--background)] hover:bg-[var(--espresso)]`

**`app/(app)/ai/_components/llm-settings-panel.tsx`**
- Section heading: `text-neutral-800` → `text-[var(--ink)]`
- Provider button (selected): `border-amber-500 bg-amber-50 ring-amber-400` → `border-[var(--espresso)] bg-[var(--background-2)] ring-[var(--espresso)]/50`
- Provider button (idle): `border-neutral-200 hover:border-amber-300 hover:bg-amber-50/50` → `border-[var(--rule)] hover:border-[var(--espresso)] hover:bg-[var(--background-2)]`
- Provider texts: `text-neutral-800/500` → `text-[var(--ink)]` / `text-[var(--ink-3)]`
- Input labels: `text-neutral-800` → `text-[var(--ink)]`
- Inputs: `border-neutral-300 bg-white text-neutral-900 focus:border-amber-500 focus:ring-amber-200` → `rounded-sm border-[var(--rule)] bg-[var(--paper)] text-[var(--ink)] focus:border-[var(--espresso)] focus:ring-[var(--espresso)]/30`
- Help text: `text-neutral-500` → `text-[var(--ink-3)]`

### Loading / Error States

**`app/(app)/coffee/loading.tsx`**
- Skeleton border: `rounded-lg border border-neutral-200 bg-neutral-100` → `rounded-sm border border-[var(--rule)] bg-[var(--background-2)]`
- Pulse bg: `bg-neutral-200` → `bg-[var(--rule)]`

**`app/(app)/coffee/[id]/loading.tsx`**
- Article: `rounded-lg border border-neutral-200 bg-white` → `rounded-sm border border-[var(--rule)] bg-[var(--paper)]`
- Skeletons: `rounded-md border border-neutral-100 p-3` → `rounded-sm border border-[var(--rule)] p-3`
- Pulse bg: `bg-neutral-200`, `bg-amber-100` → `bg-[var(--rule)]`, `bg-[var(--background-2)]`

**`app/(app)/coffee/error.tsx`** and **`app/(app)/coffee/[id]/error.tsx`**
- Back link: `border-neutral-200 text-neutral-700 hover:bg-neutral-100` → `border-[var(--rule)] text-[var(--ink-2)] hover:bg-[var(--background-2)]`

---

## Implementation Order

Work on the current branch `redesign/editorial-tasting-journal`. Update files in this order:

1. Detail view (`view.tsx`) — biggest visual impact, removes RatingStars dependency
2. Edit page + Evaluate page headers
3. Profile page + form
4. Shops (page + card + list + search)
5. List views (view.tsx + my/view.tsx + copy button)
6. Users profile page + view
7. AI page + settings section + LLM panel
8. Loading + error states

---

## Verification

```bash
# Type check + lint
pnpm build
pnpm lint

# Tests (all should remain green — no test changes needed for Phase 2)
pnpm test

# Browser check
pnpm dev
# Spot-check: /coffee/my, /coffee/community, /coffee/[id], /coffee/[id]/edit,
#             /coffee/[id]/evaluate, /profile, /shops, /users/[id], /ai
```

確認ポイント:
- 全ページで amber/neutral/gray カラーが消えて CSS 変数に統一
- ボタンはすべて `rounded-full` pill スタイル
- 見出しは `font-serif-display`、ラベルは `font-mono-caps`
- カード・フォームは `rounded-sm border-[var(--rule)] bg-[var(--paper)]`
