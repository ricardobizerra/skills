---
name: software-factory
description: "Shared language and governance architecture for designing an autonomous software factory: the tasks it runs, the services it plugs into, the Verification Brakes that stop reward hacking, and Rolling Ratchet workflows. Use when designing, auditing, or discussing automated agent pipelines, CI agent runners, dependency/skill ratchets, or autonomous PR loops."
disable-model-invocation: true
metadata:
  credits:
    skill: software-factory
    author: Matt Pocock
    url: "https://github.com/mattpocock/skills"
---

A **software factory** is a system of agents that turns tickets, PRs, and schedules into merged code, deployed on remote infrastructure the user chooses. This skill is the language and governance architecture for designing one. Use these terms, and only these, when discussing or whiteboarding a factory; when the user reaches for a word under _Avoid_, name the canonical term.

## Tasks and runs

**Task**:
A kind of work the factory performs, defined once and run many times: review, explore, implement, ratchet. A task may work on a ticket, a PR, or the codebase as a whole.
_Avoid_: job, workflow, action

**Trigger**:
The event that starts a run: a change in the ticket tracker or git host, a clock in the orchestrator, or another run.

**Run**:
One execution of a task on one runner, from its trigger to its finish, treated as a black box. A run triggers further runs either directly, through logic in the orchestrator, or by changing the ticket tracker or git host. A run never waits for a human: it ends, and the human's later change to the ticket tracker or git host triggers a new run.
_Avoid_: session

**Runner**:
The disposable machine a run executes on. Nothing on it survives the run, even when the machine itself is long-lived: a run's only memory of earlier runs is the ticket tracker, the git host, and the orchestrator.
_Avoid_: server, host, box, compute, sandbox

## Services

**Ticket tracker**:
Where tickets live, and the factory's human interface: humans schedule work by filing tickets, talk to agents in their comments, and their changes to tickets trigger runs.
_Avoid_: issue tracker, ticket manager, project board

**Ticket source**:
Anything outside the factory that creates tickets in the ticket tracker: a feedback button, a monitor, an error tracker, an inbox.
_Avoid_: data source, trigger source, intake

**Git host**:
Where branches, PRs, and reviews live.
_Avoid_: code host, forge, repo

**Orchestrator**:
The component that receives triggers, starts runs on runners, and records which runs are queued, in flight, or finished.
_Avoid_: dispatcher, scheduler, control plane

**Observability platform**:
Where runners send logs, traces, and status, so a human can see what happened inside each run. Optional: the product filling the runner or orchestrator slot often shows enough on its own. A run never decides on it until something writes it into the ticket tracker or git host.
_Avoid_: observability, logs, monitoring, dashboard

---

## Designing a factory

A design has two halves: the **services**, each a slot filled with a product, and the **tasks** whose runs move work through them.

Start from the user's problem, not the factory: untriaged tickets, PRs waiting for automated review, a stricter automated check to migrate to, dependencies or agent skills drifting behind upstream, bugs nobody reads. When the user names a problem or doesn't know what to build, read [EXAMPLE-TASKS.md](EXAMPLE-TASKS.md) for the tasks that solve common ones.

### Start slow & harden the Verification Brakes

Every trigger is an accelerator. Accelerators without brakes make a slop cannon. A production software factory relies on three **Verification Brakes**—and hardens them so an implementer or rework run can never pass a gate by weakening the gate itself:

1. **Deterministic Automated Checks (with Zero-Flakiness & Protected Path Integrity)**:
   - Deterministic gates (types, lint, format, unit/E2E tests, doc link checks, smoke readiness probes) that every run must pass.
   - **Protected Verification Paths**: CI workflows, linter/typechecker configs, test runner configs (`playwright.config.*`, `vitest.config.*`), and core verification skills are off-limits to automated runs. Any diff touching a Protected Verification Path must fail the automated gate or immediately escalate to human review.
   - **Zero-Flakiness Enforcement**: A verification integrity check rejects any diff that introduces `.skip`, `.only`, `.todo`, `retries > 0`, or arbitrary `sleep`/`waitForTimeout` calls.
2. **Cold Automated Review (with Default-Branch Review Immutability)**:
   - A separate run that reads the diff cold against the codebase's documented standards and the originating ticket/spec (see [`/code-review`](../code-review/SKILL.md)).
   - **Default-Branch Review Immutability**: The review run MUST load `REVIEW.md` and `CODING_STANDARDS.md` strictly from `origin/main` (`git show origin/main:REVIEW.md`), never from the PR branch under review. A run cannot edit the rubric by which it is graded.
   - **Three-Round Rework Cap**: Cap every implementer ↔ automated-review rework loop at a maximum of 3 rounds before halting and labelling the PR/ticket for human intervention.
3. **Human Review**:
   - A human reads the PR before it merges; what the human catches becomes new deterministic checks and sharper `REVIEW.md` / `CODING_STANDARDS.md` rules on `main`.

Add one automated trigger at a time, throttled at first (one bug report in ten, a clock once a day), with human review on every PR. Open the throttle only as the brakes earn trust.

### Fill every slot

Each service is a slot. One product can fill several slots, and one server can host several services. Three designs, side by side:

| Service                | All on GitHub                   | Linear tickets                 | Own tracker              |
| ---------------------- | ------------------------------- | ------------------------------ | ------------------------ |
| Ticket tracker         | GitHub Issues                   | Linear                         | own app                  |
| Ticket source          | feedback button                 | feedback button, monitor       | feedback button, monitor |
| Git host               | GitHub                          | GitHub                         | GitHub                   |
| Orchestrator           | GitHub Actions                  | own server + database          | own app                  |
| Runner                 | Actions runner                  | Actions, E2B, Daytona or a VPS | own app, or sandboxes    |
| Observability platform | none: Actions run pages suffice | an LLM tracing platform        | own app                  |

When the user is choosing a product for a slot, read that slot's survey to get oriented, then research the current options yourself; each survey groups the options by type and lists the questions that decide the slot:

- [TICKET-TRACKERS.md](TICKET-TRACKERS.md)
- [GIT-HOSTS.md](GIT-HOSTS.md)
- [RUNNERS.md](RUNNERS.md)
- [OBSERVABILITY-PLATFORMS.md](OBSERVABILITY-PLATFORMS.md)

Buy the services and build the tasks: the tasks carry the user's design, the services are generic. Favour an off-the-shelf ticket tracker: it is robust, people already know it, and outside users are easy to let in.

### Question every task

For each task, answer:

1. What triggers it?
2. What does it do, and which services does it read and write?
3. What does it trigger next?
4. Where does a human re-enter?
5. What stops two runs doing the same work?
6. Which **Verification Brakes** (Protected Verification Paths, Default-Branch Review Immutability, Rework Cap) constrain its output?

For each ticket source, answer: what stops it filing the same ticket twice?

A design is finished when every slot names a product (or, for the observability platform, a deliberate none) and every task and ticket source has an answer to every question.
