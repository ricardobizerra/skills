---
name: bug-fix
description: Diagnose defects through a tight reproduction feedback loop, write a failing regression spec first, apply a surgical root-cause fix without scope creep, synchronize generated artifacts and docs, and validate through staged atomic commits and full verification. Make sure to use this skill whenever investigating or fixing a bug, regression, error report, or broken behavior.
---

# Bug Fix Workflow Skill

## Purpose

Resolve defects with **minimal blast radius** and **permanent regression protection**. Every bug fix follows a strict sequence: pre-flight branch gate → failing reproduction spec (tight feedback loop) → surgical root-cause fix → artifact/doc alignment → staged atomic commits → full verification.

---

## Execution Steps

### Step 0: Pre-Flight Branch Verification ([`/git-branching`](../git-branching/SKILL.md))

Before editing any file:
1. Run the **Repository State Gate** and **Clean Working Tree Gate** in [`/git-branching`](../git-branching/SKILL.md).
2. Synchronize local `main` (`git fetch origin main && git checkout main && git merge --ff-only origin/main`).
3. Cut a canonical `fix/<topic>` branch from local `main` (`git checkout -b fix/<topic> main`), assert no upstream tracks trunk, and record the **Drift Baseline** (`git rev-parse HEAD`).

### Step 1: Establish a Tight Feedback Loop & Failing Reproduction Spec ([`/testing`](../testing/SKILL.md))

Never guess at a fix or edit production code before you can reliably reproduce the defect:
1. Isolate the fault to its owning layer (database/schema, backend domain service, API resolver/controller, client cache/state, or UI component).
2. Write a **focused reproduction test** (unit, integration, or Playwright E2E spec) that exercises the exact broken scenario.
3. Run **only** that focused spec (using container-relative paths if Dockerized, e.g., `docker compose run --rm api bun test src/<module>/<file>.spec.ts` or host test runner) and confirm it **fails on the exact bug** (**"Check the Check"** upfront).
   - If the bug cannot be reproduced in a test yet, add minimal diagnostic instrumentation to confirm the root cause—never stack speculative "maybe this fixes it" edits on top of each other.

### Step 2: Apply a Surgical Root-Cause Fix

1. Fix the root cause at the owning module boundary—do not paper over symptoms at call sites.
2. **Restraint & Scope Discipline**:
   - Keep the diff strictly scoped to the defect. Do **not** bundle unrelated formatting cleanups, renames, or opportunistic refactors into a `fix/` branch.
   - If you uncover an unrelated bug while investigating, leave it out of this diff and note it separately for the user or issue tracker.
3. **Data-Level Defect Check**:
   - Ask: *"Did this bug corrupt or mis-seed existing database rows?"* If so, check whether a data-repair migration or seeder update is required via [`/database-migration`](../database-migration/SKILL.md).
4. Re-run the focused reproduction spec from Step 1 and confirm it now **passes**.

### Step 3: Synchronize Generated Artifacts & Documentation

1. **Schema / Codegen Alignment**:
   - If the fix modified database models, API inputs/types, or frontend GraphQL documents, run [`/database-migration`](../database-migration/SKILL.md) and/or [`/graphql-codegen`](../graphql-codegen/SKILL.md) so generated files stay 100% synchronized.
2. **Documentation Alignment**:
   - If the fix corrects a previously misdocumented contract, command, or domain invariant, update the relevant documentation via [`/documentation-update`](../documentation-update/SKILL.md).

### Step 4: Stage Atomic Commits ([`/conventional-commits`](../conventional-commits/SKILL.md))

Stage and commit the fix using the repository's **Staged Atomic Pipeline** (`docs/agents/commit-pipeline.md` or auto-detected layers):
- Stage 1: Backend fix + regression spec → run backend test/typecheck gate → `fix(<scope>): <imperative summary>`
- Stage 2: Regenerated backend artifacts (if any) → `chore(<api>): update generated artifacts`
- Stage 3: Frontend fix + spec (if any) → run frontend lint/typecheck/format gate → `fix(<web-scope>): <imperative summary>`
- Stage 4: Regenerated client types (if any) → `chore(<web>): update generated client types`
- Stage 5: Documentation updates (if any) → `docs(<scope>): ...`

### Step 5: Pre-Promotion Verification ([`/verify`](../verify/SKILL.md))

Before pushing or proposing integration into `develop` or `main`:
1. Run full verification via [`/verify`](../verify/SKILL.md) (static gates, full unit/integration suite, `verify-smoke.mjs` readiness probes, zero-retry E2E suite, and cold [`/code-review`](../code-review/SKILL.md) against `origin/main` under the **3-Round Fix Cap**).
2. If `origin/main` advanced while fixing the bug, sync via `git pull --no-rebase origin main` (never rebase) and re-verify before pushing via [`/git-branching`](../git-branching/SKILL.md) Step 8.
