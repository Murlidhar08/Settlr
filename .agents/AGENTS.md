# Workspace Coding Standards & Architectural Invariants

This workspace is governed by the architectural standards defined in `AGENTS.md` and `ARCHITECTURE.md`.

## Core Guidelines for Antigravity AI Agents:
1. **Layered Architecture**:
   - UI (`components/`, `app/`) -> Presentation only.
   - Business Hooks (`hooks/`) -> Filtering, searching, multi-step orchestration.
   - Server State (`hooks/queries/`) -> TanStack React Query v5 with centralized keys in `hooks/queries/keys.ts`.
   - Server Actions (`actions/`) -> Secure mutations using `safeAction`.
   - APIs (`app/api/`) -> Standardized with `apiSuccess` / `apiError` and `createApiHandler`.
   - Infrastructure (`lib/`) -> Core auth, prisma, errors, formatters, and utilities.

2. **Crucial Constraints**:
   - Never mutate global variables in server files (SSR pollution).
   - Never disable Better Auth origin checking (`disableOriginCheck` must stay disabled).
   - Use `getServerSession()` instead of `getUserSession()` in API routes and Server Actions to prevent unwanted redirects.
   - Always run `npm run typecheck` to verify complete type safety.
   - Maintain naming conventions: kebab-case for files, PascalCase for types, camelCase for functions, UPPER_SNAKE_CASE for constants.
