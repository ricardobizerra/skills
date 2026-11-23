# Credits

This skill is adapted from [Matt Pocock](https://github.com/mattpocock)'s [`software-factory`](https://github.com/mattpocock/skills/tree/main/skills/engineering/software-factory) skill in `mattpocock/skills`.

The core vocabulary (**Task**, **Trigger**, **Run**, **Runner**, **Ticket tracker**, **Ticket source**, **Git host**, **Orchestrator**, **Observability platform**) and the four service slot surveys (`GIT-HOSTS.md`, `OBSERVABILITY-PLATFORMS.md`, `RUNNERS.md`, `TICKET-TRACKERS.md`) come from `mattpocock/skills`.

It has been specialized by [Ricardo Bizerra](https://github.com/ricardobizerra) with:
- **Hardened Verification Brakes**: Default-Branch Review Immutability (`origin/main:REVIEW.md`), Protected Verification Paths enforcement, Zero-Flakiness Gate Integrity (`retries: 0`, no skips/sleeps), and a strict 3-round rework cap.
- **Rolling Ratchet Tasks** in `EXAMPLE-TASKS.md`: automated trunk-to-branch safeguard sync, conflict classification (auto-resolvable generated/lockfile conflicts vs. manual code escalation PRs), and single-rolling-PR maintenance for tracked agent skills and dependency updates.
