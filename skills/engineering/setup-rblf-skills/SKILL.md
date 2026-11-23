---
name: setup-rblf-skills
description: "Configure a repository for the ricardobizerra/skills engineering workflow: discover its stack, load the matching stack adapter lazily, and scaffold modular docs/agents/*.md files (git-workflow, commit-pipeline, verification, stack, issue-tracker, domain) plus AGENTS.md/CLAUDE.md pointers. Run once before first use of the other engineering skills."
disable-model-invocation: true
---

# Setup RBLF Skills

Scaffold the per-repository **Harness Config** (`docs/agents/*.md`) that the engineering skills in `ricardobizerra/skills` consume:

- **Git Workflow (`docs/agents/git-workflow.md`)**: trunk branch (`main`), optional integration branch (`develop`), canonical branch prefixes, and sync rules (`--no-rebase`).
- **Commit Pipeline (`docs/agents/commit-pipeline.md`)**: ordered atomic commit stages and the pre-commit validation command for each stage.
- **Verification & Review (`docs/agents/verification.md`)**: static gates, unit/E2E test commands, smoke probe endpoints, Protected Verification Paths, and Default-Branch Review Immutability files (`REVIEW.md`, `CODING_STANDARDS.md`).
- **Stack & Execution Runner (`docs/agents/stack.md`)**: whether commands run via `docker compose` or directly on the host, plus ORM/migration and codegen commands.
- **Issue Tracker & Domain Docs (`docs/agents/issue-tracker.md`, `docs/agents/domain.md`)**: where issues/tickets live and how `GLOSSARY.md` + `docs/adr/` are organized (compatible with `mattpocock/skills`; skipped if already configured).

This is an interactive, discovery-driven skill. Explore the repository first, load **only** the single matching **Stack Adapter** file, present your proposed configuration with recommended defaults, and write the files after user confirmation.

---

## Process

### 1. Explore the Repository

Inspect the workspace without making assumptions. Find facts yourself rather than asking the user for things visible in the filesystem:

- **Git & Remotes**:
  - `git remote -v` and `git branch -a`: What is the default trunk branch (`main` or `master`)? Does an intermediate integration branch (`develop`) exist on `origin` or locally?
- **Existing Agent Docs**:
  - Do `AGENTS.md` or `CLAUDE.md` exist at the root?
  - Does `docs/agents/` already exist? (If `docs/agents/issue-tracker.md` or `docs/agents/domain.md` already exist from `/setup-matt-pocock-skills`, preserve them!)
  - Do `REVIEW.md`, `CODING_STANDARDS.md`, `GLOSSARY.md`, `GLOSSARY-MAP.md`, or `docs/adr/` exist?
- **Execution Environment & Stack Signals**:
  - Containerization: `docker-compose.yml`, `docker-compose.yaml`, `compose.yaml`, `Dockerfile`, `.worktree.json`
  - Node / TypeScript / Bun / Monorepo: `package.json`, `bun.lock`, `pnpm-workspace.yaml`, `turbo.json`
  - Python: `pyproject.toml`, `requirements.txt`, `alembic.ini`, `manage.py`
  - Database & Codegen: `prisma/schema.prisma`, `drizzle.config.*`, `codegen.ts`, `schema.gql` / `schema.graphql`
  - E2E & Verification scripts: `playwright.config.*`, `vitest.config.*`, `scripts/ci-gates.sh`, `scripts/check-*.mjs`

### 2. Lazily Load ONE Stack Adapter

To keep your context window lean, **do not read all stack adapter files**. Based on the signals found in Step 1, read **only the one adapter** that best matches the repository:

| Detected Repository Signals | Auxiliary Stack Adapter to Read |
| :--- | :--- |
| `docker-compose.yml` + full-stack services (`api`/`web`, ORM like Prisma/Drizzle, or GraphQL codegen) | [`stack-docker-fullstack.md`](./stack-docker-fullstack.md) |
| `package.json` (Bun, pnpm, npm, or Yarn; TypeScript/JavaScript app or monorepo without mandatory Docker execution) | [`stack-node-ts.md`](./stack-node-ts.md) |
| `pyproject.toml`, `requirements.txt`, FastAPI, Django, Flask, or Pytest/Alembic | [`stack-python.md`](./stack-python.md) |
| Go, Rust, Ruby, Java, polyglot, or custom Makefile/shell scripts | [`stack-generic.md`](./stack-generic.md) |

Use the loaded adapter's recommended stages, gate commands, and protected paths to populate your proposal in Step 3.

### 3. Present Findings & Confirm Sections

Summarize what you detected in a compact table, then present the configuration sections below. Lead every question with your **recommended answer** based on repo exploration so the user can accept the whole proposal in one reply.

#### Section A: Git Workflow & Promotion Topology (`docs/agents/git-workflow.md`)
- **Trunk branch**: `main` (or detected default branch).
- **Promotion topology**:
  - **Two-branch (`main` + `develop`)**: recommended if `origin/develop` exists or the team batches features into releases. Topic branches cut from verified local `main`, sync via `git pull --no-rebase origin main`, push to `origin/<prefix>/<slug>`, and merge `--no-ff` into `develop` upon user confirmation.
  - **Single-trunk (`main` only)**: recommended for standard repos without a `develop` branch. Topic branches cut from verified local `main`, sync via `git pull --no-rebase origin main`, push to `origin/<prefix>/<slug>`, and open PRs targeting `main`.
- **Canonical prefixes**: `feature/`, `fix/`, `chore/`, `refactor/`, `docs/`, `test/`, `perf/`.

#### Section B: Staged Atomic Commit Pipeline (`docs/agents/commit-pipeline.md`)
Propose the ordered commit stages from your loaded **Stack Adapter** (e.g., 5-stage for full-stack with codegen, 3-stage for backend/frontend without codegen, or 3-stage for single-package apps: 1. Implementation & Tests → 2. Generated Artifacts/Migrations → 3. Docs & ADRs), along with the exact pre-commit validation command for each stage.

#### Section C: Verification Gates, Smoke Probes & Protected Paths (`docs/agents/verification.md` & `docs/agents/stack.md`)
Propose:
1. **Execution Runner**: Dockerized (`docker compose run --rm <service> ...`) whenever `docker-compose.yml` defines application services, or Host CLI otherwise.
2. **Gate Commands**: Static (lint, typecheck, format), Unit/Integration tests, Smoke probe URLs/ports (for `verify-smoke.mjs` or `.smoke.json`), and E2E suite command (`retries: 0`).
3. **Immutable Review Standards**: Which files on `origin/<trunk>` hold coding standards and review policy (e.g., `CODING_STANDARDS.md`, `REVIEW.md`, `CONTRIBUTING.md`).
4. **Protected Verification Paths**: List of CI, linter, test config, and verification skill paths in this repo that require human sign-off.

#### Section D: Issue Tracker & Domain Docs (`docs/agents/issue-tracker.md` & `docs/agents/domain.md`)
- If `docs/agents/issue-tracker.md` and `docs/agents/domain.md` already exist, report that they are already configured and skip asking.
- Otherwise, propose the issue tracker based on `git remote -v` (**GitHub** via `gh`, **GitLab** via `glab`, **Linear**, or **Local markdown** under `.scratch/`) and domain layout (**single-context** `GLOSSARY.md` + `docs/adr/` at root, or **multi-context** `GLOSSARY-MAP.md` if monorepo packages have distinct domain contexts). Use these templates when writing:
  - [`issue-tracker-github.md`](./issue-tracker-github.md)
  - [`issue-tracker-gitlab.md`](./issue-tracker-gitlab.md)
  - [`issue-tracker-local.md`](./issue-tracker-local.md)
  - [`domain.md`](./domain.md)

### 4. Write the Configuration Files

Once the user confirms (or provides adjustments):

1. **Write `docs/agents/git-workflow.md`**, **`docs/agents/commit-pipeline.md`**, **`docs/agents/verification.md`**, and **`docs/agents/stack.md`** (plus `docs/agents/issue-tracker.md` and `docs/agents/domain.md` if not already present).
2. **Update the Root Steering File (`CLAUDE.md` or `AGENTS.md`)**:
   - If `CLAUDE.md` exists, edit it; else if `AGENTS.md` exists, edit it; if neither exists, ask which one to create (defaulting to `AGENTS.md`).
   - Keep the root steering file concise (<50 lines total) so it respects **Progressive Disclosure**.
   - Add or update the `## Agent skills` section in-place without clobbering existing rules:

```markdown
## Agent skills

### Git workflow & branching
[One-line summary: e.g., "Topic branches cut from verified local main, synced via --no-rebase, promoted via develop/main"]. See `docs/agents/git-workflow.md`.

### Commit pipeline & gates
[One-line summary: e.g., "N-stage Conventional Commits pipeline with per-layer validation gates"]. See `docs/agents/commit-pipeline.md`.

### Verification & review immutability
[One-line summary: e.g., "Zero-flakiness verification gates and cold code-review against origin/main"]. See `docs/agents/verification.md` and `docs/agents/stack.md`.

### Issue tracker & domain docs
[One-line summary of tracker and single/multi-context glossary]. See `docs/agents/issue-tracker.md` and `docs/agents/domain.md`.
```

### 5. Done

Report the created/updated files under `docs/agents/` and remind the user that all `ricardobizerra/skills` workflows (`/git-branching`, `/conventional-commits`, `/verify`, `/code-review`, `/pr`, `/testing`, `/bug-fix`, `/feature-development`, `/database-migration`, `/graphql-codegen`, `/documentation-update`) will now automatically enforce this configuration.
