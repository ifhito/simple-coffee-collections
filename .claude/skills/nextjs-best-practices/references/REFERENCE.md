# Detailed Reference Documentation

In-depth documentation for Next.js best practices. Import these as needed.

---

## Part 1: Data Fetching

**Overview**: @nextjs-basic-principle/part_1.md

| Topic | Document | Key Concepts |
|-------|----------|--------------|
| Server Components | @nextjs-basic-principle/part_1_server_components.md | Why Server Components for data fetching |
| Colocation | @nextjs-basic-principle/part_1_colocation.md | Fetch data near usage point |
| Request Memoization | @nextjs-basic-principle/part_1_request_memoization.md | Automatic deduplication |
| Concurrent Fetch | @nextjs-basic-principle/part_1_concurrent_fetch.md | Parallel data fetching |
| DataLoader | @nextjs-basic-principle/part_1_data_loader.md | N+1 query prevention |
| Fine-Grained API | @nextjs-basic-principle/part_1_fine_grained_api_design.md | API granularity design |
| Interactive Fetch | @nextjs-basic-principle/part_1_interactive_fetch.md | User-triggered data fetching |

---

## Part 2: Component Design

**Overview**: @nextjs-basic-principle/part_2.md

| Topic | Document | Key Concepts |
|-------|----------|--------------|
| Bundle Boundary | @nextjs-basic-principle/part_2_bundle_boundary.md | Server/Client component split |
| Client Components Use Cases | @nextjs-basic-principle/part_2_client_components_usecase.md | When to use Client Components |
| Composition Pattern | @nextjs-basic-principle/part_2_composition_pattern.md | Avoid prop drilling |
| Container-First Design | @nextjs-basic-principle/part_2_container_1st_design.md | Tree-based UI decomposition |
| Container/Presentational | @nextjs-basic-principle/part_2_container_presentational_pattern.md | Separation of concerns |

---

## Part 3: Rendering & Caching

**Overview**: @nextjs-basic-principle/part_3.md

| Topic | Document | Key Concepts |
|-------|----------|--------------|
| Static Rendering | @nextjs-basic-principle/part_3_static_rendering_full_route_cache.md | Build-time rendering & Full Route Cache |
| Dynamic Rendering | @nextjs-basic-principle/part_3_dynamic_rendering_data_cache.md | Runtime rendering & Data Cache |
| Router Cache | @nextjs-basic-principle/part_3_router_cache.md | Client-side navigation cache |
| Data Mutation | @nextjs-basic-principle/part_3_data_mutation.md | Server Actions & revalidation |

---

## Part 4: Performance Optimization

**Overview**: @nextjs-basic-principle/part_4.md

| Topic | Document | Key Concepts |
|-------|----------|--------------|
| Pure Server Components | @nextjs-basic-principle/part_4_pure_server_components.md | Deterministic rendering |
| Suspense & Streaming | @nextjs-basic-principle/part_4_suspense_and_streaming.md | Progressive rendering |
| Partial Pre-rendering | @nextjs-basic-principle/part_4_partial_pre_rendering.md | Hybrid static/dynamic |

---

## Part 5: Other Practices

**Overview**: @nextjs-basic-principle/part_5.md

| Topic | Document | Key Concepts |
|-------|----------|--------------|
| Request Context | @nextjs-basic-principle/part_5_request_ref.md | Async context & cache() |
| Authentication | @nextjs-basic-principle/part_5_auth.md | Server-side auth patterns |
| Error Handling | @nextjs-basic-principle/part_5_error_handling.md | Error boundaries & recovery |

---

## Quick Topic Lookup

**Need help with...**

- **"How do I fetch data?"** → Part 1: Server Components
- **"Duplicate API calls?"** → Part 1: Request Memoization
- **"N+1 queries?"** → Part 1: DataLoader
- **"When to use 'use client'?"** → Part 2: Bundle Boundary
- **"Prop drilling?"** → Part 2: Composition Pattern
- **"Component structure?"** → Part 2: Container-First Design
- **"Caching strategy?"** → Part 3: Static/Dynamic Rendering
- **"User form submission?"** → Part 3: Data Mutation
- **"Loading states?"** → Part 4: Suspense & Streaming
- **"Auth implementation?"** → Part 5: Authentication
- **"Error handling?"** → Part 5: Error Handling

---

## External Resources

- [Next.js Official Docs](https://nextjs.org/docs)
- [React Server Components](https://ja.react.dev/reference/rsc/server-components)
- [Next.js App Router Guide](https://nextjs.org/docs/app)
