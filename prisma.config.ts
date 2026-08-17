import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * `prisma generate` does not connect to the database, but Prisma 7 still
 * resolves `datasource.url` while loading this config. Amvera (and similar
 * hosts) do not inject secrets during `npm install` / build — only at runtime.
 * Do not use `env("DATABASE_URL")` here: it throws PrismaConfigEnvError.
 *
 * Runtime queries use `process.env.DATABASE_URL` in `src/lib/prisma.ts`.
 * CLI commands that actually talk to Postgres (`migrate`, `db push`, `db seed`)
 * still pick up the real URL when it is present.
 */
const datasourceUrl =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@127.0.0.1:5432/postgres";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: datasourceUrl,
  },
});
