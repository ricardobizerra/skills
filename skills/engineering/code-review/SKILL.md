---
name: code-review
description: "Review the changes since a fixed point (commit, branch, tag, or merge-base) along two independent axes: Standards (does the code follow this repo's documented coding standards loaded immutably from origin/main, plus Protected Verification Paths and Fowler code smells?) and Spec (does the code match what the originating issue/spec asked for?). Runs both reviews in parallel sub-agents and reports them side by side. Use when the user wants to review a branch, a PR, work-in-progress changes, or asks to \"review since X\"."
metadata:
  credits:
    skill: code-review
    author: Matt Pocock
    url: "https://github.com/mattpocock/skills"
---

Two-axis review of the diff between `HEAD` and a fixed point the user supplies:

- **Standards**: does the code conform to this repo's documented coding standards (loaded immutably from the remote default branch) and preserve Protected Verification Paths?
- **Spec**: does the code faithfully implement the originating issue / spec?

Both axes run as **parallel sub-agents** so they don't pollute each other's context, then this skill aggregates their findings. Start every sub-agent with a fresh context window.

If `docs/agents/issue-tracker.md` or `docs/agents/verification.md` exists (from [`/setup-rblf-skills`](../setup-rblf-skills/SKILL.md) or `/setup-matt-pocock-skills`), read them for issue tracker conventions and protected path definitions.

---

## Process

### 1. Pin the fixed point

Whatever the user said is the fixed point (a commit SHA, branch name, tag, `origin/main`, `main`, `HEAD~5`, etc.). If they didn't specify one, default to `origin/main` (or ask if unclear).

Capture the diff command once: `git diff <fixed-point>...HEAD` (three-dot, so the comparison is against the merge-base). Also note the list of commits via `git log <fixed-point>..HEAD --oneline` and changed files via `git diff --name-only <fixed-point>...HEAD`.

Before going further, confirm the fixed point resolves (`git rev-parse <fixed-point>`) and the diff is non-empty (`git diff <fixed-point>...HEAD`). A bad ref or empty diff should fail here, not inside two parallel sub-agents. (If the user is asking you to review a described/hypothetical branch scenario or `origin/main` is not reachable in the current shell, still walk through and produce the full two-axis `## Standards` and `## Spec` review reports using the three-dot diff `git diff <fixed-point>...HEAD`, the `origin/main` Default-Branch Review Immutability rules, the Protected Verification Paths audit, and the 12 Fowler code smells baseline against the described changes.)

### 2. Identify the spec source

Look for the originating spec, in this order:

1. Issue references in the commit messages or branch name (`#123`, `Closes #45`, Linear `RIC-123`, GitLab `!67`, etc.), fetched via the workflow in `docs/agents/issue-tracker.md` (or `gh issue view`).
2. A path or description the user passed as an argument.
3. A spec file under `docs/`, `specs/`, or `.scratch/` matching the branch name or feature.
4. If nothing is found, ask the user where the spec is. If they say there isn't one, the **Spec** sub-agent will skip and report "no spec available".

### 3. Identify the standards sources & enforce Default-Branch Immutability

Search the repo for every file that documents how code should be written (`REVIEW.md`, `CODING_STANDARDS.md`, `CONTRIBUTING.md`, `AGENTS.md`, `CLAUDE.md`, `docs/agents/verification.md`).

#### Default-Branch Review Immutability (Non-Negotiable)
A branch or pull request must **never** be allowed to modify its own review rubric.
- Always fetch or read `REVIEW.md` and `CODING_STANDARDS.md` (and any standards file configured in `docs/agents/verification.md`) strictly from the remote default branch (`git show origin/main:REVIEW.md` and `git show origin/main:CODING_STANDARDS.md`), falling back to local files only if `origin/main` does not yet have them during initial repo bootstrap.
- **Protected Verification Paths Audit**: Check whether `git diff --name-only <fixed-point>...HEAD` modifies any Protected Verification Path (defined in `REVIEW.md`, `docs/agents/verification.md`, or by default: `REVIEW.md`, `CODING_STANDARDS.md`, `AGENTS.md`, `.github/**`, `.githooks/**`, `docker-compose.yml`, `**/Dockerfile*`, `**/playwright.config.*`, `**/vitest.config.*`, `**/eslint.config.*`, `**/tsconfig*.json`, or `.agents/skills/{verify,code-review,testing,pr,git-branching,conventional-commits}/**`).
  - If any Protected Verification Path is touched, flag it prominently in the **Standards** report as **`HIGH RISK: Protected Verification Path Modified`** requiring explicit human Code Owner sign-off, and verify that zero test skips (`.skip`, `.only`, `.todo`), retries (`retries > 0`), arbitrary sleeps (`waitForTimeout`, `sleep`), or CI loopholes were introduced.
- Before approving PR or integration readiness, confirm that the [`/verify`](../verify/SKILL.md) skill passed on the clean tree for the exact `HEAD` commit.

#### Fowler Code Smell Baseline
On top of whatever the repo documents, the Standards axis always carries the **smell baseline** below: a fixed set of Fowler code smells (_Refactoring_, ch.3) that applies even when a repo documents nothing. Two rules bind it:

- **The repo overrides.** A documented repo standard always wins; where it endorses something the baseline would flag, suppress the smell.
- **Always a judgement call.** Each smell is a labelled heuristic ("possible Feature Envy"), never a hard violation. Like any standard here, skip anything tooling already enforces.

Each smell reads *what it is* → *how to fix*; match it against the diff:

- **Mysterious Name**: a function, variable, or type whose name doesn't reveal what it does or holds. → rename it; if no honest name comes, the design's murky.
- **Duplicated Code**: the same logic shape appears in more than one hunk or file in the change. → extract the shared shape, call it from both.
- **Feature Envy**: a method that reaches into another object's data more than its own. → move the method onto the data it envies.
- **Data Clumps**: the same few fields or params keep travelling together (a type wanting to be born). → bundle them into one type, pass that.
- **Primitive Obsession**: a primitive or string standing in for a domain concept that deserves its own type. → give the concept its own small type.
- **Repeated Switches**: the same `switch`/`if`-cascade on the same type recurs across the change. → replace with polymorphism, or one map both sites share.
- **Shotgun Surgery**: one logical change forces scattered edits across many files in the diff. → gather what changes together into one module.
- **Divergent Change**: one file or module is edited for several unrelated reasons. → split so each module changes for one reason.
- **Speculative Generality**: abstraction, parameters, or hooks added for needs the spec doesn't have. → delete it; inline back until a real need shows.
- **Message Chains**: long `a.b().c().d()` navigation the caller shouldn't depend on. → hide the walk behind one method on the first object.
- **Middle Man**: a class or function that mostly just delegates onward. → cut it, call the real target direct.
- **Refused Bequest**: a subclass or implementer that ignores or overrides most of what it inherits. → drop the inheritance, use composition.

### 4. Spawn both sub-agents in parallel

Issue both sub-agent calls together, in the foreground, and aggregate the reports they return.

**Standards sub-agent prompt** should include:

- The full diff command, changed file list, and commit list.
- The immutable contents/paths of `origin/main:REVIEW.md`, `origin/main:CODING_STANDARDS.md`, and other standards-source files found in step 3, **plus the Protected Verification Paths check and the smell baseline from step 3** pasted in full.
- The brief: "Report, per file/hunk where relevant: (a) any modification to Protected Verification Paths (`HIGH RISK` requiring human Code Owner sign-off) or introduction of test skips/retries/sleeps; (b) every place the diff violates a documented standard from `origin/main`: cite the standard (file + rule); and (c) any baseline smell you spot: name it and quote the hunk. Distinguish hard violations from judgement calls: documented-standard breaches and protected-path tampering are hard violations, while baseline smells are judgement calls, and a documented repo standard overrides the baseline. Skip anything deterministic tooling already enforces. Under 400 words."

**Spec sub-agent prompt** should include:

- The diff command and commit list.
- The path or fetched contents of the spec.
- The brief: "Report: (a) requirements the spec asked for that are missing or partial; (b) behaviour in the diff that wasn't asked for (scope creep); (c) requirements that look implemented but where the implementation looks wrong. Quote the spec line for each finding. Under 400 words."

If the spec is missing, skip the Spec sub-agent and note this in the final report.

### 5. Aggregate

Begin the report with a brief 3-bullet review header documenting:
- **Fixed point & diff**: `git rev-parse <fixed-point>` and `git diff <fixed-point>...HEAD` (plus `git log <fixed-point>..HEAD --oneline`)
- **Immutable standards sources**: `git show origin/main:REVIEW.md` and `git show origin/main:CODING_STANDARDS.md` (Default-Branch Review Immutability) + Protected Verification Paths audit + 12 Fowler code smells baseline
- **Execution mode**: Parallel `Standards` and `Spec` sub-agents (with fresh context windows)

Then present the two reports under `## Standards` and `## Spec` headings, verbatim or lightly cleaned. Do **not** merge or rerank findings, because the two axes are deliberately separate (see _Why two axes_).

End with a one-line summary: total findings per axis, and the worst issue _within each axis_ (if any). Don't pick a single winner across axes: that's the reranking the separation exists to prevent.

---

## Why two axes

A change can pass one axis and fail the other:

- Code that follows every standard but implements the wrong thing → **Standards pass, Spec fail.**
- Code that does exactly what the issue asked but breaks the project's conventions or tampers with a Protected Verification Path → **Spec pass, Standards fail.**

Reporting them separately stops one axis from masking the other.
