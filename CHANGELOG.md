# Changelog

All notable changes to `ricardobizerra/skills` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html) via `.claude-plugin/marketplace.json`.

## [Unreleased]

### Added
- Repository governance & management layer under the Curated Maintainer Model:
  - `LICENSE` (MIT), `.gitignore`, `CONTRIBUTING.md`, `SCOPE.md`, `SECURITY.md`, and `.out-of-scope/` rejection ledger.
  - Self-hosted dogfooding configuration: `AGENTS.md`, `CLAUDE.md`, `REVIEW.md`, and `docs/agents/*.md`.
  - GitHub enforcement: `.github/CODEOWNERS`, `.github/ISSUE_TEMPLATE/observed-failure.yml`, `.github/PULL_REQUEST_TEMPLATE.md`, `.github/workflows/ci.yml`, and `.github/workflows/pr-title.yml`.
  - Zero-dependency repository validator (`scripts/validate-repo.mjs`).
  - Domain glossary terms (`GLOSSARY.md`) and ADRs `0004` and `0005`.

## [1.0.0] - 2026-11-23

### Added
- Initial release of `ricardobizerra/skills` with 14 engineering skills under `skills/engineering/`, `.claude-plugin/marketplace.json`, `README.md`, `GLOSSARY.md`, and ADRs `0001`–`0003`.
