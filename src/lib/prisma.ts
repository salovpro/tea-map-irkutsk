import { PrismaClient } from "@/generated/prisma/client";
import { createPgPool } from "@/lib/pg-pool";
import { PrismaPg } from "@prisma/adapter-pg";
import type { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
  pgConnectionString: string | undefined;
};

let sortOrderReady: Promise<void> | null = null;

function shouldSkipSchemaEnsure() {
  if (process.env.NEXT_PHASE === "phase-production-build") return true;
  if (!process.env.DATABASE_URL) return true;
  return false;
}

/** Idempotent. Amvera may not have run the sort_order migration yet. */
function ensurePlaceSortOrderColumn(client: PrismaClient) {
  if (shouldSkipSchemaEnsure()) return Promise.resolve();
  if (!sortOrderReady) {
    sortOrderReady = (async () => {
      await client.$executeRawUnsafe(
        `ALTER TABLE "places" ADD COLUMN IF NOT EXISTS "sort_order" INTEGER NOT NULL DEFAULT 0`,
      );
      await client.$executeRawUnsafe(
        `CREATE INDEX IF NOT EXISTS "places_sort_order_idx" ON "places"("sort_order")`,
      );
    })().catch((error) => {
      sortOrderReady = null;
      const message = error instanceof Error ? error.message : "unknown error";
      console.error(`[prisma] sort_order ensure failed: ${message}`);
    });
  }
  return sortOrderReady;
}

function createPrismaClient(connectionString: string) {
  const pool = createPgPool(connectionString);

  const adapter = new PrismaPg(pool);
  const base = new PrismaClient({ adapter });
  const client = base.$extends({
    query: {
      place: {
        async $allOperations({ args, query }) {
          await ensurePlaceSortOrderColumn(base);
          return query(args);
        },
      },
    },
  }) as unknown as PrismaClient;
  return { client, pool };
}

function getPrismaClient() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const connectionChanged =
    globalForPrisma.pgConnectionString !== connectionString;

  if (globalForPrisma.prisma && !connectionChanged) {
    return globalForPrisma.prisma;
  }

  if (connectionChanged && globalForPrisma.pgPool) {
    void globalForPrisma.pgPool.end().catch(() => undefined);
  }

  const { client, pool } = createPrismaClient(connectionString);
  globalForPrisma.prisma = client;
  globalForPrisma.pgPool = pool;
  globalForPrisma.pgConnectionString = connectionString;

  return client;
}

/**
 * Lazy client: `prisma generate` / Next.js "collecting page data" import this
 * module at build time, when Amvera has not injected DATABASE_URL yet.
 * Connect only on first real query; runtime still requires DATABASE_URL.
 */
export const prisma: PrismaClient = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, receiver);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
