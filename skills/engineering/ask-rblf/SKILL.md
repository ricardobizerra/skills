---
name: ask-rblf
description: Ask which engineering, governance, verification, or task workflow skill fits your current situation. Use whenever the user asks how the ricardobizerra/skills workflows fit together, isn't sure which skill to invoke next, wants an overview of the branch-to-PR pipeline, or asks "/ask-rblf".
disable-model-invocation: true
---

# Ask RBLF

You don't need to memorize every skill in `ricardobizerra/skills`—use this router to pick the exact skill or sequence for your current engineering bottleneck.

Before claiming what a skill does or advising the user to skip a gate, read that skill's `SKILL.md`: the descriptions below are for orientation only.

---

## Precondition: Configure the Repository Once

- **[`/setup-rblf-skills`](../setup-rblf-skills/SKILL.md)**: Run once when onboarding a repository. It inspects the repo, lazily loads only the matching **Stack Adapter** (`stack-docker-fullstack.md`, `stack-node-ts.md`, `stack-python.md`, or `stack-generic.md`), and writes modular **Harness Config** files under `docs/agents/` (`git-workflow.md`, `commit-pipeline.md`, `verification.md`, `stack.md`, plus `issue-tracker.md` and `domain.md` if not already present) alongside an `## Agent skills` routing block in `AGENTS.md` or `CLAUDE.md`.
- Every downstream skill reads `docs/agents/*.md` first and falls back to runtime auto-detection if `/setup-rblf-skills` hasn't been run yet.

---

## The Main Engineering Spine: Branch → Build → Commit → Verify → Review → Ship

Most engineering tasks travel along this disciplined spine so that git history stays bisect-safe, tests never flake, and code review criteria remain immutable.

### 1. Pre-Flight & Branch Setup

- **[`/git-branching`](../git-branching/SKILL.md)**: Always start here before editing any file.
  - Runs the **Repository State Gate** (halting safely on any in-progress rebase, merge, cherry-pick, revert, bisect, or detached HEAD).
  - Enforces the **Clean Working Tree Gate** (hard-blocking on tracked modifications while classifying untracked files without destructive `git clean -fd`).
  - Synchronizes local trunk (`git fetch` + `git merge --ff-only`), cuts a **Canonical Topic Branch** (`feature/`, `fix/`, `chore/`, `refactor/`, `docs/`, `test/`, `perf/`) that never tracks the trunk, and records the **Drift Baseline** (`git rev-parse HEAD`).

### 2. Task & Layer Execution

Pick the workflow skill that matches what you are building or changing:

- **Building a user-visible capability across layers** → **[`/feature-development`](../feature-development/SKILL.md)**
  Coordinates schema changes, backend domain logic, code generation, frontend UI/state, tests, and documentation in dependency order.
- **Fixing a defect or regression** → **[`/bug-fix`](../bug-fix/SKILL.md)**
  Establishes a tight feedback loop with a failing reproduction spec first, applies a surgical root-cause fix, and checks whether a data-repair migration is needed.
- **Evolving a database schema** → **[`/database-migration`](../database-migration/SKILL.md)**
  Aligns entity names with `GLOSSARY.md`, checks one-way vs. two-way door safety (expand-and-contract), generates the migration, mandates raw SQL inspection, and synchronizes ORM clients.
- **Synchronizing GraphQL schema and client types** → **[`/graphql-codegen`](../graphql-codegen/SKILL.md)**
  Enforces the generated-files invariant and runs dual-stage synchronization: backend schema emission (`schema.gql` / `schema.graphql`) followed by typed frontend client codegen.
- **Writing or debugging unit, integration, or browser E2E tests** → **[`/testing`](../testing/SKILL.md)**
  Enforces zero flakiness workarounds (`retries: 0`, no `.skip`/`.only`, no arbitrary `sleep`/`waitForTimeout`), container-relative path awareness, and **"Check the Check"** (proving new tests fail when production logic is inverted).
- **Updating architecture docs, `GLOSSARY.md`, or ADRs** → **[`/documentation-update`](../documentation-update/SKILL.md)**
  Enforces progressive disclosure in `AGENTS.md`/`CLAUDE.md` (<50 lines), keeps `GLOSSARY.md` free of implementation details, applies the three-part ADR filter, and validates markdown links.

### 3. Staged Atomic Commits

- **[`/conventional-commits`](../conventional-commits/SKILL.md)**: Once edits are ready, never dump a multi-layer change into a single monolithic commit.
  - Classifies modified files into the **Staged Atomic Pipeline** configured in `docs/agents/commit-pipeline.md` (1. Backend/Core Domain → 2. Backend Generated Artifacts → 3. Frontend/UI → 4. Client Generated Artifacts → 5. Docs & ADRs, skipping empty stages).
  - Runs each stage's validation gate before creating the commit in strict Conventional Commits v1.0.0 format (`<type>(<scope>): <imperative description>`).

### 4. Pre-Promotion Verification & Cold Code Review

- **[`/verify`](../verify/SKILL.md)**: Run before pushing for integration or opening any PR.
  - Executes static & integrity gates, unit/integration specs, live stack readiness probes via [`verify-smoke.mjs`](../verify/scripts/verify-smoke.mjs), and zero-retry E2E specs.
  - Enforces the **Three-Round Fix Cap**: if a gate fails more than 3 times, halt immediately and escalate structured diagnostics to the human.
- **[`/code-review`](../code-review/SKILL.md)**: Invoked at the end of `/verify` or standalone whenever you want to review a branch or PR against a fixed point (`git diff <fixed-point>...HEAD`).
  - Spawns two isolated parallel sub-agents: **Standards** and **Spec**.
  - Enforces **Default-Branch Review Immutability** (loading `REVIEW.md` and `CODING_STANDARDS.md` strictly from `origin/main` so a branch cannot weaken its own review gate) and flags **Protected Verification Paths** as `HIGH RISK`.

### 5. Promotion & Pull Request Formatting

- **Push & Integration** (via **[`/git-branching`](../git-branching/SKILL.md)** Step 8):
  - Pushes the validated topic branch (`git push -u origin <prefix>/<slug>`).
  - In a two-branch topology (`main` + `develop`), asks user confirmation before merging `--no-ff` into `develop`.
- **[`/pr`](../pr/SKILL.md)**: Shapes the pull request title and body whenever a PR is requested (topic PR or `develop` → `main` Release PR).
  - Enforces canonical bracketed titles (`[Feature]`, `[Fix]`, `[Release]`, etc.) and the 5-section Topic PR body (`## Summary` with the smallest visual diagram/tree/diff, before/after `## Evidence`, `## Merge Danger` door & blast radius, actually executed `## Verification Gates`, and `## References`).

---

## Designing Autonomous Agent Systems

- **[`/software-factory`](../software-factory/SKILL.md)**: Reach for this skill when designing or evolving an automated system of agents that turns tickets, PRs, and schedules into merged code.
  - Defines the canonical vocabulary (**Task**, **Trigger**, **Run**, **Runner**, **Ticket tracker**, **Ticket source**, **Git host**, **Orchestrator**, **Observability platform**).
  - Details **Verification Brakes** (Default-Branch Review Immutability, Protected Verification Paths, Zero-Flakiness Gates) and **Rolling Ratchet** tasks (automated dependency and skill synchronization).

---

## Quick Decision Table

| If the user says... | Route to... |
| :--- | :--- |
| "Set up this repo for your skills" / "Configure agent docs" | [`/setup-rblf-skills`](../setup-rblf-skills/SKILL.md) |
| "Start working on..." / "Create a branch" / "Sync with main" / "Rebase conflict" | [`/git-branching`](../git-branching/SKILL.md) |
| "Build this feature end-to-end" | [`/git-branching`](../git-branching/SKILL.md) → [`/feature-development`](../feature-development/SKILL.md) |
| "Fix this bug" / "Something is broken" | [`/git-branching`](../git-branching/SKILL.md) → [`/bug-fix`](../bug-fix/SKILL.md) |
| "Add a column/table" / "Run a migration" | [`/database-migration`](../database-migration/SKILL.md) |
| "GraphQL types are out of sync" / "Regenerate schema/client" | [`/graphql-codegen`](../graphql-codegen/SKILL.md) |
| "Write unit/E2E tests" / "Fix this flaky Playwright test" | [`/testing`](../testing/SKILL.md) |
| "Update AGENTS.md / GLOSSARY.md / write an ADR" | [`/documentation-update`](../documentation-update/SKILL.md) |
| "Commit my changes" / "Stage these files" | [`/conventional-commits`](../conventional-commits/SKILL.md) |
| "Verify everything before PR/merge" / "Run smoke check" | [`/verify`](../verify/SKILL.md) |
| "Review my branch against main" | [`/code-review`](../code-review/SKILL.md) |
| "Write the PR description" / "Prepare a release PR" | [`/pr`](../pr/SKILL.md) |
| "Design a CI agent pipeline / nightly ratchet / software factory" | [`/software-factory`](../software-factory/SKILL.md) |
