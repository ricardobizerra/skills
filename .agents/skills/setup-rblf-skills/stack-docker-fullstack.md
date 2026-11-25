# Stack Adapter: Dockerized Full-Stack (API + Web + ORM + Codegen)

Loaded lazily by `/setup-rblf-skills` when `docker-compose.yml` (or `compose.yaml`) is present alongside backend (`api/`), frontend (`web/`), ORM (Prisma/Drizzle/TypeORM), or GraphQL/OpenAPI codegen signals.

---

## 1. Template for `docs/agents/stack.md`

```markdown
# Stack & Execution Environment

## Execution Runner
- **Mode**: Dockerized (`docker compose`)
- **Rule**: Always run build, test, migration, and codegen commands inside Docker containers from the repository root.
- **Worktree Support**: If `.worktree.json` is present or a worktree helper script exists (e.g., `bun run wt`), route service execution through the worktree wrapper rather than running a bare `docker compose up` inside a secondary worktree.

## Service & Tooling Matrix
- **Backend Service (`api`)**: `docker compose run --rm api <command>`
- **Frontend Service (`web`)**: `docker compose run --rm web <command>`
- **E2E Service (`e2e`)**: `docker compose --profile e2e run --rm --no-deps -e CI=true e2e <command>`
- **Infrastructure**: `docker compose up -d postgres redis`

## Schema & Codegen Commands
- **Database Migration (Dev)**: `docker compose run --rm api bun run migration:dev`
- **Backend Artifact Codegen**: `docker compose run --rm api bun run generate:dev`
- **Frontend GraphQL/API Codegen**: `docker compose run --rm web bun run codegen`
- **Generated Paths (Never Hand-Edit)**:
  - `api/src/lib/graphql/prisma-client/`
  - `api/src/lib/graphql/schema.gql`
  - `web/src/graphql/`
```

*(Adapt `bun` to `npm` / `pnpm` / `yarn` and adjust paths to match the target repository's `package.json` scripts.)*

---

## 2. Template for `docs/agents/commit-pipeline.md`

```markdown
# Staged Atomic Commit Pipeline

Multi-layer changes must never be bundled into a single commit. Stage, validate, and commit sequentially across these 5 stages (skipping any stage that has no modified files):

| Stage | Scope & Files | Commit Prefix Example | Pre-Commit Validation Gate |
| :--- | :--- | :--- | :--- |
| **Stage 1: Backend Logic & Schema** | `api/src/**`, `api/prisma/**` (excluding generated dirs) | `feat(api/<domain>): ...` or `fix(api/<domain>): ...` | `docker compose run --rm api bun run test` (plus `migration:dev` if schema changed) |
| **Stage 2: Backend Generated Artifacts** | `api/src/lib/graphql/prisma-client/**`, `schema.gql` | `chore(api): update generated schema and client artifacts` | `docker compose run --rm api bun run generate:dev` |
| **Stage 3: Frontend UI & Operations** | `web/src/**` (excluding generated dirs) | `feat(web/<domain>): ...` or `fix(web/<domain>): ...` | `docker compose run --rm web bun run prettier && docker compose run --rm web bun run typecheck` |
| **Stage 4: Frontend Generated Artifacts** | `web/src/graphql/**` | `chore(web): update generated graphql types` | `docker compose run --rm web bun run codegen && docker compose run --rm web bun run typecheck` |
| **Stage 5: Documentation & ADRs** | `docs/**`, `GLOSSARY.md`, `AGENTS.md`, `.agents/**` | `docs(adr): ...` or `docs: ...` | Verify relative markdown links resolve (`python3 scripts/check-docs.py` if present) |
```

---

## 3. Template for `docs/agents/verification.md`

```markdown
# Verification & Review Governance

## Verification Gates (`/verify`)
1. **Static & Integrity Gates**:
   - `docker compose run --rm api bun run lint` / `typecheck`
   - `docker compose run --rm web bun run typecheck` / `prettier`
2. **Backend Unit & Integration Suite**:
   - `docker compose run --rm api bun run test`
   - `docker compose run --rm api bun run test:e2e`
3. **Stack Readiness & Smoke Probe**:
   - Boot stack: `docker compose up -d postgres redis api web`
   - Probe: `node .agents/skills/verify/scripts/verify-smoke.mjs` (or configured `--url` / `--graphql-url`)
4. **End-to-End Browser Suite (Zero Retries)**:
   - `docker compose --profile e2e run --rm --no-deps -e CI=true e2e bun run test:e2e`

## Immutable Default-Branch Review Policy (`/code-review`)
- **Default Branch**: `origin/main`
- **Immutable Standards Files**: Load `REVIEW.md` and `CODING_STANDARDS.md` via `git show origin/main:<file>` when present.
- **Protected Verification Paths**:
  - `REVIEW.md`, `CODING_STANDARDS.md`, `AGENTS.md`
  - `.github/**`, `.githooks/**`, `docker-compose.yml`, `**/Dockerfile*`
  - `web/playwright.config.*`, `**/vitest.config.*`, `**/.eslintrc*`, `**/eslint.config.*`, `**/tsconfig*.json`
  - `.agents/skills/{verify,code-review,testing,pr,git-branching,conventional-commits}/**`
- **Zero-Flakiness Rules**: `retries: 0`, zero `.skip`/`.only`/`.todo`, zero arbitrary `sleep`/`waitForTimeout`, "Check the Check" failure verification, and a strict **3-Round Fix Cap**.
```

---

## 4. Template for `docs/agents/git-workflow.md`

```markdown
# Git Workflow & Branching Topology

- **Trunk Branch**: `main` (never edit, commit, or push directly on `main`, except the enumerated production hotfix cherry-pick from a release tag).
- **Integration Branch**: `develop` (or `none` if single-trunk).
  - When `develop` is active: validated topic branches push to `origin/<prefix>/<slug>` and merge into `develop` via `git merge --no-ff <branch>` only after explicit user confirmation.
  - When single-trunk: validated topic branches push to `origin/<prefix>/<slug>` and open PRs targeting `main`.
- **Branch Creation**: Always `git fetch origin main && git checkout main && git merge --ff-only origin/main && git checkout -b <prefix>/<slug> main`. Assert no upstream tracks `main` or `develop`.
- **In-Flight Sync**: `git pull --no-rebase origin main` (never rebase published topic branches, never force-push, and never merge `develop` into a topic branch).
- **Canonical Prefixes**: `feature/`, `fix/`, `chore/`, `refactor/`, `docs/`, `test/`, `perf/`.
```
