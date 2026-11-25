# Git Workflow

- **Trunk Branch**: `main`
- **Promotion Topology**: Direct trunk (`main` only; no `develop` branch).
- **Canonical Topic Prefixes**: `feature/`, `fix/`, `chore/`, `refactor/`, `docs/`, `test/`, `perf/`.
- **Branch Cutting**: Cut topic branches from a verified-synchronized local `main` (`git pull --ff-only origin main`) with no upstream tracking reference to `main`.
- **Trunk Sync**: Sync in-progress topic branches via `git pull --no-rebase origin main` (never rebase shared branches).
- **Direct Commits**: Do not commit directly to `main`; open a PR using the 5-section template and a bracketed title (`[Feature] ...`, `[Fix] ...`, etc.).
