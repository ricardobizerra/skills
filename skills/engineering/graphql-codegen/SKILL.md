---
name: graphql-codegen
description: Synchronize backend GraphQL schemas (code-first NestJS/Pothos/Nexus or schema-first), generated backend/ORM types, frontend GraphQL documents (queries, mutations, subscriptions, fragments), and generated client artifacts (GraphQL Code Generator, Apollo Client, Relay, gql.tada). Make sure to use this skill whenever Prisma/ORM models, backend GraphQL resolvers/types/inputs, or frontend GraphQL operations change, or when generated GraphQL type errors appear.
---

# GraphQL Schema & Client Codegen Synchronization Skill

## Purpose

Maintain lockstep type safety between the backend GraphQL schema and frontend client operations across the repository, enforcing the **Generated Files Invariant**: generated schema and client artifact files are strictly build outputs and must **never** be hand-edited.

---

## When To Use vs. When Not To Use

- **Use whenever**:
  - Database / ORM models exposed via GraphQL change.
  - Backend GraphQL resolvers, object types, input types, enums, or scalars change.
  - Frontend GraphQL query, mutation, subscription, or fragment definitions are added or modified.
  - TypeScript reports missing or mismatched types in generated GraphQL imports.
- **Do not use for**:
  - Pure UI/styling changes or internal backend logic changes that do not alter the GraphQL schema or client documents.

---

## 1. Discover Codegen Architecture & Commands

1. **Read Harness Config**: Check `docs/agents/stack.md` and `docs/agents/commit-pipeline.md` (created by [`/setup-rblf-skills`](../setup-rblf-skills/SKILL.md)).
2. **Auto-Detection Fallback**:
   - Inspect `docker-compose.yml` (if application services exist, run all commands inside Docker via `docker compose run --rm <service> ...`).
   - Inspect root and workspace `package.json` scripts for backend schema generation (`generate:dev`, `schema:generate`, `prisma:generate`, `codegen:api`) and frontend client codegen (`codegen`, `graphql-codegen`, `gql:generate`).
   - Locate the canonical emitted schema artifact (e.g., `api/src/lib/graphql/schema.gql`, `schema.graphql`, or `packages/schema/schema.graphql`) and the generated client directory (e.g., `web/src/graphql/`, `src/gql/`, `src/__generated__/`).

---

## 2. Dual-Stage Synchronization Workflow

In a full-stack GraphQL repository, client codegen reads the schema emitted by the backend. **Always run Stage A (Backend) before Stage B (Frontend)** whenever the backend schema changed.

### Stage A: Backend Schema & ORM Type Emission
Skip Stage A only if the backend schema (`schema.gql` / `schema.graphql`) is already up to date and only frontend GraphQL operations changed.

1. Run the backend schema & ORM generator from the repository root:
   ```bash
   # Dockerized example:
   docker compose run --rm api bun run generate:dev

   # Host monorepo / package example:
   pnpm --filter api run generate:dev   # or npm run codegen:api
   ```
2. Inspect `git diff` on the emitted schema file (`schema.gql` / `schema.graphql`) to confirm that field names, nullability (`!` vs. nullable), input types, and descriptions match the intended API contract.

### Stage B: Frontend / Consumer Client Artifact Generation
1. Ensure all modified frontend queries, mutations, subscriptions, and fragments have unique operation/fragment names and select all required cache identity fields (`id` / `keyFields`).
2. Run the frontend GraphQL codegen command:
   ```bash
   # Dockerized example:
   docker compose run --rm web bun run codegen

   # Host example:
   pnpm --filter web run codegen   # or npm run codegen / yarn codegen
   ```
   *(Note: Properly configured client codegen reads the local emitted `schema.gql` file on disk so the backend server does not need to be booted just to generate client types.)*
3. Inspect `git diff` in the generated client directory to verify the expected hooks/types were produced.

---

## 3. Validation & Staged Atomic Commit Ordering

1. **Validate Compilability**:
   - If backend changed: run backend build/typecheck (`docker compose run --rm api bun run build` or `typecheck`).
   - If frontend changed: run frontend typecheck (`docker compose run --rm web bun run typecheck`).
   - Confirm **zero manual edits** were made inside generated directories.
2. **Staged Atomic Commits ([`/conventional-commits`](../conventional-commits/SKILL.md))**:
   Keep human-authored logic separate from generated artifacts so reviewers can read the real diff cleanly:
   - **Stage 1**: Backend resolver/model/input source changes → `feat(api/<domain>): ...`
   - **Stage 2**: Generated backend schema (`schema.gql`) and ORM client exports → `chore(api): update generated schema and client artifacts`
   - **Stage 3**: Frontend UI and `.graphql` / `gql` operation changes → `feat(web/<domain>): ...`
   - **Stage 4**: Generated frontend GraphQL types/hooks → `chore(web): update generated graphql types`

---

## 4. Recovery Guidance

- **Frontend codegen fails with `"Cannot query field X on type Y"`**:
  - The local `schema.gql` / `schema.graphql` file is stale. Run **Stage A** (backend schema generation) first, verify `field X` appears in `schema.gql`, and then re-run **Stage B**.
- **Frontend codegen fails because `schema.gql` is missing**:
  - Run Stage A to emit the schema file before running Stage B.
- **Breaking Field Removal / Rename**:
  - If removing or renaming a backend field breaks frontend codegen, update the frontend GraphQL operations in Stage 3 before running Stage 4 codegen.
- **Unexplained formatting churn across hundreds of generated files**:
  - Verify that the generator ran inside the canonical container/toolchain (`docker compose run --rm ...`) so Node/formatter versions match CI.
