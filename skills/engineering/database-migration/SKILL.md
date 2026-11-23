---
name: database-migration
description: Evolve relational database schemas safely through ORM or SQL migration tools (Prisma, Drizzle, Alembic, TypeORM, Django, Knex, raw SQL) while enforcing domain glossary alignment, expand-and-contract rollback safety, mandatory raw SQL inspection, generated client synchronization, and documentation updates. Make sure to use this skill whenever adding, altering, or dropping database tables, columns, indexes, enums, or constraints, or writing data migrations.
---

# Database Migration & Schema Evolution Skill

## Purpose

Evolve database schemas safely without breaking running deployments, losing production data, or letting ORM client types and documentation drift out of sync with the underlying SQL schema.

---

##When To Use vs. When Not To Use

- **Use whenever**: Adding, altering, renaming, or removing models/tables, columns, relations, foreign keys, indexes, constraints, or enums, or authoring a data-backfill migration.
- **Do not use for**: Query-only service changes that do not alter the database schema, or frontend-only feature work.

---

## 1. Prerequisites & Pre-Migration Safety Assessment

1. **Discover Stack & Migration Runner**:
   - Read `docs/agents/stack.md` (created by [`/setup-rblf-skills`](../setup-rblf-skills/SKILL.md)).
   - If `docs/agents/stack.md` does not exist yet, auto-detect the ORM/migration tool from the repository (`prisma/schema.prisma`, `drizzle.config.*`, `alembic.ini`, `manage.py`, `typeorm`, `knexfile.*`) and check `docker-compose.yml` to determine whether migration commands must run inside a container (`docker compose run --rm <service> ...`).
   - Consult [`references/orm-commands.md`](references/orm-commands.md) for tool-specific generation, inspection, and verification commands.
2. **Ubiquitous Language Alignment (`GLOSSARY.md`)**:
   - Check `GLOSSARY.md` before naming new tables, columns, or enums. Database identifiers live for years; never encode a deprecated synonym into a table or column name.
3. **One-Way vs. Two-Way Door Assessment (Expand-and-Contract)**:
   - **Additive changes** (new table, nullable column, new index) are **two-way doors**.
   - **Destructive or narrowing changes** (dropping a column/table, renaming a column in-place, adding `NOT NULL` without a default on a populated table, changing a column type) are **one-way doors**.
   - For destructive changes on production tables, prefer an **expand-and-contract** sequence (1. add new nullable column & dual-write/backfill → 2. switch reads → 3. drop old column in a subsequent release) or explicitly document the downtime/backfill SQL in the migration and PR (`## Merge Danger`).
4. **Verify Backing Database Availability**:
   - Ensure the local/container database and shadow database are running (e.g., `docker compose up -d postgres`) and `DATABASE_URL` is configured.

---

## 2. Required Execution Steps

### Step 1: Edit the Schema Definition
Update the canonical schema source (e.g., `prisma/schema.prisma`, Drizzle schema files, SQLAlchemy/Django models) with explicit types, nullability, cascade behaviors, and indexes on foreign keys or high-cardinality lookup columns.

### Step 2: Generate the Migration
Run the repository's migration generation command with a descriptive snake_case or kebab-case name:
```bash
# Dockerized Prisma example:
docker compose run --rm api bun run migration:dev -- --name add_benefit_schedules

# See references/orm-commands.md for Drizzle, Alembic, TypeORM, and Django equivalents
```

### Step 3: Mandatory Raw SQL / Migration File Inspection
**Never commit a generated migration without reading the raw SQL (or migration script) line by line.** Verify:
- Did the ORM generate an unintended `DROP TABLE` or `DROP COLUMN` + `ADD COLUMN` instead of `ALTER TABLE ... RENAME`? (This silently wipes existing data!)
- Does adding a `NOT NULL` column to an existing table include a safe `DEFAULT` or preceding backfill `UPDATE` statement?
- Are foreign-key columns accompanied by an index where needed to prevent table scans on joins and deletes?

### Step 4: Regenerate ORM / API Artifacts
Synchronize generated database client types and downstream API/GraphQL schemas:
```bash
# Dockerized fullstack example:
docker compose run --rm api bun run generate:dev
# If GraphQL/API shape changed, also run client codegen via /graphql-codegen:
docker compose run --rm web bun run codegen
```

### Step 5: Update Application Services, Tests & Data-Model Docs
1. Update repositories, services, resolvers/controllers, and test factories/seeders affected by the schema change.
2. Run unit and integration specs ([`/testing`](../testing/SKILL.md)) to verify queries and transaction boundaries against the migrated schema.
3. Update `docs/data-model.md` (or the repository's schema documentation) and record an ADR via [`/documentation-update`](../documentation-update/SKILL.md) if the schema introduces a major domain boundary or storage trade-off.

---

## 3. Validation Checklist

- [ ] Raw migration file inspected for destructive `DROP` statements, table locks, and missing indexes.
- [ ] Generated ORM client and API/GraphQL artifacts are regenerated with zero manual edits in generated directories.
- [ ] Backend unit/integration test suite and build pass (`docker compose run --rm api bun run test && docker compose run --rm api bun run build` or host equivalent).
- [ ] Frontend codegen and build pass if the schema change is exposed through the API.
- [ ] Changes are staged in proper order via [`/conventional-commits`](../conventional-commits/SKILL.md) (Stage 1: schema + migration + service + tests; Stage 2: generated artifacts).

---

## 4. Recovery & Rollback Guidance

- **Never delete or rewrite a migration that has already been merged to `main` or `develop`.** If a merged migration has a flaw, author a new forward corrective migration.
- If local migration state drifts during development on an *unmerged* topic branch, inspect the migration status output before resetting; never run `migrate reset` against a shared or production database.
- For production one-way door migrations, include an explicit rollback SQL snippet or recovery plan in the PR description under `## Merge Danger` ([`/pr`](../pr/SKILL.md)).
