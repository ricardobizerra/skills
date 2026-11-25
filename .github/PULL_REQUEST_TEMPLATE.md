<!-- Note: Per CONTRIBUTING.md, direct PRs are restricted to maintainers and invited collaborators. -->

## Summary

- **Goal:** <!-- Concise description of what this change accomplishes -->
- **Affected Skills / Docs:** <!-- e.g., skills/engineering/verify/SKILL.md, docs/adr/0004-... -->

## Evidence

<!-- Before/after behavior, diff highlights, or terminal output proving the fix or new capability -->

## Merge Danger

- **Door Classification:** <!-- One-way door / Two-way door -->
- **Blast Radius:** <!-- Which skills, manifests, or Protected Verification Paths are touched? -->
- **Rollback Plan:** <!-- e.g., git revert <sha> -->

## Verification Gates

- [ ] `node scripts/validate-repo.mjs` passed
- [ ] `node skills/engineering/verify/scripts/verify-smoke.mjs --self-test` passed
- [ ] Cold `/code-review` evaluated against `origin/main:REVIEW.md`

## References

- Closes #<!-- issue number if applicable -->
