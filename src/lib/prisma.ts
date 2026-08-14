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

  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.pgPool = pool;
    globalForPrisma.pgConnectionString = connectionString;
  }

  return client;
}

export const prisma = getPrismaClient();
