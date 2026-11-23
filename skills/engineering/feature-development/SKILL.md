---
name: feature-development
description: Implement a new user-visible capability end-to-end across database schema, backend domain logic, API/GraphQL codegen, frontend UI, automated tests, and domain documentation/ADRs using the staged atomic commit pipeline and pre-promotion verification gates. Make sure to use this skill whenever building a new feature, endpoint, UI flow, or multi-layer capability.
---

# End-to-End Feature Development Workflow

## Purpose

Deliver new capabilities across one or more architectural layers while keeping domain vocabulary (`GLOSSARY.md`), database schemas, backend services, generated API/client types, frontend UI, automated tests, and documentation synchronized at every commit boundary.

---

## 1. Pre-Flight & Domain Alignment

### Step 0: Pre-Flight Branch Gate ([`/git-branching`](../git-branching/SKILL.md))
Before modifying any file:
1. Run the **Repository State Gate** and **Clean Working Tree Gate** in [`/git-branching`](../git-branching/SKILL.md).
2. Synchronize local `main` (`git fetch origin main && git checkout main && git merge --ff-only origin/main`).
3. Cut a canonical `feature/<topic>` branch from verified local `main` (`git checkout -b feature/<topic> main`), assert `<branch>@{upstream}` does not resolve, and record the **Drift Baseline** (`git rev-parse HEAD`).

### Step 1: Domain Vocabulary & Spec Alignment
1. Read `GLOSSARY.md` (or `GLOSSARY-MAP.md` as described in `docs/agents/domain.md`) and relevant `docs/adr/` records so new models, endpoints, and UI labels use canonical ubiquitous language.
2. Read `CODING_STANDARDS.md`, `REVIEW.md` (from `origin/main`), and `docs/agents/stack.md` / `docs/agents/commit-pipeline.md` (created by [`/setup-rblf-skills`](../setup-rblf-skills/SKILL.md)) to confirm layer boundaries and execution commands.

---

## 2. Layered Implementation & Staged Atomic Commit Pipeline

Build and validate the feature in strict dependency order, committing each layer atomically via [`/conventional-commits`](../conventional-commits/SKILL.md) (skipping any stage not touched by the feature):

### Stage 1: Database Schema & Backend Domain Logic
1. **Schema Evolution** (if persistent data changes):
   - Apply schema edits and generate/inspect the SQL migration following [`/database-migration`](../database-migration/SKILL.md).
2. **Backend Domain, Services & Controllers/Resolvers**:
   - Implement business logic behind clean module boundaries with proper authentication/authorization guards and transaction handling.
3. **Backend Automated Specs** ([`/testing`](../testing/SKILL.md)):
   - Write unit and integration specs covering happy paths, authorization boundaries, and edge cases.
   - Perform **"Check the Check"** (confirm tests fail when core feature logic is inverted/removed) and run the backend test gate:
     ```bash
     # Dockerized example:
     docker compose run --rm api bun test src/<module>/<file>.spec.ts
     docker compose run --rm api bun run test
     # Host example:
     pnpm --filter api test
     ```
4. **Stage 1 Commit**:
   ```bash
   git add <backend-and-migration-files>
   git commit -m "feat(<api-or-domain>): <imperative summary>"
   ```

### Stage 2: Backend Generated Artifacts (If Applicable)
1. Regenerate ORM clients and API/GraphQL schemas (e.g., `schema.gql` / `openapi.json`) following [`/graphql-codegen`](../graphql-codegen/SKILL.md).
2. Verify zero manual edits in generated directories and run the Stage 2 gate:
   ```bash
   # Dockerized example:
   docker compose run --rm api bun run generate:dev
   ```
3. **Stage 2 Commit**:
   ```bash
   git add <generated-backend-files>
   git commit -m "chore(<api>): update generated schema and client artifacts"
   ```

### Stage 3: Frontend UI, State & Client Operations (If Full-Stack / UI Feature)
1. Implement UI components, routes, and client query/mutation documents following the repository's design system and accessibility standards.
2. Add or update frontend unit specs and Playwright E2E browser specs ([`/testing`](../testing/SKILL.md)) with `retries: 0` and zero `waitForTimeout` sleeps.
3. Run the Stage 3 validation gate (format, lint, typecheck, and design audit if configured):
   ```bash
   # Dockerized example:
   docker compose run --rm web bun run prettier
   docker compose run --rm web bun run typecheck
   ```
4. **Stage 3 Commit**:
   ```bash
   git add <frontend-source-and-test-files>
   git commit -m "feat(<web-or-ui-domain>): <imperative summary>"
   ```

### Stage 4: Frontend Generated Client Types (If Applicable)
1. Run client codegen against the updated Stage 2 schema following [`/graphql-codegen`](../graphql-codegen/SKILL.md), then re-run frontend typechecking:
   ```bash
   # Dockerized example:
   docker compose run --rm web bun run codegen
   docker compose run --rm web bun run typecheck
   ```
2. **Stage 4 Commit**:
   ```bash
   git add <generated-frontend-files>
   git commit -m "chore(<web>): update generated graphql types"
   ```

### Stage 5: Documentation, Glossary & ADR Records ([`/documentation-update`](../documentation-update/SKILL.md))
1. Update `GLOSSARY.md` if new domain concepts were introduced.
2. Record an ADR in `docs/adr/` if the feature required a hard-to-reverse architectural trade-off or changed environment variables, commands, or domain boundaries.
3. Run documentation link/consistency checks (`python3 scripts/check-docs.py` if present) and commit:
   ```bash
   git add <docs-glossary-adr-files>
   git commit -m "docs(adr): record ADR for <feature>"
   ```

---

## 3. Pre-Promotion Verification & Promotion

1. **Full Verification Pipeline**: Run [`/verify`](../verify/SKILL.md) across the clean tree on `HEAD`:
   - Static & integrity gates
   - Full unit/integration test suites
   - Stack readiness smoke probes (`verify-smoke.mjs`)
   - End-to-end Playwright suite (`retries: 0`)
   - Cold [`/code-review`](../code-review/SKILL.md) against `origin/main` under the **3-Round Fix Cap**
2. **In-Flight Trunk Sync**: If `origin/main` advanced while building the feature, sync via `git pull --no-rebase origin main` (never rebase) and re-run `/verify`.
3. **Push & Promote**: Follow [`/git-branching`](../git-branching/SKILL.md) Step 8 to push `origin/feature/<topic>` and either ask user confirmation to merge `--no-ff` into `develop` (two-branch topology) or format a Pull Request via [`/pr`](../pr/SKILL.md) (single-trunk topology).
