# Settlr Application Architecture & Development Guide

This document outlines the architectural structure, security standards, coding conventions, domain models, and best practices established for the Settlr Ledger & Accounting Next.js project.

---

## 1. Directory Structure

The project follows a clean, modular layer-based architecture designed for scalability, maintainability, and strict separation of concerns.

```text
├── actions/                  # Next.js Server Actions ("use server" domain mutations)
│   ├── admin.actions.ts      # Administrative user and system mutations
│   ├── admin/                # Specialized admin actions (e.g., app-config)
│   ├── auth/                 # Initial system setup and authentication triggers
│   ├── business.actions.ts   # Multi-business creation, update, switch, and stats
│   ├── dashboard.actions.ts  # Financial summaries and account distribution queries
│   ├── financial-account.actions.ts # Bank and cash account management and balances
│   ├── parties.actions.ts    # Customer/Supplier party CRUD, statement calculation
│   ├── recycle-bin.actions.ts# Soft-delete, restore, and permanent deletion operations
│   ├── storage.actions.ts    # File system and asset storage operations
│   ├── transaction.actions.ts# Core double-entry transactions and money transfers
│   ├── user.actions.ts       # User profile and session management
│   ├── user-settings.actions.ts # User preferences and locale settings
│   └── index.ts              # Centralized Server Actions barrel entrypoint
│
├── app/                      # Next.js App Router (Pages, Layouts, API Route Handlers)
│   ├── (app)/                # Authenticated application route group
│   │   ├── accounts/         # Financial accounts overview & account ledger
│   │   ├── admin/            # Administrative dashboard and user management UI
│   │   ├── business/         # Business profiles and active business switcher
│   │   ├── cashbook/         # Daily income/expense transactions ledger
│   │   ├── dashboard/        # Main dashboard, summary cards, and cashflow charts
│   │   ├── logout/           # Active session termination page
│   │   ├── parties/          # Customer and supplier counterparty ledgers
│   │   ├── settings/         # User profile, security, and preferences pages
│   │   └── transactions/     # Transaction detail inspection & actions
│   ├── (auth)/               # Unauthenticated authentication routes
│   │   ├── login/            # Sign-in page (Email, Username, OAuth, Passkey)
│   │   ├── signup/           # User registration page
│   │   ├── forgot-password/  # Password reset initiation
│   │   ├── reset-password/   # Password reset token confirmation
│   │   ├── two-factor/       # 2FA verification challenge
│   │   ├── confirm-delete-account/ # Account deletion confirmation
│   │   └── setup/            # First-time admin onboarding
│   ├── (error)/              # Standard HTTP error pages (403, 404, 500)
│   ├── _offline/             # PWA offline fallback page
│   ├── api/                  # Scalable API Route Handlers
│   │   ├── auth/[...all]/    # Better Auth catch-all API handler
│   │   ├── files/[...path]/  # Secure authenticated file serving endpoint
│   │   └── health/           # Production health check endpoint
│   ├── layout.tsx            # Root layout (Fonts, Theme Provider, Sonner Toast)
│   └── globals.css           # Global Tailwind tokens and theme stylesheets
│
├── components/               # Pure UI Components and View Layer
│   ├── account/              # Account cards and balance modals
│   ├── auth/                 # Authentication cards, social logins, forms
│   ├── header/               # Dynamic header, navigation, and business selector
│   ├── navbar/               # Bottom mobile navbar and quick action bar
│   ├── providers/            # Client context providers (Query, Theme, UserConfig, Confirm)
│   ├── tab/                  # Segmented tab controls
│   ├── transaction/          # Transaction list, transaction item, add transaction modal
│   ├── ui/                   # Primitive design system components (Button, Dialog, Input, etc.)
│   └── user/                 # User avatar, cards, document viewers
│
├── hooks/                    # Reusable React Hooks (Business Logic & State)
│   ├── queries/              # TanStack Query hooks (Server State abstraction)
│   │   ├── keys.ts           # Centralized query keys factory
│   │   ├── admin.ts          # Admin query and mutation hooks
│   │   ├── business.ts       # Business query and mutation hooks
│   │   ├── cashbook.ts       # Cashbook query and mutation hooks
│   │   ├── dashboard.ts      # Dashboard metrics query hooks
│   │   ├── financial-account.ts # Account balance & list query hooks
│   │   ├── parties.ts        # Customer & supplier party query hooks
│   │   ├── settings.ts       # Settings and preference query hooks
│   │   ├── storage.ts        # Storage query and mutation hooks
│   │   ├── user.ts           # User profile and session query hooks
│   │   └── index.ts          # Central query barrel export
│   ├── use-user-management.ts# Decoupled user filtering, searching, and statistics hook
│   └── use-storage-item.ts   # Decoupled storage item action & state hook
│
├── lib/                      # Core Infrastructure, Integrations & Business Logic
│   ├── actions/              # Server action helpers (safeAction wrapper)
│   ├── animations.ts         # Framer Motion animation tokens and transitions
│   ├── api/                  # Scalable API response builders and route wrappers
│   ├── auth/                 # Better Auth server configuration, RBAC, session guards
│   ├── config/               # Validated environment schemas and constants
│   ├── errors/               # Custom AppError hierarchy and universal error normalizers
│   ├── file-operations.ts    # Secure file path normalization and storage operations
│   ├── languages/            # i18n dictionary and translation helpers
│   ├── prisma/               # Prisma database client instance
│   ├── transaction-logic.ts  # Ledger calculations, balances, and perspectives
│   ├── utils/                # Pure utility functions (formatters, transaction, file, cn, user)
│   └── nodemailer.ts         # Transporter and transactional email dispatcher
│
├── proxy.ts                  # Edge Proxy (Next.js 16 convention: CSRF defense, OWASP security headers)
├── types/                    # TypeScript Type Definitions & API Contracts
│   ├── api.ts                # API envelopes and pagination interfaces
│   ├── party.ts              # Party and counterparty interfaces (PartyRes, PartyInput)
│   ├── storage.ts            # Storage metadata interfaces
│   ├── transaction.ts        # Transaction models (ModalMode, TransactionRes, TransactionDirection)
│   ├── user.ts               # User preferences and administrative interfaces
│   └── index.ts              # Centralized types barrel export
├── uploads/                  # Managed file uploads directory (Root storage)
└── tanstacks/ & utility/     # Backward-compatibility re-export shims
```

---

## 2. Separation of Business Logic from UI Components

To maintain readability and testability, UI components remain **pure presentation layers**. Complex filtering algorithms, state mutations, and data transformations are extracted into custom hooks.

### Architectural Flow:
```
[Page / UI Component] (Pure presentation, event triggers)
         │
         ▼
[Custom Business Hook] (`useUserManagement`, `useStorageItem`)
         │
         ▼
[Query / Mutation Hook] (`useBusinessList`, `useParties`, `useCashbook`)
         │
         ▼
[Server Action / API] (Validation, Authorization, DB operations via `prisma`)
```

- **Bad**: Placing `users.filter(...)`, direct database queries, `redirect(...)` inside client onClick handlers, or raw query keys in component files.
- **Good**: Invoking `const { filteredUsers, stats, isFilterApplied } = useUserManagement();` in the component.

---

## 3. Core Business & Ledger Domain Model

Settlr manages financial records using an isolated double-entry ledger system per business:

1. **Business Entity (`business`)**:
   - Every transaction belongs to an `activeBusinessId`.
   - Cross-business transactions are strictly prohibited.
   - Automatically initializes default accounts on creation (Cash, Owner Withdrawal, Owner Investment, Expense, Sales).

2. **Financial Accounts (`financial_account`)**:
   - Types:
     - `MONEY`: Liquid accounts (Cash, Bank/Online, Cheque).
     - `PARTY`: Tied to counterparties (Customers, Suppliers).
     - `CATEGORY`: Categorical accounts (Income, Expense, Asset, Equity, Adjustment).

3. **Parties (`party`)**:
   - Represents external individuals or businesses (Customers, Suppliers, Employees).
   - Linked to a corresponding `PARTY` financial account for automatic ledger synchronization.

4. **Transactions (`transaction`)**:
   - Represents double-entry flows moving value from `fromAccountId` to `toAccountId`.
   - Supports perspective calculation (IN / OUT / NEUTRAL).
   - Validates that source and destination accounts belong to the active business.

5. **Recycle Bin (`recycle_bin`)**:
   - Entities (`Business`, `FinancialAccount`, `Party`, `Transaction`) utilize soft deletion (`isDelete: true`).
   - Enables safe restoration and audit preservation.

---

## 4. Security & Anti-XSRF / CSRF Defense

Enterprise-grade security controls are implemented at both the network edge and application layers:

### 1. Better Auth Origin Enforcement
- In `lib/auth/auth.ts`, `disableOriginCheck` is strictly disabled.
- Better Auth validates incoming requests against `BETTER_AUTH_URL` and `BETTER_AUTH_TRUSTED_ORIGINS`.

### 2. Next.js Edge Proxy Protection (`proxy.ts`)
- Modern Next.js 16 file convention (replaces deprecated `middleware.ts`).
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

## 5. Error Handling Hierarchy

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

## 6. Scalable API Standards

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

## 7. State Management Strategy & TanStack Query Discipline

1. **Server State (TanStack Query)**:
   - Primary data store for all remote data.
   - Centralized Query Keys in `hooks/queries/keys.ts` prevent collisions.
   - Mutations systematically invalidate corresponding query keys to keep cache synchronized.
2. **Centralized Query Keys Factory**:
   ```ts
   // In hooks/queries/keys.ts
   QUERY_KEYS.business.all
   QUERY_KEYS.business.detail(businessId)
   QUERY_KEYS.cashbook.all
   QUERY_KEYS.parties.all
   QUERY_KEYS.parties.detail(partyId)
   QUERY_KEYS.financialAccount.all
   QUERY_KEYS.dashboard.summary(businessId)
   ```
3. **Client UI State (React Context + Hooks)**:
   - `UserConfigProvider`: Manages active user locale, currency, date-time format, and theme.
   - `ConfirmProvider`: Reusable promise-based modal confirmation state.
4. **Zero Server State Pollution**:
   - Never mutate global module-scoped variables on the server during request processing. Preferences are passed via parameters or resolved from request session context.

---

## 8. Naming Conventions

- **Files & Folders**: `kebab-case` throughout (e.g., `user-management.ts`, `app-error.ts`, `financial-account.ts`).
- **Interfaces & Types**: `PascalCase` (e.g., `UserSettingsInput`, `PartyRes`, `TransactionRes`).
- **Constants**: `UPPER_SNAKE_CASE` (e.g., `DEFAULT_USER_SETTINGS`, `QUERY_KEYS`).
- **Functions & Methods**: `camelCase` (e.g., `formatUserCurrency`, `getErrorMessage`).
- **Hooks**: `use` prefix (e.g., `useUserManagement`, `useParties`, `useBusinessList`).

---

## 9. PostgreSQL Database Architecture & Prisma Standards

The project utilizes PostgreSQL with Prisma ORM 7 (`@prisma/client`, `@prisma/adapter-pg`). All database tables, columns, indexes, and constraints must follow strict relational naming standards. In Prisma, models use idiomatic TypeScript `camelCase` and map explicitly to PostgreSQL `snake_case` using `@map` and `@@map`.

### Recommended Naming Standards Table

| Database Object | Recommended Style | Example | Notes |
|---|---|---|---|
| **Tables** | `snake_case` | `financial_account` | Lowercase snake_case, singular domain name mapped via `@@map("financial_account")`. |
| **Columns** | `snake_case` | `created_at` | Map TypeScript camelCase fields to snake_case column names via `@map("created_at")`. |
| **Primary keys** | `id` | `id` | Standard primary key column identifier (`@id`). |
| **Foreign keys** | `{referenced_table}_id` | `business_id` | Refers to referenced table singular name + `_id` suffix (`@map("business_id")`). |
| **Boolean columns** | `is_` / `has_` prefix | `is_active` | Prefix with `is_` or `has_` for semantic clarity (`is_active`, `is_delete`). |
| **Timestamps** | `_at` suffix | `updated_at` | Denotes a specific point in time (`created_at`, `deleted_at`). |
| **Date-only columns** | `_date` suffix | `order_date` | Use for date-only columns without time component (`start_date`). |
| **Indexes** | `idx_{table}_{columns}` | `idx_transactions_date` | Explicitly named in Prisma schema. |
| **Unique constraints** | `uq_{table}_{columns}` | `uq_parties_business_id_name` | Explicitly named unique constraint. |
| **Foreign key constraints** | `fk_{table}_{column}` | `fk_transactions_business_id` | Explicit foreign key constraint name. |

### Core Prisma Models in Settlr

- `User` (`@@map("user")`): Auth credentials, user profiles, and active business pointer.
- `Business` (`@@map("business")`): Multi-tenant workspace container with default account configurations.
- `FinancialAccount` (`@@map("financial_account")`): Bank, cash, and category accounts with balances.
- `Party` (`@@map("party")`): Customer and supplier counterparties linked to financial accounts.
- `Transaction` (`@@map("transaction")`): Double-entry money transfers between source and destination accounts.
- `UserSettings` (`@@map("user_settings")`): User currency, locale, date/time format, and theme preferences.
- `AppConfig` (`@@map("app_config")`): Singleton system configurations (SMTP, OAuth providers).
- `UserDocument` (`@@map("user_document")`): Identity verification and uploaded legal documents.
