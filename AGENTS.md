# ricardobizerra/skills

Disciplined engineering, repository governance, and verification skills for AI coding agents.

## Core Governance

- **Scope & Contribution Model**: Curated Maintainer Model. Check `SCOPE.md` and `.out-of-scope/` before proposing new skills or changes.
- **Immutability**: Code reviews evaluate against `origin/main:REVIEW.md`. Never weaken Protected Verification Paths.
- **Zero-Dependency Validation**: Run `node scripts/validate-repo.mjs` and `node skills/engineering/verify/scripts/verify-smoke.mjs --self-test` before committing.

## Agent skills

### Git workflow & branching
Direct-trunk (`main`) workflow; canonical topic branches cut from verified local `main`, synced via `--no-rebase`. See `docs/agents/git-workflow.md`.

### Commit pipeline & gates
3-stage Conventional Commits pipeline (Skills/Scripts → Manifest/Governance → Docs/ADRs) with per-stage validation gates. See `docs/agents/commit-pipeline.md`.

### Verification & review immutability
Zero-dependency Node ESM validator, `verify-smoke.mjs --self-test`, Protected Verification Paths, and cold review against `origin/main:REVIEW.md`. See `docs/agents/verification.md` and `docs/agents/stack.md`.

### Issue tracker & domain docs
GitHub Issues (`gh` CLI, Observed-Failure Bar) and single-context domain docs (`GLOSSARY.md` + `docs/adr/`). See `docs/agents/issue-tracker.md` and `docs/agents/domain.md`.
