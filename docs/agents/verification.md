# Verification & Review Immutability

## Gate Commands

- **Repository Integrity & Parity**: `node scripts/validate-repo.mjs`
- **Smoke Probe Self-Test**: `node skills/engineering/verify/scripts/verify-smoke.mjs --self-test`

## Immutable Review Standards

- `origin/main:REVIEW.md`
- `origin/main:SCOPE.md`

## Protected Verification Paths

Modifications to any of the following paths require explicit human escalation and `@ricardobizerra` Code Owner review (see `.github/CODEOWNERS`):
- `REVIEW.md`
- `SCOPE.md`
- `.out-of-scope/`
- `.github/`
- `.claude-plugin/`
- `scripts/`
- `AGENTS.md`, `CLAUDE.md`, `docs/agents/`
- `skills/engineering/verify/`
- `skills/engineering/code-review/`
- `skills/engineering/testing/`
- `skills/engineering/git-branching/`
