---
name: conventional-commits
description: Format commit messages using Conventional Commits (v1.0.0), stage multi-layer changes through an ordered N-stage atomic commit pipeline, execute pre-commit validation gates per layer, and align commit messages with branch and PR naming conventions. Make sure to use this skill whenever the user or task mentions git commits, writing commit messages, staging changes, breaking work into atomic commits, or formatting git history.
---

# Conventional Commits & Staged Atomic Workflow

## Purpose

Maintain a clean, bisect-safe, and self-describing Git history across any repository by enforcing **Conventional Commits (v1.0.0)**, clear architectural scoping, and a strictly gated **Staged Atomic Pipeline** where every commit compiles and passes its layer's validation checks independently.

---

## Commit Message Format

```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

### 1. Canonical Types (10)

- `feat`: A new user-visible feature, endpoint, or domain capability.
- `fix`: A bug fix or unintended behavior correction.
- `docs`: Documentation, `README.md`, `GLOSSARY.md`, `AGENTS.md`, or ADR updates.
- `chore`: Code generation artifacts, dependency upgrades, or build/tooling maintenance.
- `refactor`: Structural code changes that neither fix a bug nor add a feature.
- `test`: Adding missing tests or correcting existing specs.
- `perf`: A code change that improves performance or reduces memory/query overhead.
- `style`: Formatting, design token alignment, or whitespace changes without logic impact.
- `ci`: CI/CD workflow files, runner scripts, and automation pipelines.
- `revert`: Reverting a previous commit.

### 2. Scopes

Check `docs/agents/commit-pipeline.md` (if created by [`/setup-rblf-skills`](../setup-rblf-skills/SKILL.md)) or `git log -n 30 --oneline` for the repository's established scope taxonomy:

- **Hierarchical Domain Scopes (`<package>/<domain>`)** in monorepos or full-stack repositories: e.g., `api/billing`, `web/checkout`, `api/auth`, `web/dashboard`, `docs/adr`.
- **Package / Layer Scopes (`<package>`)** for cross-domain or package-wide changes: e.g., `api`, `web`, `core`, `db`, `docker`, `root`, `agents`.
- **Single-Package Repos**: use the domain module name (e.g., `auth`, `orders`, `cli`, `adr`).

### 3. Subject Line Rules

Why these rules matter: consistent subject lines allow automated changelog generation, `git log --grep` filtering, and instant human scanning during `git bisect`.

- **Imperative mood**: write `add`, `implement`, `fix`, `prevent`, `remove`, `align` (never `added`, `adds`, or `fixing`).
- **Lowercase starting letter** immediately after `<type>(<scope>): `.
- **No trailing period (`.`)**.
- **Strictly English** (even if the application's UI or domain strings use another language).
- **Concise**: aim for ≤ 72 characters on the subject line; put rationale or multi-item details in the optional body.

---

## The Adaptive N-Stage Atomic Commit Pipeline

When a feature, bug fix, or refactor touches multiple architectural layers or generated files, **never bundle everything into a single monolithic commit**. A monolithic commit mixes human-authored logic with noisy codegen output and breaks `git bisect` when intermediate states fail to compile.

### Configuration Discovery (`docs/agents/commit-pipeline.md`)

1. If `docs/agents/commit-pipeline.md` exists, use its configured stages and pre-commit validation gate commands.
2. Otherwise, classify all modified/untracked files (`git status -s`) into the canonical 5-stage dependency order below, **skipping any stage that has zero modified files**:

```
Stage 1: Backend / Core Domain & Schema      -> feat(<api-or-domain>) or fix(<api-or-domain>)
Stage 2: Backend / Schema Generated Files    -> chore(<api-or-db>): update generated schema and client artifacts
Stage 3: Frontend / Consumer UI & Operations -> feat(<web-or-app>) or fix(<web-or-app>)
Stage 4: Frontend / Client Generated Files   -> chore(<web-or-client>): update generated client types
Stage 5: Documentation, ADRs & Agent Config  -> docs(adr): record ADR ... or docs: update ...
```

*(Why this exact order? Stage 1 defines the source-of-truth schema/resolvers; Stage 2 emits the schema/ORM artifacts that Stage 3 imports; Stage 3 authors the frontend operations that Stage 4 compiles into typed hooks; Stage 5 documents the completed behavior.)*

---

## Pre-Commit Validation Gates

Every stage must pass its layer's validation gate **before** running `git commit`. Check `docs/agents/commit-pipeline.md` and `docs/agents/stack.md` first; if not present, check whether `docker-compose.yml` defines application services (run via `docker compose run --rm <service> ...`) or run via the host package manager (`bun`, `pnpm`, `npm`, `uv`, `pytest`, `cargo`, `go`):

### Stage 1 Gate (Backend / Core Domain Logic & Schema)
- Run backend unit/integration tests and typecheck/lint (e.g., `docker compose run --rm api bun run test` or `pnpm --filter api test`).
- If a database schema/migration was added or modified, run the migration verification step (see [`/database-migration`](../database-migration/SKILL.md)).

### Stage 2 Gate (Backend / Schema Generated Artifacts)
- Run backend codegen / schema emission and formatter (e.g., `docker compose run --rm api bun run generate:dev` or `npx prisma generate`), and verify no manual edits exist in generated directories.

### Stage 3 Gate (Frontend / Consumer UI & Operations)
- Run frontend formatter, linter, and typechecker (e.g., `docker compose run --rm web bun run prettier && docker compose run --rm web bun run typecheck`).
- If design tokens or styling rules have a dedicated audit script (e.g., `design:audit:fail`), run it before committing.

### Stage 4 Gate (Frontend / Client Generated Artifacts)
- Run client codegen followed by frontend typecheck (e.g., `docker compose run --rm web bun run codegen && docker compose run --rm web bun run typecheck`).

### Stage 5 Gate (Documentation, Glossary, ADRs & Agent Skills)
- Verify that all relative markdown links resolve in the repository.
- Run the repository's documentation consistency script if one exists (e.g., `python3 scripts/check-docs.py`).
- Verify indexes (`docs/README.md`, `GLOSSARY.md`, `.agents/skills/README.md`) include any newly created files.

---

## Step-by-Step Execution Workflow

1. **Pre-Commit Drift Check** (per [`/git-branching`](../git-branching/SKILL.md) Step 4):
   ```bash
   git rev-parse --abbrev-ref HEAD   # confirm not on main/master
   git status -s
   git diff --name-only
   ```
2. **Classify Modified Files** into Stages 1–5 (omitting stages with no matching files).
3. **Execute Each Active Stage Sequentially**:
   - Stage only the files belonging to the current stage: `git add <stage-files>` (never use blind `git add -A` or `git add .` when multiple stages are dirty in the working tree!).
   - Run the stage's validation gate command. If it fails, fix the root cause before committing.
   - Commit with the formatted Conventional Commit message:
     ```bash
     git commit -m "<type>(<scope>): <imperative description>"
     ```
4. **Verify Clean Tree & History**:
   ```bash
   git status -s
   git log --oneline origin/main..HEAD
   ```

---

## Branching & Pull Request Alignment

- **Branch Names** (managed by [`/git-branching`](../git-branching/SKILL.md)): `feature/<topic>`, `fix/<topic>`, `chore/<topic>`, `refactor/<topic>`, `docs/<topic>`, `test/<topic>`, `perf/<topic>`.
- **Git Commits**: Strictly Conventional Commits (`<type>(<scope>): <description>`), e.g., `feat(api/cards): add foreign currency spread calculation`.
- **Release Version Bumps**: `chore(release): bump version to vX.Y.Z`.
- **Pull Request Titles** (managed by [`/pr`](../pr/SKILL.md)): Use bracketed canonical prefixes (`[<Prefix>] <Imperative description>`), e.g., `[Feature] Implement benefit recharge schedules` or `[Release] v0.2.0 - Benefit recharge schedules and payroll sync`.
