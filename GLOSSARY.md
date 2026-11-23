# ricardobizerra/skills

A collection of modular, human-editable engineering and repository-governance skills that align AI coding agents around disciplined branch management, staged atomic commits, zero-flakiness verification, and immutable review standards.

## Language

### Onboarding & Configuration

**Harness Config**:
The per-repository markdown files under `docs/agents/` (`git-workflow.md`, `commit-pipeline.md`, `verification.md`, `stack.md`, `issue-tracker.md`, `domain.md`) scaffolded by `/setup-rblf-skills` and pointed to from `AGENTS.md` or `CLAUDE.md`.
_Avoid_: plugin settings, agent env, config JSON

**Stack Adapter**:
An auxiliary markdown template bundled inside `/setup-rblf-skills` (`stack-docker-fullstack.md`, `stack-node-ts.md`, `stack-python.md`, `stack-generic.md`) that is lazily loaded only when matching repository signals are detected during setup.
_Avoid_: preset framework, boilerplate generator

### Git & Commit Discipline

**Repository State Gate**:
The mandatory pre-flight check run before any file edit that detects an in-progress git state machine (rebase, merge, cherry-pick, revert, bisect, or detached HEAD) and halts with non-destructive `--continue` or `--abort` options instead of destructive resets.
_Avoid_: dirty tree check, git reset pre-check

**Canonical Topic Branch**:
A short-lived branch cut from a verified-synchronized local trunk (`main`) using one of the seven allowed prefixes (`feature/`, `fix/`, `chore/`, `refactor/`, `docs/`, `test/`, `perf/`) and configured with no upstream tracking reference to the trunk.
_Avoid_: working branch, wip branch, agent branch

**Drift Baseline**:
The commit SHA (`git rev-parse HEAD`) recorded during pre-flight branch classification and re-verified before the first commit and before push to ensure no concurrent session or tool mutated the working branch mid-task.
_Avoid_: base commit, initial hash

**Staged Atomic Pipeline**:
The ordered sequence of single-concern Conventional Commits that separates backend/domain changes, generated backend artifacts, frontend/consumer changes, generated client artifacts, and documentation/ADR updates, executing each layer's validation gate before committing.
_Avoid_: squashed commit, monolithic commit, batch commit

### Verification & Code Review Governance

**Verification Brake**:
A deterministic or structural safeguard in an automated or agentic workflow that prevents defective, unreviewed, or self-weakening changes from promoting to the integration branch or trunk.
_Avoid_: guardrail, soft check

**Default-Branch Review Immutability**:
The rule that code review and verification runs must read review policy and coding standards (`REVIEW.md`, `CODING_STANDARDS.md`) strictly from the remote default branch (`origin/main`), ensuring a branch cannot weaken the rules by which it is evaluated.
_Avoid_: local rules check, branch self-review

**Protected Verification Path**:
A repository file or directory governing CI pipelines, test configurations, linters, review criteria, or core verification skills that automated runs are forbidden from modifying without explicit human escalation and Code Owner review.
_Avoid_: read-only file, locked folder

**Check the Check**:
The verification step of proving a newly added or modified test actively fails when the corresponding feature logic or bug fix is inverted or removed, ruling out tautological or vacuous tests.
_Avoid_: test coverage check, green test run

**Three-Round Fix Cap**:
The hard limit of at most three diagnostic and repair attempts when a verification or test gate fails, after which the agent must halt immediately and escalate structured diagnostics to a human maintainer.
_Avoid_: infinite retry loop, auto-fix loop

### Software Factory Automation

**Rolling Ratchet**:
A scheduled or event-driven software factory task (such as dependency synchronization or tracked skill updates) that maintains a single rolling branch and pull request into the integration branch, automatically resolving deterministic artifact conflicts and escalating manual code conflicts.
_Avoid_: auto-merge bot, background cron job
