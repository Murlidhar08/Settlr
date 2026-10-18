# AI Agent Development Guidelines (AGENTS.md)

Welcome, AI Agent! This file is your canonical reference manual for this repository. Adhering to these conventions ensures fast, consistent, secure, and backwards-compatible code when implementing new features or refactoring.

---

## 1. Tech Stack Overview

- **Framework**: Next.js 16 (App Router) with React 19
- **Language**: TypeScript (strict mode enabled, zero `any` policy where possible)
- **Database ORM**: Prisma 7 with PostgreSQL (`@prisma/client`, `@prisma/adapter-pg`)
- **Authentication**: Better Auth with Prisma adapter, RBAC, Passkeys, 2FA, Turnstile
- **Server State**: TanStack React Query v5
- **Forms & Validation**: React Hook Form + Zod v4
- **Styling & UI**: Tailwind CSS 4, Framer Motion, Lucide React, Base UI, Sonner

---

## 2. Directory Layout & File Responsibilities

| Directory | Purpose & Rules | What Goes Here | What NEVER Goes Here |
|---|---|---|---|
| `actions/` | Next.js Server Actions (`"use server"`). | Domain mutations, DB operations, transactional logic. | UI logic, client state, JSX, unhandled raw exceptions. |
| `app/` | Next.js App Router pages, layouts, and route handlers. | Page routes, layouts, `route.ts` API handlers. | Complex data processing algorithms, raw Prisma queries inside UI components. |
| `components/ui/` | Primitive design system components. | Buttons, inputs, dialogs, dropdowns. | Domain-specific business logic or API calls. |
| `components/` | Domain presentation components. | User cards, navbar, modals, forms. | Complex filtering, multi-step mutation orchestration. |
| `hooks/queries/` | TanStack Query fetchers and mutations. | React Query hooks (`useQuery`, `useMutation`), query keys factory. | Raw presentation markup, standalone calculations. |
| `hooks/` | Custom business logic and UI state hooks. | Data filtering, search debouncing, form state orchestration. | Direct database operations. |
| `lib/api/` | Scalable API route utilities. | `apiSuccess`, `apiError`, `createApiHandler`. | Domain-specific UI components. |
| `lib/auth/` | Authentication and authorization infrastructure. | Better Auth server instance, RBAC guards (`requirePermission`). | Business data queries unrelated to auth. |
| `lib/config/` | Validated environment schemas & constants. | `env.ts`, `constants.ts`. | Dynamic mutable runtime state. |
| `lib/errors/` | Custom typed errors and error normalizers. | `AppError`, `NotFoundError`, `normalizeError`. | Raw API route handlers. |
| `lib/prisma/` | Database client singleton. | `prisma.ts`. | Transient state. |
| `lib/utils/` | Modular reusable pure utility functions. | `formatters.ts`, `transaction.ts`, `user.ts`, `file.ts`, `cn.ts`. | Functions with side-effects or React hooks. |
| `types/` | TypeScript type declarations and contracts. | DTOs, interface models, API response types. | Runtime JavaScript logic. |
| `proxy.ts` | Next.js 16 edge proxy convention (formerly middleware) for security & routing. | CSRF origin validation, OWASP security headers, pathname forwarding. | Heavy database queries or long-running tasks. |

---

## 3. Seven Architectural Invariants (Non-Negotiable Rules)

### Rule 1: Clean Separation of UI and Business Logic
- **UI Components** must only handle visual presentation, receiving props and event handlers.
- **Complex Logic** (filtering algorithms, search parsing, multi-field aggregations, modal flow coordination) MUST be extracted into custom hooks under `hooks/` (e.g., `useUserManagement`, `useStorageItem`).
- **Never call `redirect()` inside client onClick handlers** (throws Next.js redirect errors). Use `useRouter().push(...)` for client navigation.

### Rule 2: Zero Server-Side State Pollution
- **NEVER declare or mutate module-scoped variables** (e.g. `let currentConfig = ...`) on the server. In Node.js, module state is shared across all concurrent requests and users, causing severe data leaks.
- Client preferences must be managed via React Context (`UserConfigProvider`) and passed down or retrieved via session/request context.

### Rule 3: Uniform Error Handling Hierarchy
- Always use the typed error classes in `@/lib/errors`:
  - `UnauthorizedError` (401)
  - `ForbiddenError` (403)
  - `NotFoundError` (404)
  - `ValidationError` (400)
  - `ConflictError` (409)
- In Server Actions, wrap logic with `safeAction(async () => ...)` from `@/lib/actions/action-handler` to return `{ success: true, data } | { success: false, error }`.
- In API Route Handlers, use `apiSuccess(data)` and `apiError(error)` from `@/lib/api/response`.

### Rule 4: Safe Session Retrieval in APIs & Actions
- **Do NOT call `getUserSession()` in API routes or background actions**. `getUserSession()` calls `redirect('/login')` which breaks JSON endpoints.
- **Use `getServerSession()`** from `@/lib/auth/auth` instead. It safely returns `{ user, session }` or `null`.

### Rule 5: Strict Security & CSRF Defense
- **Never re-add `disableOriginCheck: true`** in Better Auth config. Better Auth must validate origins.
- **Path Traversal Protection**: Always use `getAbsolutePath(relativePath)` from `@/lib/file-operations` for file storage. It enforces that resolved paths never escape `uploads/`.
- File renaming operations must forbid path separators (`/`, `\`, `..`).

### Rule 6: TanStack Query Cache Discipline
- All query keys MUST be declared in `@/hooks/queries/keys.ts`. Never hardcode raw string query keys in components.
- Mutations MUST invalidate their respective query keys in `onSuccess`:
  ```ts
  queryClient.invalidateQueries({ queryKey: QUERY_KEYS.user.detail(id) });
  ```

### Rule 7: Consistent Naming Conventions
- **Files & Directories**: `kebab-case` only (`user-profile.tsx`, `use-user-filters.ts`, `app-error.ts`).
- **Types & Interfaces**: `PascalCase` (`UserSettingsInput`, `UserStats`).
- **Functions & Methods**: `camelCase` (`formatUserCurrency`, `getErrorMessage`).
- **Constants**: `UPPER_SNAKE_CASE` (`DEFAULT_USER_SETTINGS`, `QUERY_KEYS`).
- **Hooks**: `use` prefix (`useUserManagement`, `useCurrentUser`).

---

## 4. PostgreSQL Database Standards & Prisma Guidelines

All database models, schema extensions, and queries in PostgreSQL must strictly conform to relational database conventions. Prisma models use idiomatic TypeScript `camelCase` mapped explicitly to PostgreSQL `snake_case` using `@map` and `@@map`.

### Recommended Naming Standards Table

| Database Object | Recommended Style | Example | Notes |
|---|---|---|---|
| **Tables** | `snake_case` | `app_config` | Lowercase snake_case, singular domain (`@@map("app_config")`). |
| **Columns** | `snake_case` | `created_at` | Map TypeScript camelCase fields to snake_case (`@map("created_at")`). |
| **Primary keys** | `id` | `id` | Standard primary key column name (`@id`). |
| **Foreign keys** | `{referenced_table}_id` | `user_id` | Refers to target table singular name + `_id` suffix (`@map("user_id")`). |
| **Boolean columns** | `is_` / `has_` prefix | `is_active` | Always prefix booleans for semantic clarity (`is_verified`, `has_2fa`). |
| **Timestamps** | `_at` suffix | `updated_at` | Point-in-time timestamp (`created_at`, `deleted_at`, `expires_at`). |
| **Date-only columns** | `_date` suffix | `birth_date` | Use for date-only columns without time (`start_date`, `due_date`). |
| **Indexes** | `idx_{table}_{columns}` | `idx_users_email` | Explicit index name (`@@index([email], map: "idx_users_email")`). |
| **Unique constraints** | `uq_{table}_{columns}` | `uq_users_email` | Explicit unique constraint name (`@@unique([email], map: "uq_users_email")`). |
| **Foreign key constraints** | `fk_{table}_{column}` | `fk_transactions_user_id` | Explicit foreign key constraint name (`map: "fk_transactions_user_id"`). |

### Canonical Prisma Model Example

```prisma
model Post {
  id            String    @id @default(cuid())
  authorId      String    @map("author_id")
  title         String
  content       String?   @db.Text
  isActive      Boolean   @default(true) @map("is_active")
  publishedDate DateTime? @db.Date @map("published_date")
  createdAt     DateTime  @default(now()) @map("created_at")
  updatedAt     DateTime  @updatedAt @map("updated_at")

  author User @relation(fields: [authorId], references: [id], onDelete: Cascade, map: "fk_posts_author_id")

  @@index([authorId], map: "idx_posts_author_id")
  @@unique([authorId, title], map: "uq_posts_author_id_title")
  @@map("post")
}
```

---

## 5. Feature Implementation Blueprint (Step-by-Step Recipe)

When asked to build a new feature (e.g., "Post Management", "Organization Invoices"), follow this 5-step sequence:

### Step 1: Types (`types/<feature>.ts`)
Define TypeScript interfaces and DTOs:
```ts
// types/post.ts
export interface PostItem {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  authorId: string;
}

export interface CreatePostInput {
  title: string;
  content: string;
}
```
Export from `types/index.ts`.

### Step 2: Server Action (`actions/<feature>.actions.ts`)
Implement secure server tasks with permission checks and `safeAction`:
```ts
// actions/post.actions.ts
"use server";

import { prisma } from "@/lib/prisma/prisma";
import { requirePermission } from "@/lib/auth/guard";
import { safeAction } from "@/lib/actions/action-handler";
import type { CreatePostInput } from "@/types";

export async function createPost(input: CreatePostInput) {
  return safeAction(async () => {
    const { user } = await requirePermission("post", "create");
    return prisma.post.create({
      data: {
        title: input.title,
        content: input.content,
        authorId: user.id,
      },
    });
  });
}
```
Re-export in `actions/index.ts`.

### Step 3: Query Keys & Hooks (`hooks/queries/<feature>.ts`)
Register keys in `hooks/queries/keys.ts` and build TanStack Query hooks:
```ts
// In hooks/queries/keys.ts:
// post: { all: ["posts"] as const, detail: (id: string) => ["post", id] as const }

// hooks/queries/post.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { QUERY_KEYS } from "./keys";
import { getPosts, createPost } from "@/actions/post.actions";

export const usePosts = () => {
  return useQuery({
    queryKey: QUERY_KEYS.post.all,
    queryFn: () => getPosts(),
  });
};

export const useCreatePost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreatePostInput) => createPost(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.post.all });
    },
  });
};
```
Re-export in `hooks/queries/index.ts`.

### Step 4: Custom Business Logic Hook (`hooks/use-<feature>-management.ts`)
If filtering, searching, or multi-field orchestration is required:
```ts
// hooks/use-post-management.ts
"use client";

import { useState, useMemo } from "react";
import { usePosts } from "@/hooks/queries/post";

export function usePostManagement() {
  const { data: posts, isLoading, refetch } = usePosts();
  const [search, setSearch] = useState("");

  const filteredPosts = useMemo(() => {
    if (!posts) return [];
    return posts.filter((p) => p.title.toLowerCase().includes(search.toLowerCase()));
  }, [posts, search]);

  return {
    posts: filteredPosts,
    isLoading,
    search,
    setSearch,
    refetch,
  };
}
```

### Step 5: Presentation UI (`components/<feature>/...` & `app/...`)
Keep the UI focused purely on rendering:
```tsx
// components/post/post-list.tsx
"use client";

import { usePostManagement } from "@/hooks/use-post-management";
import { Input } from "@/components/ui/input";

export function PostList() {
  const { posts, isLoading, search, setSearch } = usePostManagement();

  if (isLoading) return <div>Loading posts...</div>;

  return (
    <div>
      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search..." />
      {posts.map((post) => (
        <article key={post.id}>
          <h3>{post.title}</h3>
        </article>
      ))}
    </div>
  );
}
```

---

## 6. Quick Import Reference Cheat Sheet

```ts
// Database
import { prisma } from "@/lib/prisma/prisma";

// Auth & Permissions
import { auth, getServerSession, getUserSession } from "@/lib/auth/auth";
import { requirePermission, hasPermission } from "@/lib/auth/guard";
import { hasRole, parseRoles, ROLES } from "@/lib/auth/permissions";

// Error Handling
import { AppError, NotFoundError, UnauthorizedError, ForbiddenError, ValidationError } from "@/lib/errors";
import { getErrorMessage, normalizeError } from "@/lib/errors/error-handler";
import { safeAction } from "@/lib/actions/action-handler";

// Standard API Responses
import { apiSuccess, apiError } from "@/lib/api/response";
import { createApiHandler } from "@/lib/api/handler";

// Environment & Config
import { env } from "@/lib/config/env";
import { DEFAULT_USER_SETTINGS } from "@/lib/config/constants";

// Formatting Utilities
import { formatUserDate, formatUserTime, formatUserDateTime, formatUserCurrency, formatAmount } from "@/lib/utils";
import { formatTransactionAmount, getTransactionCurrencySymbol } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { getFileUrl } from "@/lib/utils";

// Domain Types & Models
import type { PartyRes, PartyInput, TransactionRes, UserSettingsInput } from "@/types";
import { TransactionDirection, ModalMode } from "@/types";

// Domain Server Actions
import { addBusiness, switchBusiness, getFinancialAccounts, getPartyList, addTransaction } from "@/actions";

// Query Hooks
import { QUERY_KEYS } from "@/hooks/queries/keys";
import { useCurrentUser, useAdminUsers, useStorageItems, useBusinessList, useParties, useCashbook, useFinancialAccounts, useDashboardSummary } from "@/hooks/queries";
```

---

## 7. Verification Checklist Before Finishing Any Task

Always run these terminal commands before completing work:
1. `npm run typecheck` - Verify 0 TypeScript compilation errors.
2. `npm run lint` - Verify clean code formatting and no lint errors.
3. Ensure no temporary files or hardcoded credentials were left behind.
