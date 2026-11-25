# Out of Scope: Harness-Specific Forks & Runtime Dependencies

**Status:** Rejected (standing decision — see [ADR-0003](../docs/adr/0003-upstream-skill-attribution-and-specialization.md))

## What Is Rejected

- Adding conditional branches or separate skill copies tailored to a single proprietary AI IDE/CLI wrapper when standard `SKILL.md` conventions suffice.
- Adding runtime dependencies on external skill packages or npm registries that would break standalone `npx skills@latest add` or `.claude-plugin/marketplace.json` installs.

## Why

Skills must remain portable, human-editable Markdown playbooks that work consistently across Claude Code, Codex, Antigravity, Cursor, and GitHub Copilot.
