# Next.js Design Principles

Core design principles for Next.js App Router (React Server Components) implementation.

---

## 1. Server Components First

**Principle**: Perform data fetching in Server Components, not Client Components.

**Why**:
- **Fast backend access**: Server-to-API communication is faster & more stable than client-to-API
- **Simple & secure**: No 3rd-party libraries needed; async/await works natively
- **Smaller bundles**: Fetch logic, validation, and error handling code never sent to client

**When to use Client Components**:
- User interaction-driven data fetching (see Interactive Fetch pattern)
- React hooks (useState, useEffect, etc.)
- Browser-only APIs

**Anti-pattern**: Using SWR/React Query in Client Components for initial data loading

---

## 2. Tree-Based UI Decomposition

**Principle**: Design UI as a component tree from top-down, not bottom-up.

**Why**:
- Enables early application of data fetch colocation
- Prevents large refactors when adding composition patterns
- Makes data dependencies explicit in component hierarchy

**Process**:
1. **Design**: Decompose UI into tree structure based on data dependencies
2. **Scaffold**: Create component tree with placeholder implementations
3. **Implement**: Fill in details (Server Components first, then Client Components)

**Key point**: Don't get locked into initial tree structure—refactor as you learn more

---

## 3. Container-First Design

**Principle**: Separate data-fetching containers from presentational components.

**Pattern**:
```tsx
// Container: handles data fetching (Server Component)
async function PostContainer({ postId }: { postId: string }) {
  const post = await getPost(postId);
  return <PostView post={post} />;
}

// Presentational: handles rendering (can be Client Component if needed)
function PostView({ post }: { post: Post }) {
  return <article>{post.title}</article>;
}
```

**Benefits**:
- Clear separation of concerns
- Reusable presentational components
- Easier testing and maintenance

**Naming convention**: `{Feature}Container` for data-fetching components

---

## 4. Request Optimization

**Principle**: Use Request Memoization and DataLoader to prevent duplicate/N+1 fetches.

### Request Memoization

**What**: Next.js automatically deduplicates identical fetch requests during rendering.

**Pattern**:
```tsx
// Both components call getPost(1) but only 1 request is made
async function ComponentA() {
  const post = await getPost(1); // Request made
  return <div>{post.title}</div>;
}

async function ComponentB() {
  const post = await getPost(1); // Memoized, no request
  return <div>{post.author}</div>;
}
```

**Requirement**: Use React's `cache()` wrapper for non-fetch functions

### DataLoader Pattern

**What**: Batch N+1 queries into a single request.

**When**: Fetching data in loops (e.g., user info for each comment)

**Pattern**:
```tsx
// ❌ N+1 problem
comments.map(async (comment) => {
  const user = await getUser(comment.userId); // N requests!
});

// ✅ With DataLoader
comments.map(async (comment) => {
  const user = await getUserWithLoader(comment.userId); // Batched into 1 request
});
```

---

## 5. Composition Over Props Drilling

**Principle**: Use composition pattern to avoid prop drilling, especially for Client Components.

**Anti-pattern** (Props drilling):
```tsx
<Container>
  <Middle onClick={handler}>
    <DeepChild onClick={handler} /> {/* Props passed through layers */}
  </Middle>
</Container>
```

**Best practice** (Composition):
```tsx
<Container>
  <Middle>
    <DeepChild onClick={handler} /> {/* Direct composition */}
  </Middle>
</Container>
```

**Why**:
- Reduces unnecessary Client Component boundaries
- Keeps more components as Server Components
- Improves bundle size and performance

**Rule**: If a component only passes props to children without using them, use composition instead

---

## Quick Decision Tree

```
Is this data fetching?
├─ YES → Use Server Component (Principle 1)
│   ├─ User interaction needed? → See Interactive Fetch pattern
│   ├─ Duplicate requests possible? → Apply Request Memoization (Principle 4)
│   └─ Loop/array iteration? → Use DataLoader (Principle 4)
│
└─ NO → Is this for UI rendering?
    ├─ Needs interactivity? → Client Component
    ├─ Just passing props down? → Use Composition (Principle 5)
    └─ Static rendering? → Server Component (default)
```

---

For implementation details, see @.claude/skills/nextjs-best-practices/PATTERNS.md
