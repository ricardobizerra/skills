# Repository Scope

This document defines what belongs in `ricardobizerra/skills` and the bar used to evaluate every incoming issue.

## In-Scope Bucket

- **`skills/engineering/`**: Disciplined software engineering, git governance, staged atomic commits, zero-flakiness verification, immutable code review, evidence-backed PRs, and software factory architecture.

Non-engineering buckets (e.g., personal productivity, marketing, generic life coaching) are out of scope.

## The Bar for Issues & Feedback

An issue stays open only if it satisfies **both** conditions:

1. **Observed Failure**: It describes something that actually went wrong in a real coding-agent session — including the skill invoked, the harness/environment, what the agent did, and what was expected. Hypothetical improvements ("it would be nice if...") and abstract feature pitches are closed.
2. **Fits the Philosophy**:
   - It does not duplicate or compose behavior already handled by existing skills.
   - It does not introduce per-user configuration toggles, flags, or niche workflow tweaks into `SKILL.md`.
   - It does not conflict with any standing decision in [`.out-of-scope/`](.out-of-scope/) or [`docs/adr/`](docs/adr/).

## Unclear Issues

Issues that cannot be evaluated against this bar receive a `needs-info` label and one round of clarifying questions. If there is no reply within **14 days**, the issue is closed as `not planned`.
