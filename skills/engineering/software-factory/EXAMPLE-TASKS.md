# Example tasks

Tasks grouped by the problem they solve. Each names the trigger that starts its runs, what a run does, and what it triggers next. Most factories start as one of these and grow by chaining the next.

## Untriaged tickets pile up

**Explore task**
- Trigger: a ticket is created, or a human labels it.
- Does: checks the ticket against the codebase and sorts it into a category (easy call, needs a human, not a bug).
- Triggers: an implementer run for easy calls. Anything else ends with the ticket labelled as waiting for a human.

## Ready tickets wait for someone to build them

**Implementer task**
- Trigger: a ticket is labelled ready, by a human or an explore run.
- Does: builds the ticket until the automated checks pass, and opens a draft PR.
- Triggers: an automated review run.

## PRs wait for review

**Automated review task**
- Trigger: a PR opens with no automated review yet, or a human labels it.
- Does: reads `REVIEW.md` and `CODING_STANDARDS.md` strictly from `origin/main` (Default-Branch Review Immutability), audits for Protected Verification Path tampering, and reviews the diff along two independent axes: **Standards** and **Spec**.
- Triggers: a rework run on a fail. On a pass it ends, and the PR waits for human review before a human merges it.

## Failed automated reviews sit unfixed

**Rework task**
- Trigger: an automated review run fails a PR.
- Does: fixes only what the automated review named (without touching Protected Verification Paths or adding test skips/retries), and pushes.
- Triggers: an automated review run. After 3 failed rounds (the Three-Round Fix Cap), it halts immediately and labels the PR as waiting for a human.

## Specs are too big for one run

**Decompose task**
- Trigger: a spec ticket is labelled.
- Does: splits the spec into tickets, each recording which tickets it depends on.
- Triggers: an implementer run.

The implementer run here picks the next ticket whose dependencies are all closed, and triggers itself again until no ticket is left.

## Migrating to a stricter automated check

A new lint rule (or a stricter type setting) is switched on, but only some files pass it. The rule enforces on the passing files, and the failing ones sit on an exception list.

**Ratchet task**
- Trigger: a daily clock.
- Does: takes one file off the exception list, fixes it until the stricter check passes, and opens a PR.
- Triggers: an automated review run. Once the exception list is empty, the ratchet run has nothing to take and the migration is done.

One small PR a day keeps human review cheap, and the check only ever gets stricter.

## Upstream agent skills or dependencies drift behind

Tracked agent skills (`skills-lock.json`) or third-party dependencies update frequently upstream, but opening a new PR for every daily update floods the review queue and creates merge conflicts with `main`.

**Rolling Ratchet task**
- Trigger: a scheduled clock (e.g., daily or weekly).
- Does:
  1. **Safeguard Trunk Sync**: merges `origin/main` (`--no-ff`) into a dedicated long-lived ratchet branch (e.g., `agent/skills-update` or `chore/dependency-security-updates`).
  2. **Conflict Classification**: if the trunk sync conflicts, classifies conflicted paths into *auto-resolvable* (lockfiles, generated Prisma/GraphQL artifacts, design sync tokens, tracked skill files) versus *manual* (application source code). Auto-resolvable conflicts reset to `origin/main` and regenerate; manual conflicts abort and open a dedicated Sync Conflict Escalation PR for a human.
  3. **Scoped Update & Boundary Enforcement**: runs the updater (`npx skills update` or dependency triage), then reverts any out-of-scope dirt or modifications to **Protected Verification Paths** (`verify`, `code-review`, `testing`, `pr`, `git-branching`, `conventional-commits`, CI configs).
  4. **Rolling PR Sync**: creates or updates a single rolling PR targeting the integration branch (`develop` or `main`), closing it automatically if the diff ahead of target drops to zero.
- Triggers: deterministic verification gates (`check-docs`, `check-verification-integrity`).

## Users report bugs nobody reads

A feedback button in the app is a ticket source: it files each report as a ticket with the explore label already on it. The explore run does the rest.

## Production problems are found late

A monitor (slow queries, error rates) is a ticket source. It files a ticket per problem, and comments on the open ticket instead when it sees the same problem again. After a fix merges, it reopens the ticket if the problem persists.

## The factory's own runs fail

**Fix task**
- Trigger: the orchestrator reports a failed run.
- Does: files the failing log as a ticket, and attempts a fix as a PR when the failure is fixable.
- Triggers: an automated review run. A failure in a fix run's own work triggers nothing, so fixes never chain. Because the fix changes the factory itself, it always gets human review.

## The codebase drifts

**Architecture task**
- Trigger: a nightly clock.
- Does: scans recent changes for refactoring candidates and files them as one ticket.
- Triggers: nothing. A human picks a candidate and labels it, which starts the usual chain.

## The same mistakes keep coming back

**Retro task**
- Trigger: a PR merges, throttled to one merged PR in ten.
- Does: reads the PR, its ticket, its automated reviews, and its run logs, and proposes changes to the factory's own instructions as a PR.
- Triggers: an automated review run (flagged for mandatory human review because it touches Protected Verification Paths).
