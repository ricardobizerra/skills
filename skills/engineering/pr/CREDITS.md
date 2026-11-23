# Credits

This skill combines and specializes concepts from two upstream sources:

1. **[Dex Horthy](https://github.com/dexhorthy)'s [`show-me`](https://github.com/humanlayer/skills/blob/main/plugins/show-me/skills/show-me/SKILL.md) skill** (from [Humanlayer](https://github.com/humanlayer/humanlayer)): The **Summary** section's menu of compact visual representations (pseudocode, call trees, component trees, shallow file trees, Mermaid diagrams, and structural diffs) and placement guidance.
2. **[Matt Pocock](https://github.com/mattpocock)'s [`pr`](https://github.com/mattpocock/skills) skill**: Aiming the `show-me` visual vocabulary at pull request bodies alongside before/after **Evidence** and **Merge Danger** (one-way vs. two-way doors and blast radius).

It has been specialized by [Ricardo Bizerra](https://github.com/ricardobizerra) with:
- **Canonical Bracketed PR Title Taxonomy**: Enforcing `[Feature]`, `[Fix]`, `[Chore]`, `[Refactor]`, `[Docs]`, `[Test]`, `[Perf]`, and `[Release]` prefixes distinct from Conventional Commit messages.
- **5-Section Topic PR & Release PR Templates**: Adding explicit **Verification Gates** checklists (bound to `docs/agents/verification.md` and `/verify` with an honesty invariant that checks off only executed gates) and **References** (Issue tracker + ADR linkage), plus a dedicated **Release PR Template** (`develop` → `main`).
