---
name: testing
description: Write, debug, and execute unit, integration, and end-to-end browser specs across any test runner (Vitest, Jest, Bun test, Pytest, Playwright) with zero flakiness workarounds (retries=0, zero skips, zero sleeps), container-relative path execution, "Check the Check" failure verification, and a 3-round fix cap. Make sure to use this skill whenever adding tests, fixing failing or flaky specs, or running backend or frontend test suites.
---

# Testing Discipline & Execution Skill

## Purpose

Ensure every unit, integration, and end-to-end (E2E) test provides a trustworthy, deterministic signal. Tests exist to catch real regressions—never to rubber-stamp a build through retries, sleeps, or tautological assertions.

---

## 1. Discover Test Runner & Execution Environment

1. **Read Harness Config**: Check `docs/agents/verification.md` and `docs/agents/stack.md` (created by [`/setup-rblf-skills`](../setup-rblf-skills/SKILL.md)) for the repository's execution mode (Dockerized vs. Host CLI) and test commands.
   - If `docs/agents/stack.md` does not exist yet, check for `docker-compose.yml` (if application services exist, run inside Docker via `docker compose run --rm <service> ...`), `package.json`, or `pyproject.toml`.
2. **Container-Relative Path Rule**:
   - When executing a focused test inside a service container whose working directory is a package subfolder (e.g., `/app/api` or `/app/web`), pass the path **relative to the container's working directory**, not the monorepo root:
     ```bash
     # Good (container workdir is /app/api):
     docker compose run --rm api bun test src/billing/invoice.spec.ts
     # Bad (doubles the api/ prefix inside /app/api):
     docker compose run --rm api bun test api/src/billing/invoice.spec.ts
     ```
3. **Reuse Repository Fixtures & Builders**:
   - Before constructing ad-hoc test objects or raw database inserts, search for established test builders, factories, and Playwright/E2E fixtures (e.g., `src/utils/create-test-model.*`, `e2e/fixtures.*`, `conftest.py`).
   - In E2E suites, always import `test` and `expect` from the project's shared fixture wrapper if one exists, and isolate per-run test users/data so parallel workers never collide.

---

## 2. Flakiness Discipline & "Check the Check" (Non-Negotiable)

Why these rules matter: a test that passes only on retry or because of an arbitrary `sleep(1000)` masks real race conditions in production, while a test that was never seen to fail often asserts nothing at all.

### Rule 1: Zero Flakiness Workarounds
- **Zero Skips**: Never commit `.skip`, `.only`, `.fixme`, `.todo`, `xit`, `xdescribe`, or `@pytest.mark.skip` / `xfail` to bypass a failing test.
- **Zero Retries**: Always run and configure test suites with **`retries: 0`** (in Playwright, Vitest, Jest, and Pytest). If a test fails 1 out of 5 times, diagnose the underlying race condition or state leak instead of enabling retries.
- **Zero Arbitrary Sleeps**: Never use `page.waitForTimeout(...)`, `new Promise(r => setTimeout(r, ...))`, or `time.sleep(...)` to wait for async work.
  - **In Browser E2E (Playwright)**: Await deterministic web-first assertions (`await expect(locator).toBeVisible()`, `await expect(locator).toHaveText(...)`) or explicit network/state events (`page.waitForResponse(...)`).
  - **In Unit / Integration Tests**: Use fake timers (`vi.useFakeTimers()`, `jest.useFakeTimers()`) or explicit promise/event resolution.

### Rule 2: "Check the Check" (Prove the Test Can Fail)
Every newly written or modified test must prove it actually guards the intended behavior:
1. Write the test first (red-green-refactor), **or** temporarily invert/comment out the production fix/feature logic after writing the test.
2. Run the focused test and observe it **fail for the expected reason**.
3. Restore the production logic and observe the test **pass**.

### Rule 3: Three-Round Fix Cap
When diagnosing a failing test:
- Run the **single failing spec file** in a tight feedback loop before running the full test suite.
- Attempt at most **3 diagnostic and fix rounds**. If the test still fails after Round 3, **HALT immediately** and escalate the failure output, hypotheses tested, and options to the human user.

---

## 3. Execution Steps

1. **Locate or Create the Spec**:
   - Co-locate unit/integration specs with the domain module (`src/<module>/<name>.spec.ts` or `tests/test_<module>.py`) and place browser E2E specs in the E2E directory (`e2e/<flow>.spec.ts`).
2. **Run Focused Spec First**:
   ```bash
   # Dockerized backend example:
   docker compose run --rm api bun test src/<module>/<file>.spec.ts

   # Host Node / Python example:
   pnpm test src/<module>/<file>.spec.ts
   pytest tests/test_<module>.py
   ```
3. **Perform "Check the Check"**: Confirm the spec fails when the guarded behavior is broken and passes when restored.
4. **Run the Layer Suite**:
   - Run the full unit/integration suite for the modified package (`docker compose run --rm api bun run test` or host equivalent).
   - If user-facing flows or API contracts changed, run the E2E suite with zero retries (`docker compose --profile e2e run --rm --no-deps -e CI=true e2e bun run test:e2e` or `CI=true npx playwright test --retries=0`).
5. **Full Pre-Promotion Verification**:
   - Before merging or opening a PR, run the complete [`/verify`](../verify/SKILL.md) pipeline.

---

## 4. Recovery Guidance

- **Database Connection Failures in Tests**: Verify that the test database container is running (`docker compose up -d postgres redis`) and that test environment variables (`ENV=test`, `DATABASE_TEST_URL` or `DATABASE_URL`) are loaded.
- **Browser / DOM State Mysteries in E2E**: Inspect Playwright trace artifacts (`test-results/`) or reproduce interactively with a browser tool rather than guessing selectors blindly.
