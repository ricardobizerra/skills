# Staged Atomic Commit Pipeline

Order commits across these stages using Conventional Commits v1.0.0:

1. **Stage 1 — Skills, Scripts & Evals** (`skills/**`, `scripts/**`)
   - Pre-commit gate:
     ```bash
     node scripts/validate-repo.mjs && node skills/engineering/verify/scripts/verify-smoke.mjs --self-test
     ```
2. **Stage 2 — Plugin Manifest & Governance Config** (`.claude-plugin/**`, `.github/**`, `REVIEW.md`, `SCOPE.md`, `.out-of-scope/**`, `AGENTS.md`, `CLAUDE.md`)
   - Pre-commit gate:
     ```bash
     node scripts/validate-repo.mjs
     ```
3. **Stage 3 — Documentation, Glossary, Changelog & ADRs** (`README.md`, `GLOSSARY.md`, `CHANGELOG.md`, `CONTRIBUTING.md`, `SECURITY.md`, `docs/**`)
   - Pre-commit gate:
     ```bash
     node scripts/validate-repo.mjs
     ```
