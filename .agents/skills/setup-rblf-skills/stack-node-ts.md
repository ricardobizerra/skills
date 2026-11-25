# Stack Adapter: Node / TypeScript / Bun (Monorepo or Single Package)

Loaded lazily by `/setup-rblf-skills` when `package.json` is present (`bun`, `pnpm`, `yarn`, or `npm`) and commands run directly on the host (no application service containers in `docker-compose.yml`).

---

## 1. Template for `docs/agents/stack.md`

```markdown
# Stack & Execution Environment

## Execution Runner
- **Mode**: Host CLI (`<bun|pnpm|npm|yarn>`)
- **Workspace Layout**: `<monorepo (workspaces) | single-package>`
- **Database / Backing Services**: `<docker compose up -d postgres | local | none>`

## Command Matrix
- **Install**: `<bun install | pnpm install | npm ci>`
- **Typecheck**: `<bun run typecheck | pnpm -r typecheck>`
- **Lint & Format**: `<bun run lint && bun run format:check>`
- **Unit / Integration Tests**: `<bun test | pnpm test>`
- **E2E Tests**: `<npx playwright test | pnpm test:e2e>`
- **Schema / Codegen** (if applicable): `<bun run codegen | npx prisma generate>`
```

---

## 2. Template for `docs/agents/commit-pipeline.md`

For a monorepo with backend/frontend or codegen, use up to 5 stages; for a single-package app or library without codegen, collapse to 3 stages:

```markdown
# Staged Atomic Commit Pipeline

Stage, validate, and commit changes in dependency order (skipping stages with no modified files):

| Stage | Scope & Files | Commit Prefix Example | Pre-Commit Validation Gate |
| :--- | :--- | :--- | :--- |
| **Stage 1: Core / Backend / Domain Logic & Tests** | `src/**`, `packages/core/**`, `api/**` | `feat(<scope>): ...` or `fix(<scope>): ...` | `<bun run typecheck && bun test>` |
| **Stage 2: Generated Artifacts / Migrations** (if applicable) | `prisma/**`, `src/generated/**`, `schema.gql` | `chore(<scope>): update generated artifacts` | `<bun run codegen && bun run typecheck>` |
| **Stage 3: UI / Consumer Layer** (if monorepo/fullstack) | `web/**`, `apps/**`, `src/components/**` | `feat(web/<scope>): ...` or `fix(web/<scope>): ...` | `<bun run lint && bun run typecheck>` |
| **Stage 4: Documentation & ADRs** | `docs/**`, `README.md`, `GLOSSARY.md`, `AGENTS.md` | `docs(adr): ...` or `docs: ...` | Verify all relative markdown links resolve |
```

---

## 3. Template for `docs/agents/verification.md`

```markdown
# Verification & Review Governance

## Verification Gates (`/verify`)
1. **Static Gates**: `<bun run lint && bun run typecheck && bun run build>`
2. **Unit & Integration Suite**: `<bun test>`
3. **Smoke Probe** (if web/API server): `node .agents/skills/verify/scripts/verify-smoke.mjs --url http://localhost:3000`
4. **End-to-End Suite (Zero Retries)**: `<npx playwright test --retries=0>` (if E2E configured)

## Immutable Default-Branch Review Policy (`/code-review`)
- **Default Branch**: `origin/main`
- **Immutable Standards Files**: Read `REVIEW.md`, `CODING_STANDARDS.md`, or `CONTRIBUTING.md` from `origin/main` via `git show origin/main:<file>` when present.
- **Protected Verification Paths**:
  - `REVIEW.md`, `CODING_STANDARDS.md`, `AGENTS.md`, `CLAUDE.md`
  - `.github/**`, `.husky/**`, `.githooks/**`
  - `playwright.config.*`, `vitest.config.*`, `jest.config.*`, `eslint.config.*`, `tsconfig*.json`
  - `.agents/skills/{verify,code-review,testing,pr,git-branching,conventional-commits}/**`
- **Zero-Flakiness Rules**: `retries: 0`, zero `.skip`/`.only`/`.todo`, zero arbitrary `sleep`/`waitForTimeout`, "Check the Check" failure verification, and a strict **3-Round Fix Cap**.
```

---

## 4. Template for `docs/agents/git-workflow.md`

```markdown
# Git Workflow & Branching Topology

- **Trunk Branch**: `main` (never edit, commit, or push directly on `main`).
- **Integration Branch**: `<develop | none (single-trunk)>`
- **Branch Creation**: `git fetch origin main && git checkout main && git merge --ff-only origin/main && git checkout -b <prefix>/<slug> main`. Assert `<branch>@{upstream}` does not resolve.
- **In-Flight Sync**: `git pull --no-rebase origin main` (never rebase published branches, never force-push).
- **Canonical Prefixes**: `feature/`, `fix/`, `chore/`, `refactor/`, `docs/`, `test/`, `perf/`.
```
