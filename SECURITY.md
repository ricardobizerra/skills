# Security Policy

## Scope

This repository distributes Markdown skill playbooks (`SKILL.md`) and zero-dependency Node.js utility scripts (`scripts/validate-repo.mjs`, `skills/engineering/verify/scripts/verify-smoke.mjs`).

Security reports are welcome for:
- Command injection, path traversal, or unsafe execution in bundled scripts or GitHub Actions workflows.
- Prompt-injection vectors or verification-brake bypasses inside skill definitions that could cause an agent to weaken security, CI, or review gates.

## Reporting a Vulnerability

Please **do not** open a public GitHub issue for security vulnerabilities.

Instead, report vulnerabilities privately via GitHub **Private Vulnerability Reporting** (Security Advisories) on `ricardobizerra/skills`. Include:
- Affected file path(s) and skill/script name.
- Minimal reproduction steps or proof-of-concept.
- Impact assessment.
