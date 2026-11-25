# Contributing to ricardobizerra/skills

`ricardobizerra/skills` follows a **Curated Maintainer Model** inspired by [`mattpocock/skills`](https://github.com/mattpocock/skills).

## Pull Requests

Direct pull requests are restricted to maintainers and invited collaborators. External PRs opened without prior maintainer agreement will be closed with a pointer to open an issue instead.

If you want a skill changed or fixed, open an issue describing the **observed failure** you encountered in a real session.

## Issues

Before opening an issue, read [`SCOPE.md`](SCOPE.md) and check [`.out-of-scope/`](.out-of-scope/) to confirm your report is not already covered by a standing rejection decision.

When filing an issue via the **Observed Failure** form:
1. **One problem per issue.** Do not bundle unrelated requests or multi-skill redesigns.
2. **Reproduction first.** State the exact skill invoked, your agent harness/environment, what happened, and what you expected.
3. **Keep it concise.** Do not paste raw specification documents, full conversation dumps, or AI-generated full-file rewrites of `SKILL.md`.

## Maintainer & Collaborator Workflow

Maintainers and collaborators making changes directly in this repository must follow its self-hosted governance:
1. Read [`AGENTS.md`](AGENTS.md), [`docs/agents/`](docs/agents/), and [`REVIEW.md`](REVIEW.md).
2. Cut a canonical topic branch from `main` (`feature/`, `fix/`, `chore/`, `refactor/`, `docs/`, `test/`, `perf/`).
3. Use a bracketed PR title matching `/pr` (`[Feature] ...`, `[Fix] ...`, etc.) and fill out all 5 sections of the PR template.
4. Run local validation before pushing:
   ```bash
   node scripts/validate-repo.mjs && node skills/engineering/verify/scripts/verify-smoke.mjs --self-test
   ```
5. Changes to **Protected Verification Paths** (listed in [`.github/CODEOWNERS`](.github/CODEOWNERS)) require explicit `@ricardobizerra` review.
