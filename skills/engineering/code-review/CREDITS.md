# Credits

This skill is adapted from [Matt Pocock](https://github.com/mattpocock)'s [`code-review`](https://github.com/mattpocock/skills/tree/main/skills/engineering/code-review) skill in `mattpocock/skills`.

The parallel two-axis review architecture (**Standards** vs. **Spec** sub-agents) and the 12 Fowler code smells baseline come from `mattpocock/skills`.

It has been specialized by [Ricardo Bizerra](https://github.com/ricardobizerra) with:
- **Default-Branch Review Immutability**: Mandating that `REVIEW.md` and `CODING_STANDARDS.md` be loaded strictly from `origin/main` (`git show origin/main:REVIEW.md`) so a branch under review cannot weaken its own evaluation rules.
- **Protected Verification Paths Auditing**: Flagging any edits to CI workflows, linter/test configurations, or core verification skills as `HIGH RISK` requiring explicit Code Owner sign-off, and checking for zero-flakiness violations (`.skip`, `retries > 0`, `waitForTimeout`).
