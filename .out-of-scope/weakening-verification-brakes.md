# Out of Scope: Weakening Verification Brakes

**Status:** Rejected (standing decision — see [ADR-0002](../docs/adr/0002-immutable-verification-brakes-and-protected-paths.md))

## What Is Rejected

Proposals to relax or bypass any **Verification Brake** in `/verify`, `/testing`, `/code-review`, or `/software-factory`, including:
- Allowing E2E `retries > 0`, `.skip`, or arbitrary `sleep` / `waitForTimeout` calls.
- Reading `REVIEW.md` or `CODING_STANDARDS.md` from the working branch instead of `origin/<default-branch>`.
- Removing or increasing the **Three-Round Fix Cap**.
- Exempting CI/test configuration paths from **Protected Verification Paths** audits.

## Why

Verification brakes exist specifically to prevent autonomous agents from reward-hacking failing checks. Weakening them undermines the core guarantee of this repository.
