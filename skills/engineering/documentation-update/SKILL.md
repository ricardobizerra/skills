---
name: documentation-update
description: Keep repository documentation, AGENTS.md/CLAUDE.md steering files, ubiquitous language (GLOSSARY.md), Architectural Decision Records (docs/adr/), and index catalogs accurate, concise, and link-verified as behavior changes. Make sure to use this skill whenever updating docs, recording an ADR, defining domain terminology in GLOSSARY.md, editing AGENTS.md, or adding new skills/scripts.
---

# Documentation Update & Context Hygiene Skill

## Purpose

Keep the repository self-describing and accurate as behavior evolves, while preventing root agent steering files (`AGENTS.md` / `CLAUDE.md`) from bloating into stale context dumps.

---

## 1. Progressive Disclosure & Root Steering Hygiene

Why this matters: `AGENTS.md` (and `CLAUDE.md`) is loaded into the agent's context window on **every single turn**. Bloating it with multi-page tutorials, exhaustive CLI flags, or historical notes degrades reasoning quality across all tasks.

1. **Keep `AGENTS.md` / `CLAUDE.md` Strictly Concise (< 50 lines)**:
   - Treat the root steering file as a **routing table** (`Read before you act`), a bulleted list of **Hard rules**, and a compact **Before handoff** checklist.
   - Never paste full workflow playbooks into `AGENTS.md`; put detailed procedures in `docs/` or `.agents/skills/<skill>/SKILL.md` and link to them in one line.
2. **Place Deep Documentation in Dedicated Layers**:
   - **Domain Vocabulary**: `GLOSSARY.md` (or per-context glossaries mapped by `GLOSSARY-MAP.md`, as configured in `docs/agents/domain.md`).
   - **Architectural Decisions**: `docs/adr/`.
   - **Architecture, Data Model & Operations**: `docs/architecture.md`, `docs/data-model.md`, `docs/commands.md`, `docs/commit-strategy.md`.
   - **Agent Harness Config**: `docs/agents/*.md` (scaffolded by [`/setup-rblf-skills`](../setup-rblf-skills/SKILL.md)).

---

## 2. Ubiquitous Language Discipline (`GLOSSARY.md`)

When domain concepts are introduced, renamed, or clarified:

1. **Keep `GLOSSARY.md` Pure**:
   - `GLOSSARY.md` defines **what domain concepts ARE** in 1–2 tight sentences—never how they are implemented in TypeScript, Python, or SQL.
   - Do not treat `GLOSSARY.md` as a feature spec, a database schema dump, or a scratchpad.
2. **Be Opinionated with `_Avoid_`**:
   - Whenever multiple synonyms compete in the codebase or conversation (e.g., *Customer* vs. *Client* vs. *Account*), pick one canonical term and list the rejected synonyms under `_Avoid_: ...`.
   ```markdown
   **Canonical Topic Branch**:
   A short-lived branch cut from a verified-synchronized local trunk (`main`) using one of the seven allowed prefixes.
   _Avoid_: working branch, wip branch, agent branch
   ```

---

## 3. Architectural Decision Records (`docs/adr/`)

Offer or author an ADR in `docs/adr/` **only** when all three criteria hold:
1. **Hard to reverse**: changing your mind later carries meaningful migration or rewrite cost.
2. **Surprising without context**: a future engineer or agent reading the code would wonder *"why on earth did they do it this way?"*
3. **The result of a real trade-off**: genuine alternatives existed and one was chosen for specific reasons.

### ADR Naming & Format Conventions
Check `docs/adr/` or `docs/agents/domain.md` for the repository's numbering style before creating a file:
- **Sequential numbering** (`docs/adr/0001-<slug>.md`, `0002-<slug>.md`) — scan `docs/adr/` for the highest number and increment by 1.
- **UTC timestamp numbering** (`docs/adr/YYYY-MM-DD-HH-mm-ss-<slug>.md`) — used in repositories whose commit strategy mandates UTC timestamp identifiers (`date -u +%Y-%m-%d-%H-%M-%S`). Match whichever convention the repo already uses!
- Keep the ADR concise: a clear title and 1–3 paragraphs explaining the context, the decision, and the trade-off rationale (adding *Considered Options* or *Consequences* only when they add genuine clarity).

---

## 4. Index Synchronization & Verification Gate

Whenever you add, rename, or update a documentation file, ADR, or skill:

1. **Update Repository Indexes**:
   - Every ADR in `docs/adr/` must be indexed in `docs/README.md` (or `README.md` if no `docs/README.md` exists).
   - Every skill in `.agents/skills/` (or `skills/engineering/`) must be indexed in the skills catalog (`README.md` / `.agents/skills/README.md` and `.claude-plugin/marketplace.json` if present).
2. **Verify Links & Documented Commands**:
   - Check that every relative markdown link (`[label](<relative-path>)`) resolves to an existing file on disk.
   - Confirm that any script or command taught in active documentation matches a real script in `package.json`, `Makefile`, or `scripts/`.
   - If the repository provides an automated documentation consistency script (such as `python3 scripts/check-docs.py`), run it before staging:
     ```bash
     python3 scripts/check-docs.py
     ```
3. **Commit Atomically ([`/conventional-commits`](../conventional-commits/SKILL.md))**:
   - Stage documentation, glossary, and ADR updates in the final stage (Stage 5) of the atomic commit pipeline (`docs(adr): ...` or `docs: ...`).
