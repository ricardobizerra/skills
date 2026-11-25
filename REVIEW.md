# Review Policy

This file is the immutable review standard for `ricardobizerra/skills`. Automated `/code-review` runs must read it from `origin/main:REVIEW.md` (`git show origin/main:REVIEW.md`) so no branch can weaken the rules by which it is evaluated.

## 1. Skill Authoring Standards

- **Valid Frontmatter**: Every skill under `skills/engineering/<name>/SKILL.md` must declare YAML frontmatter with `name` matching the directory name and a clear, concise `description`.
- **Progressive Disclosure**: Keep `SKILL.md` focused and imperative. Move large reference tables, stack-specific templates, or helper scripts into sibling files (`references/`, `stack-*.md`, `scripts/`).
- **Stack Agnosticism**: Core `SKILL.md` files must not hardcode framework/ORM/container commands. Stack-specific mechanics belong in `/setup-rblf-skills` lazy Stack Adapters or per-repo `docs/agents/*.md`.
- **Attribution**: Any skill adapting upstream work must declare `metadata.credits` in frontmatter and maintain a `CREDITS.md` file in the skill directory.

## 2. Verification Brake Integrity

- Never weaken or bypass Verification Brakes in `/verify`, `/testing`, `/code-review`, or `/software-factory` (`retries: 0`, zero skips/sleeps, "Check the Check", Three-Round Fix Cap, Default-Branch Review Immutability).
- Edits to **Protected Verification Paths** (`.github/CODEOWNERS`, `.github/workflows/`, `scripts/validate-repo.mjs`, `REVIEW.md`, `SCOPE.md`, `.out-of-scope/`, `skills/engineering/verify/`, `skills/engineering/code-review/`, `skills/engineering/testing/`, `skills/engineering/git-branching/`) must be flagged as `HIGH RISK` and require explicit human sign-off.

## 3. Registry, Evals & Documentation Parity

- Any added, renamed, or removed skill must update `.claude-plugin/marketplace.json`, `README.md`, `CHANGELOG.md`, and `evals/evals.json` in the same PR.
- All relative Markdown links must resolve to existing files on disk.
- `node scripts/validate-repo.mjs` and `node skills/engineering/verify/scripts/verify-smoke.mjs --self-test` must pass with exit code `0`.
