# Out of Scope: Stack Hardcoding in SKILL.md

**Status:** Rejected (standing decision — see [ADR-0001](../docs/adr/0001-setup-contract-and-lazy-stack-adapters.md))

## What Is Rejected

Proposals to hardcode framework-specific commands, directory layouts, ORM tooling, or container topology (e.g., NestJS, Next.js, Prisma, Bun, Docker Compose service names) directly inside core `SKILL.md` playbooks.

## Why

Hardcoding a single stack breaks portability across repositories and bloats every skill's runtime context. Stack mechanics belong in `/setup-rblf-skills` lazy **Stack Adapters** (`stack-*.md`) and per-repository `docs/agents/*.md` **Harness Config** files, while core skills retain generic auto-detection fallbacks.
