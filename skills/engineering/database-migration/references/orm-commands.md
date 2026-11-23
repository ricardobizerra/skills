# ORM & Migration Tool Command Reference

Quick reference loaded by `/database-migration` when `docs/agents/stack.md` does not already specify exact migration commands. Prefix commands with `docker compose run --rm <service>` whenever the repository runs inside Docker Compose.

---

## 1. Prisma (`prisma/schema.prisma`)

- **Generate & apply dev migration**:
  `npx prisma migrate dev --name <migration_name>` (or `bun run migration:dev`)
- **Inspect migration status**:
  `npx prisma migrate status`
- **Regenerate Prisma Client**:
  `npx prisma generate` (or `bun run generate:dev`)
- **Format schema**:
  `npx prisma format`
- **Production deployment check**:
  `npx prisma migrate deploy`

---

## 2. Drizzle ORM (`drizzle.config.ts`)

- **Generate SQL migration from schema**:
  `npx drizzle-kit generate`
- **Apply migrations**:
  `npx drizzle-kit migrate`
- **Check migration consistency**:
  `npx drizzle-kit check`

---

## 3. Alembic / SQLAlchemy (`alembic.ini`)

- **Generate revision from models**:
  `alembic revision --autogenerate -m "<description>"`
- **Apply migrations to head**:
  `alembic upgrade head`
- **Test rollback safety (one step back and forward)**:
  `alembic downgrade -1 && alembic upgrade head`

---

## 4. Django ORM (`manage.py`)

- **Generate migration**:
  `python3 manage.py makemigrations <app_label> --name <migration_name>`
- **Inspect generated SQL without applying**:
  `python3 manage.py sqlmigrate <app_label> <migration_number>`
- **Apply migrations**:
  `python3 manage.py migrate`

---

## 5. TypeORM

- **Generate migration from entities**:
  `npx typeorm migration:generate src/migrations/<MigrationName> -d src/data-source.ts`
- **Run migrations**:
  `npx typeorm migration:run -d src/data-source.ts`
- **Revert last migration (local test)**:
  `npx typeorm migration:revert -d src/data-source.ts`
