import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pgPool: Pool | undefined;
  pgConnectionString: string | undefined;
};

function createPrismaClient(connectionString: string) {
  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  const adapter = new PrismaPg(pool);
  return { client: new PrismaClient({ adapter }), pool };
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
