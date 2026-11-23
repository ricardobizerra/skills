---
name: pr
description: "Format pull request titles and bodies using canonical bracketed prefixes ([Feature], [Fix], [Chore], [Refactor], [Docs], [Test], [Perf], [Release]), a 5-section Topic PR template with compact visual summaries (pseudocode, call trees, component trees, file trees, Mermaid, or targeted diffs), before/after evidence, one-way/two-way door merge danger, executed verification gates, and a Release PR template. Make sure to use this skill whenever writing, updating, or formatting a pull request title or description."
metadata:
  credits:
    - skill: pr
      author: Matt Pocock
      url: "https://github.com/mattpocock/skills"
    - skill: show-me
      author: Dex Horthy
      organisation: Humanlayer
      url: "https://github.com/humanlayer/skills/blob/main/plugins/show-me/skills/show-me/SKILL.md"
---

# Pull Request Formatting & Visual Summary Skill

Use this skill whenever preparing pull request titles and descriptions—either for a standard **Topic PR** or an upstream **Release PR** (`develop` → `main`).

---

## Pull Request Titles

PR titles strictly use **bracketed canonical prefixes** followed by a sentence-cased imperative summary, without trailing periods and without package scope tags (package scopes belong in [`/conventional-commits`](../conventional-commits/SKILL.md), not PR titles):

```text
[<Prefix>] <Imperative description>
```

### Allowed Canonical Prefixes (8)

- `[Feature]` — New user-visible capability or endpoint (for `feature/*` branches)
- `[Fix]` — Bug fix or defect correction (for `fix/*` branches)
- `[Chore]` — Maintenance, codegen, or dependency updates (for `chore/*` branches)
- `[Refactor]` — Structural refactoring without behavioral change (for `refactor/*` branches)
- `[Docs]` — Documentation, glossary, ADR, or skill updates (for `docs/*` branches)
- `[Test]` — Test suite additions and fixes (for `test/*` branches)
- `[Perf]` — Performance and memory optimizations (for `perf/*` branches)
- `[Release]` — Upstream release train (`develop` → `main`), formatted as `[Release] vX.Y.Z - <Highlights>`

_Examples_:
- `[Feature] Implement benefit recharge schedules and destiny accounts`
- `[Fix] Prevent scroll reset on modal open`
- `[Release] v0.2.0 - Benefit recharge schedules and payroll sync`

---

## Topic PR Template (5 Mandatory Sections)

Use this template for all topic pull requests:

```markdown
## Summary

<diagram, diff-sketch, call-tree, component-tree, or file-tree>

## Evidence

- **Before:** <screenshot / terminal output / failing reproduction test run>
- **After:** <screenshot / terminal output / passing test run & smoke probe>

## Merge Danger

**Door:** <one-way or two-way>

<optional: 1-2 sentences explaining why it is easy or costly to roll back>

**Blast Radius:** <one-word or short phrase: e.g., low / isolated to cards module / global auth middleware>

<optional: potential ramifications of merge>

## Verification Gates

<!-- Populate from docs/agents/verification.md or auto-detected repo gates; check off ONLY gates actually executed and passed in this session -->

- [ ] Static gates (lint, format, typecheck, build)
- [ ] Unit & integration test suites
- [ ] Stack readiness smoke probe (`verify-smoke.mjs`)
- [ ] End-to-end suite (`retries: 0`)
- [ ] Documentation consistency check
- [ ] Cold `code-review` passed against `origin/main`

## References

- Issue / Ticket: <e.g., Closes #42 / Refs RIC-123 / N/A>
- ADR: <e.g., ADR-0002 or ADR YYYY-MM-DD-HH-mm-ss or N/A>
```

---

## Release PR Template (`develop` → `main`)

In repositories using a two-branch (`main` + `develop`) release train, ensure versions are bumped on `develop` and committed as `chore(release): bump version to vX.Y.Z` before opening the Release PR:

```markdown
## Release Highlights

<Concise summary of user-facing capabilities, architectural milestones, and performance improvements shipped in this release.>

## Included Changes

### Features

- <Feature 1>
- <Feature 2>

### Fixes

- <Fix 1>
- <Fix 2>

### Chores & Maintenance

- <Chore 1>

## Breaking Changes & Migrations

<Database schema migrations, newly required environment variables, or "None">

## Pre-Release Verification Checklist

<!-- Populate with the repo's release verification commands from docs/agents/verification.md -->

- [ ] Version lockstep / tag check passed
- [ ] All static, unit, smoke, and E2E verification gates passed
- [ ] Production migration deployment dry-run verified

## References

- Included ADRs: <list of recorded ADRs or "None">
```

---

## Writing the 5 Topic PR Sections

Skip preambles and keep prose brief. Use the repository's canonical domain vocabulary from `GLOSSARY.md` (when present).

### 1. Summary (Pick the Smallest Visual That Makes the Point Clear)

Instead of a wall of prose explaining what changed, pick the smallest visual representation that shows the shape of the change at a glance:

- **Logic or algorithm → Pseudocode**:
  ```text
  on(save)
    if content is unchanged
      return cached result
    write new content
    return fresh result
  ```
- **Runtime control flow → Call tree**:
  ```text
  submitForm
    createSession
      persistPrompt
      launchAgent
    navigateToSession
  ```
- **UI structure → Component tree** (including state and module boundaries that matter):
  ```text
  <SessionPage> (apps/web/src/routes/session.tsx)
    useSessionEvents()
    <SessionToolbar>
      <RunSkillButton> (packages/ui)
  ```
- **File responsibility or broad refactor → Shallow file tree**:
  ```text
  src/
  ├── commands/       # parses user actions
  ├── sessions/       # owns session state
  └── transport/      # sends API requests
  ```
- **Component interaction, protocol, or state machine → Mermaid diagram**:
  ```mermaid
  sequenceDiagram
      participant User
      participant UI
      participant API
      User->>UI: submit order
      UI->>API: POST /orders
      API-->>UI: 201 Created
  ```
- **Modification to an existing structure → Targeted `diff`** matched to the representation (component-tree diff, file-tree diff, call-tree diff, or control-flow pseudocode diff):
  ```diff
   submitForm
     createSession
       persistPrompt
  +    expandSkillMention
       launchAgent
  -  navigateToSession
  +  navigateToSession
  +    subscribeToEvents
  ```

Place each visual next to the one-sentence text it supports. Use one visual (or at most two) — don't overwhelm the reviewer.

### 2. Evidence

Provide concrete before/after proof that the change works:
- **Visual changes**: Before/after screenshots are S-tier when a browser environment is available.
- **Behavioral / backend changes**: Execution-based evidence is A-tier (exact failing reproduction test output before the fix vs. passing test output and smoke probe timings after).

### 3. Merge Danger

- **Door**: State whether the change is a **two-way door** (cheap and safe to revert cleanly with `git revert`) or a **one-way door** (destructive schema migration, external contract change, or persisted data format change that requires a forward migration or manual rollback plan).
- **Blast Radius**: Name the scope of potential impact (e.g., `low — isolated to CSV export helper`, `medium — touches shared GraphQL auth guard`, `high — modifies database schema and checkout flow`).

### 4. Verification Gates

Populate the checklist with the repository's actual verification commands (from `docs/agents/verification.md` or auto-detected scripts).
- **Honesty invariant**: Check off (`[x]`) **only** commands that were actually executed and passed during the current session on the current `HEAD`. Leave unexecuted or non-applicable commands unchecked (`[ ]`) with an inline note explaining why.

### 5. References

Link the originating issue tracker ticket (`Closes #123`, `Refs RIC-45`, or `N/A`) and any ADRs recorded (`ADR-0002`, `ADR YYYY-MM-DD-HH-mm-ss`, or `N/A`).
