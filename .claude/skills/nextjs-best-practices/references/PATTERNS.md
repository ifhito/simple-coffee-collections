# Implementation Patterns

Concrete implementation patterns for common Next.js scenarios.

---

## Data Fetching Patterns

### 1. Basic Server Component Data Fetch

```tsx
// app/posts/[id]/page.tsx
export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const post = await getPost(id);

  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}
```

**Key points**:
- Use `async` directly on Server Components
- No loading states needed (use Suspense for that)
- No try/catch needed here (use Error Boundaries)

---

### 2. Colocation Pattern

```tsx
// app/posts/[id]/page.tsx
export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div>
      <PostContainer postId={id}>
        <AuthorContainer postId={id} />
      </PostContainer>
      <CommentsContainer postId={id} />
    </div>
  );
}

// app/posts/[id]/_containers/post/container.tsx
export async function PostContainer({
  postId,
  children,
}: {
  postId: string;
  children: React.ReactNode;
}) {
  const post = await getPost(postId); // Fetch where data is used
  return (
    <article>
      <h1>{post.title}</h1>
      {children}
    </article>
  );
}
```

**Benefits**:
- Data fetching near usage point
- Easy to understand dependencies
- Encapsulated components

---

### 3. Request Memoization

```tsx
// lib/api.ts
import { cache } from 'react';

export const getPost = cache(async (id: string) => {
  const res = await fetch(`https://api.example.com/posts/${id}`);
  return res.json();
});

// Components can call getPost multiple times without duplicate requests
async function ComponentA({ postId }: { postId: string }) {
  const post = await getPost(postId); // Request made
  return <div>{post.title}</div>;
}

async function ComponentB({ postId }: { postId: string }) {
  const post = await getPost(postId); // Memoized!
  return <div>{post.author}</div>;
}
```

**Requirements**:
- Wrap with `cache()` from React
- Works for one render cycle only
- Identical arguments required for deduplication

---

### 4. DataLoader Pattern (N+1 Prevention)

```tsx
// lib/loaders/user-loader.ts
import DataLoader from 'dataloader';

const userLoader = new DataLoader(async (ids: readonly string[]) => {
  // Batch fetch all users at once
  const users = await fetchUsersByIds([...ids]);
  return ids.map(id => users.find(u => u.id === id));
});

export const getUserWithLoader = (id: string) => userLoader.load(id);

// Usage in components
async function CommentItem({ comment }: { comment: Comment }) {
  const user = await getUserWithLoader(comment.userId);
  // Multiple CommentItem components batch their requests!
  return <div>{user.name}: {comment.text}</div>;
}
```

**When to use**: Fetching related data in loops (comments → users, posts → categories, etc.)

---

## Component Design Patterns

### 5. Container/Presentational Pattern

```tsx
// _containers/post/container.tsx (Server Component)
export async function PostContainer({ postId }: { postId: string }) {
  const post = await getPost(postId);
  return <PostView post={post} />;
}

// _components/post/view.tsx (can be Server or Client Component)
export function PostView({ post }: { post: Post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <p>{post.content}</p>
    </article>
  );
}

// If interactivity needed, mark View as Client Component
'use client';
export function PostViewInteractive({ post }: { post: Post }) {
  const [likes, setLikes] = useState(post.likes);
  return (
    <article>
      <h1>{post.title}</h1>
      <button onClick={() => setLikes(l => l + 1)}>
        ♥ {likes}
      </button>
    </article>
  );
}
```

**Directory structure**:
```
app/posts/[id]/
  ├─ page.tsx
  ├─ _containers/
  │   ├─ post/container.tsx
  │   └─ comments/container.tsx
  └─ _components/
      ├─ post/view.tsx
      └─ comment-item.tsx
```

---

### 6. Composition Pattern (Avoiding Props Drilling)

**❌ Anti-pattern** (Props drilling creates unnecessary Client Components):
```tsx
// Parent must be Client Component just to pass onClick
'use client';
export function Parent() {
  const handleClick = () => console.log('clicked');
  return (
    <Middle onClick={handleClick}>
      <Child /> {/* Can't use onClick directly */}
    </Middle>
  );
}

function Middle({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return <div>{children}</div>; // Just passing through!
}
```

**✅ Best practice** (Composition keeps more Server Components):
```tsx
// Parent can stay Server Component
export function Parent() {
  return (
    <Middle>
      <ClickableChild />
    </Middle>
  );
}

function Middle({ children }: { children: ReactNode }) {
  return <div>{children}</div>;
}

// Only the interactive child is Client Component
'use client';
function ClickableChild() {
  const handleClick = () => console.log('clicked');
  return <button onClick={handleClick}>Click me</button>;
}
```

---

### 7. Interactive Fetch Pattern

When data fetching must happen on user interaction:

```tsx
// _containers/search/container.tsx (Server Component)
export async function SearchContainer() {
  return (
    <Suspense fallback={<SearchSkeleton />}>
      <SearchForm />
    </Suspense>
  );
}

// _components/search/form.tsx (Client Component)
'use client';
export function SearchForm() {
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async (query: string) => {
    setLoading(true);
    // Call Server Action for secure server-side fetch
    const data = await searchAction(query);
    setResults(data);
    setLoading(false);
  };

  return (
    <div>
      <input onChange={(e) => handleSearch(e.target.value)} />
      {loading ? <Spinner /> : <ResultsList results={results} />}
    </div>
  );
}

// app/actions/search.ts (Server Action)
'use server';
export async function searchAction(query: string) {
  const results = await searchAPI(query);
  return results;
}
```

**Pattern**: Client Component handles interaction → Server Action handles fetch → Client Component displays result

---

## Caching Patterns

### 8. Static Rendering (Default)

```tsx
// Automatically cached at build time
export default async function StaticPage() {
  const data = await fetch('https://api.example.com/static-data');
  return <div>{data.title}</div>;
}
```

**Use when**: Data rarely changes (marketing pages, blog posts, documentation)

---

### 9. Dynamic Rendering

```tsx
// Force dynamic rendering
export const dynamic = 'force-dynamic';

export default async function DynamicPage() {
  const data = await fetch('https://api.example.com/dynamic-data', {
    cache: 'no-store',
  });
  return <div>{data.title}</div>;
}
```

**Use when**: Data is user-specific or changes frequently (dashboards, user profiles)

---

### 10. Revalidation

```tsx
// Revalidate every 60 seconds
export const revalidate = 60;

export default async function RevalidatedPage() {
  const data = await fetch('https://api.example.com/data');
  return <div>{data.title}</div>;
}

// Or per-request
const data = await fetch('https://api.example.com/data', {
  next: { revalidate: 60 },
});
```

**Use when**: Data changes periodically but doesn't need real-time updates (news, stock prices)

---

## Error Handling

### 11. Error Boundary

```tsx
// app/posts/[id]/error.tsx
'use client';

export default function PostError({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div>
      <h2>Something went wrong!</h2>
      <p>{error.message}</p>
      <button onClick={reset}>Try again</button>
    </div>
  );
}
```

**Auto-wraps**: All `page.tsx` and `layout.tsx` files in the same directory level

---

### 12. Loading States

```tsx
// app/posts/[id]/loading.tsx
export default function PostLoading() {
  return <div>Loading post...</div>;
}

// Or use Suspense for granular control
<Suspense fallback={<PostSkeleton />}>
  <PostContainer postId={id} />
</Suspense>
```

---

## Authentication Pattern

### 13. Secure Server-Side Auth Check

```tsx
// lib/auth.ts
import { cache } from 'react';
import { cookies } from 'next/headers';

export const getCurrentUser = cache(async () => {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth-token');
  if (!token) return null;

  const user = await validateToken(token.value);
  return user;
});

// app/dashboard/page.tsx
export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/login');
  }

  return <div>Welcome, {user.name}!</div>;
}
```

**Security**: Auth checks happen on server, tokens never exposed to client

---

For detailed explanations, see @nextjs-basic-principle/
