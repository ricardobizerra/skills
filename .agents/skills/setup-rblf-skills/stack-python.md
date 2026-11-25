# Stack Adapter: Python (FastAPI / Django / Flask / Pytest / Alembic)

Loaded lazily by `/setup-rblf-skills` when `pyproject.toml`, `requirements.txt`, `alembic.ini`, or `manage.py` is detected.

---

## 1. Template for `docs/agents/stack.md`

```markdown
# Stack & Execution Environment

## Execution Runner
- **Mode**: `<Dockerized (docker compose run --rm app ...) | Host Python (uv run / poetry run / python3 -m)>`
- **Python Invocation Rule**: Always use `python3` (or `uv run python3` / `poetry run python3`), never bare `python`.

## Command Matrix
- **Lint & Format**: `<ruff check . && ruff format --check .>`
- **Typecheck**: `<mypy . | pyright>`
- **Unit & Integration Tests**: `<pytest -o retries=0>`
- **Database Migrations**: `<alembic revision --autogenerate -m "..." && alembic upgrade head | python3 manage.py makemigrations && python3 manage.py migrate>`
```

---

## 2. Template for `docs/agents/commit-pipeline.md`

```markdown
# Staged Atomic Commit Pipeline

Stage, validate, and commit changes in dependency order (skipping stages with no modified files):

| Stage | Scope & Files | Commit Prefix Example | Pre-Commit Validation Gate |
| :--- | :--- | :--- | :--- |
| **Stage 1: Schema & Migrations** (if modified) | `alembic/versions/**`, `**/migrations/**`, `models.py` | `feat(db/<domain>): ...` | Inspect generated migration SQL/Python + run migration upgrade & downgrade test |
| **Stage 2: Domain, API Logic & Specs** | `app/**`, `src/**`, `tests/**` | `feat(<domain>): ...` or `fix(<domain>): ...` | `<ruff check . && mypy . && pytest>` |
| **Stage 3: Generated Schemas / Clients** (if applicable) | `openapi.json`, `schema.graphql`, `clients/**` | `chore(api): update generated schema` | Regenerate schema and verify zero git diff |
| **Stage 4: Documentation & ADRs** | `docs/**`, `README.md`, `GLOSSARY.md`, `AGENTS.md` | `docs(adr): ...` or `docs: ...` | Verify all relative markdown links resolve |
```

---

## 3. Template for `docs/agents/verification.md`

```markdown
# Verification & Review Governance

## Verification Gates (`/verify`)
1. **Static Gates**: `<ruff check . && ruff format --check . && mypy .>`
2. **Unit & Integration Suite**: `<pytest>`
3. **Smoke Probe** (if HTTP/GraphQL service): `node .agents/skills/verify/scripts/verify-smoke.mjs --url http://localhost:8000/health`
4. **End-to-End Suite (Zero Retries)**: `<pytest tests/e2e>` or `<npx playwright test --retries=0>`

## Immutable Default-Branch Review Policy (`/code-review`)
- **Default Branch**: `origin/main`
- **Immutable Standards Files**: Load `REVIEW.md`, `CODING_STANDARDS.md`, or `CONTRIBUTING.md` via `git show origin/main:<file>` when present.
- **Protected Verification Paths**:
  - `REVIEW.md`, `CODING_STANDARDS.md`, `AGENTS.md`, `CLAUDE.md`
  - `.github/**`, `pyproject.toml` (linter/pytest sections), `conftest.py`
  - `.agents/skills/{verify,code-review,testing,pr,git-branching,conventional-commits}/**`
- **Zero-Flakiness Rules**: Zero `pytest.mark.skip` / `xfail` workarounds, zero retries (`flaky` / `rerunfailures` disabled), zero arbitrary `time.sleep()` in tests, "Check the Check" failure verification, and a strict **3-Round Fix Cap**.
```

---

## 4. Template for `docs/agents/git-workflow.md`

```markdown
# Git Workflow & Branching Topology

- **Trunk Branch**: `main` (never edit, commit, or push directly on `main`).
- **Integration Branch**: `<develop | none (single-trunk)>`
- **Branch Creation**: `git fetch origin main && git checkout main && git merge --ff-only origin/main && git checkout -b <prefix>/<slug> main`. Assert `<branch>@{upstream}` does not resolve.
- **In-Flight Sync**: `git pull --no-rebase origin main` (never rebase published branches, never force-push).
- **Canonical Prefixes**: `feature/`, `fix/`, `chore/`, `refactor/`, `docs/`, `test/`, `perf/`.
```
