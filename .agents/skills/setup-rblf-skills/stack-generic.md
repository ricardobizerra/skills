# Stack Adapter: Generic / Polyglot Repository

Loaded lazily by `/setup-rblf-skills` when the repository uses Go, Rust, Ruby, Java, Markdown/Skills-only, or custom Makefile/shell scripts.

---

## 1. Template for `docs/agents/stack.md`

```markdown
# Stack & Execution Environment

## Execution Runner
- **Mode**: `<Dockerized | Host CLI>`
- **Primary Toolchain**: `<cargo / go / bundle / make / custom scripts>`

## Command Matrix
- **Build / Check**: `<command>`
- **Lint & Format**: `<command>`
- **Unit / Integration Tests**: `<command>`
- **E2E / Smoke Checks**: `<command>`
```

---

## 2. Template for `docs/agents/commit-pipeline.md`

```markdown
# Staged Atomic Commit Pipeline

Stage, validate, and commit changes in dependency order (skipping stages with no modified files):

| Stage | Scope & Files | Commit Prefix Example | Pre-Commit Validation Gate |
| :--- | :--- | :--- | :--- |
| **Stage 1: Core Implementation & Tests** | Source and test directories | `feat(<scope>): ...` or `fix(<scope>): ...` | Run build, lint, and test gates |
| **Stage 2: Generated Artifacts / Schemas** (if any) | Generated files or lockfiles | `chore(<scope>): update generated artifacts` | Run generator and verify clean build |
| **Stage 3: Documentation & ADRs** | `docs/**`, `README.md`, `GLOSSARY.md`, `AGENTS.md` | `docs(adr): ...` or `docs: ...` | Verify all relative markdown links resolve |
```

---

## 3. Template for `docs/agents/verification.md`

```markdown
# Verification & Review Governance

## Verification Gates (`/verify`)
1. **Static & Build Gates**: `<lint / typecheck / build command>`
2. **Test Suite**: `<test command>`
3. **Smoke / E2E Probe** (if applicable): `<smoke or e2e command>`

## Immutable Default-Branch Review Policy (`/code-review`)
- **Default Branch**: `origin/main`
- **Immutable Standards Files**: Load `REVIEW.md`, `CODING_STANDARDS.md`, or `CONTRIBUTING.md` via `git show origin/main:<file>` when present.
- **Protected Verification Paths**:
  - `REVIEW.md`, `CODING_STANDARDS.md`, `AGENTS.md`, `CLAUDE.md`
  - `.github/**`, `.githooks/**`, CI and linter configuration files
  - `.agents/skills/{verify,code-review,testing,pr,git-branching,conventional-commits}/**`
- **Zero-Flakiness Rules**: Zero skipped tests, zero test retries, zero arbitrary sleep workarounds, "Check the Check" failure verification, and a strict **3-Round Fix Cap**.
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
