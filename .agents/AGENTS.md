# Workspace Coding Standards & Architectural Invariants

This workspace is governed by the architectural standards defined in `AGENTS.md` and `ARCHITECTURE.md`.

## Core Guidelines for Antigravity AI Agents:
1. **Layered Architecture**:
   - UI (`components/`, `app/`) -> Presentation only.
   - Business Hooks (`hooks/`) -> Filtering, searching, multi-step orchestration.
   - Server State (`hooks/queries/`) -> TanStack React Query v5 with centralized keys in `hooks/queries/keys.ts`.
   - Server Actions (`actions/`) -> Secure mutations using `safeAction` re-exported in `actions/index.ts`.
   - APIs (`app/api/`) -> Standardized with `apiSuccess` / `apiError` and `createApiHandler`.
   - Types (`types/`) -> Strictly kebab-case files (`party.ts`, `transaction.ts`, `user.ts`) exported in `types/index.ts`.
   - Infrastructure (`lib/`) -> Core auth, prisma, errors, formatters, and utilities (`lib/utils/`).

2. **Crucial Constraints**:
   - Never mutate global variables in server files (SSR pollution).
   - Never disable Better Auth origin checking (`disableOriginCheck` must stay disabled).
   - Use `getServerSession()` instead of `getUserSession()` in API routes and Server Actions to prevent unwanted redirects.
   - Always run `npm run typecheck` to verify complete type safety.
   - Maintain naming conventions: kebab-case for files, PascalCase for types, camelCase for functions, UPPER_SNAKE_CASE for constants.

3. **PostgreSQL & Database Standards**:
   - Tables: `snake_case` (e.g. `app_config`, mapped with `@@map`).
   - Columns: `snake_case` (e.g. `created_at`, mapped with `@map`).
   - Primary Keys: `id`.
   - Foreign Keys: `{referenced_table}_id` (e.g. `user_id`).
   - Booleans: `is_` / `has_` prefix (e.g. `is_active`).
   - Timestamps: `_at` suffix (e.g. `updated_at`, `created_at`).
   - Date-only: `_date` suffix (e.g. `birth_date`).
   - Indexes: `idx_{table}_{columns}` (e.g. `idx_users_email`).
   - Unique Constraints: `uq_{table}_{columns}` (e.g. `uq_users_email`).
   - Foreign Key Constraints: `fk_{table}_{column}` (e.g. `fk_transactions_user_id`).
