# Next.js Application Architecture & Development Guide

This document outlines the architectural structure, security standards, coding conventions, and best practices established for this Next.js project.

---

## 1. Directory Structure

The project follows a clean, modular layer-based architecture designed for scalability, maintainability, and clear separation of concerns.

```text
├── actions/                  # Server Actions (Domain mutations and secure server tasks)
│   ├── admin.actions.ts      # Administrative user and system mutations
│   ├── admin/                # Specialized admin actions (e.g., app-config)
│   ├── auth/                 # Initial system setup and authentication triggers
│   ├── storage.actions.ts    # File system and asset storage operations
│   ├── user.actions.ts       # User profile and session management
│   ├── user-settings.actions.ts # User preferences and locale settings
│   └── index.ts              # Centralized Server Actions entrypoint
│
├── app/                      # Next.js App Router (Pages, Layouts, API Route Handlers)
│   ├── (app)/                # Authenticated application route group
│   │   ├── admin/            # Administrative dashboard and user management UI
│   │   ├── dashboard/        # Main user landing and summary views
│   │   ├── logout/           # Active session termination page
│   │   └── settings/         # User profile, security, and preferences pages
│   ├── (auth)/               # Unauthenticated authentication routes
│   │   ├── login/            # Sign-in page (Email, Username, OAuth, Passkey)
│   │   ├── signup/           # User registration page
│   │   ├── forgot-password/  # Password reset initiation
│   │   ├── reset-password/   # Password reset token confirmation
│   │   ├── two-factor/       # 2FA verification challenge
│   │   └── setup/            # First-time admin onboarding
│   ├── api/                  # Scalable API Route Handlers
│   │   ├── auth/[...all]/    # Better Auth catch-all API handler
│   │   ├── files/[...path]/  # Secure authenticated file serving endpoint
│   │   └── health/           # Production health check endpoint
│   ├── layout.tsx            # Root layout (Fonts, Theme Provider, Sonner Toast)
│   └── globals.css           # Global Tailwind tokens and theme stylesheets
│
├── components/               # Pure UI Components and View Layer
│   ├── auth/                 # Authentication cards, social logins, forms
│   ├── providers/            # Client context providers (Query, Theme, UserConfig, Confirm)
│   ├── ui/                   # Primitive design system components (Button, Dialog, Input, etc.)
│   └── user/                 # User avatar, cards, document viewers
│
├── hooks/                    # Reusable React Hooks (Business Logic & State)
│   ├── queries/              # TanStack Query hooks (Server State abstraction)
│   │   ├── keys.ts           # Centralized query keys factory
│   │   ├── admin.ts          # Admin query and mutation hooks
│   │   ├── settings.ts       # Settings and preference query hooks
│   │   ├── storage.ts        # Storage query and mutation hooks
│   │   ├── user.ts           # User profile and session query hooks
│   │   └── index.ts          # Central query barrel export
│   ├── use-user-management.ts# Decoupled user filtering, searching, and statistics hook
│   └── use-storage-item.ts   # Decoupled storage item action & state hook
│
├── lib/                      # Core Infrastructure, Integrations & Business Logic
│   ├── actions/              # Server action helpers (safeAction wrapper)
│   ├── api/                  # Scalable API response builders and route wrappers
│   ├── auth/                 # Better Auth server configuration, RBAC, session guards
│   ├── config/               # Validated environment schemas and constants
│   ├── errors/               # Custom AppError hierarchy and universal error normalizers
│   ├── prisma/               # Prisma database client instance
│   ├── utils/                # Reusable pure utility functions (formatters, file, cn, user)
│   └── nodemailer.ts         # Transporter and transactional email dispatcher
│
├── middleware.ts             # Edge Middleware (CSRF defense, OWASP security headers)
├── types/                    # TypeScript Type Definitions & API Contracts
│   ├── api.ts                # API envelopes and pagination interfaces
│   ├── storage.ts            # Storage metadata interfaces
│   ├── user.ts               # User preferences and administrative interfaces
│   └── index.ts              # Centralized types barrel export
└── uploads/                  # Managed file uploads directory (Root storage)
```

---

## 2. Separation of Business Logic from UI Components

To maintain readability and testability, UI components should remain **pure presentation layers**. Complex filtering algorithms, state mutations, and data transformations are extracted into custom hooks.

### Pattern:
```
[Page / UI Component] (Pure presentation, event triggers)
         │
         ▼
[Custom Business Hook] (`useUserManagement`, `useStorageItem`)
         │
         ▼
[Query / Mutation Hook] (`useAdminUsers`, `useUpdateAppConfig`)
         │
         ▼
[Server Action / API] (Validation, Authorization, DB operations)
```

- **Bad**: Placing `users.filter(...)`, role permission checking, `redirect(...)` handlers, and error toast side-effects directly inside component render bodies.
- **Good**: Invoking `const { filteredUsers, stats, isFilterApplied, resetFilters } = useUserManagement();` in the component.

---

## 3. Security & Anti-XSRF / CSRF Defense

Enterprise-grade security controls are implemented at both the network edge and application layers:

### 1. Better Auth Origin Enforcement
- In `lib/auth/auth.ts`, `disableOriginCheck` is strictly disabled.
- Better Auth validates incoming requests against `BETTER_AUTH_URL` and `BETTER_AUTH_TRUSTED_ORIGINS`.

### 2. Next.js Middleware Protection (`middleware.ts`)
- **CSRF Origin/Referer Validation**: All state-changing HTTP requests (`POST`, `PUT`, `PATCH`, `DELETE`) to `/api/*` are validated against allowed hostnames.
- **OWASP Security Headers**:
  - `X-Frame-Options: SAMEORIGIN` (prevents UI redressing / clickjacking)
  - `X-Content-Type-Options: nosniff` (blocks MIME-confusion attacks)
  - `Referrer-Policy: strict-origin-when-cross-origin` (prevents referrer leakage)
  - `Permissions-Policy: camera=(), microphone=(), geolocation=()` (restricts sensitive device capabilities)
  - `X-XSS-Protection: 1; mode=block` (legacy XSS filter activation)

### 3. Path Traversal Defense (`lib/file-operations.ts` & `app/api/files/[...path]`)
- Normalized and verified with `path.resolve(UPLOAD_ROOT, safePath)`.
- Rejects any resolved path attempting to escape outside the `uploads/` directory boundary.
- File renaming strictly forbids path separators (`/`, `\`, `..`).

---

## 4. Error Handling Hierarchy

All server errors and input failures are handled uniformly through typed application errors:

### Error Classes (`lib/errors/app-error.ts`):
- `AppError`: Base error class with `statusCode`, `code`, and optional `details`.
- `UnauthorizedError` (401): Missing or expired authentication.
- `ForbiddenError` (403): Missing required RBAC permissions.
- `NotFoundError` (404): Missing entity or file.
- `ValidationError` (400): Zod validation failures.
- `ConflictError` (409): Resource duplicates or concurrent state conflicts.

### Client & API Normalizer (`lib/errors/error-handler.ts`):
- Automatically transforms Zod errors, AppErrors, and unknown exceptions into safe user-facing error structures.
- Prevents database connection strings or internal stack traces from leaking to clients in production.

---

## 5. Scalable API Standards

API routes return predictable JSON envelopes:

### Success Response:
```json
{
  "success": true,
  "data": { ... },
  "meta": { "timestamp": "2026-10-12T20:00:00.000Z" }
}
```

### Error Response:
```json
{
  "success": false,
  "error": {
    "message": "User not found",
    "code": "NOT_FOUND",
    "details": null
  }
}
```

Constructed using:
- `apiSuccess(data, meta?, status?)` from `@/lib/api/response`
- `apiError(error, status?)` from `@/lib/api/response`

---

## 6. Environment Configuration

- Managed in `lib/config/env.ts` with strict Zod validation.
- Missing environment variables fail fast at boot with clear instructions detailing the missing keys.
- Environment variables are exposed via typed getters: `env.server` and `env.client`.

---

## 7. State Management Strategy

1. **Server State (TanStack Query)**:
   - Primary data store for all remote data.
   - Centralized Query Keys in `hooks/queries/keys.ts` prevent collisions.
   - Mutations systematically invalidate corresponding query keys to keep cache synchronized.
2. **Client UI State (React Context + Hooks)**:
   - `UserConfigProvider`: Manages active user locale, currency, date-time format, and theme.
   - `ConfirmProvider`: Reusable promise-based modal confirmation state.
   - Local component UI state (modals, dropdowns) managed via React state within custom hooks.
3. **No Server State Pollution**:
   - Never mutate global module-scoped variables on the server during request processing. Formatting preferences are either passed via arguments or derived from user session context.

---

## 8. Naming Conventions

- **Files & Folders**: `kebab-case` throughout (e.g., `user-management.ts`, `app-error.ts`).
- **Interfaces & Types**: `PascalCase` (e.g., `UserSettingsInput`, `StorageItem`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_USER_SETTINGS`, `QUERY_KEYS`).
- **Functions & Methods**: `camelCase` (e.g., `formatUserCurrency`, `getErrorMessage`).
- **Hooks**: `use` prefix (e.g., `useUserManagement`, `useStorageItem`).
