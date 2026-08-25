import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Locale, PrismaClient } from "../src/generated/prisma/client";
import { createPgPool } from "../src/lib/pg-pool";

async function main() {
  const pool = createPgPool(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  const places = await prisma.place.findMany({
    include: {
      translations: {
        where: { locale: Locale.ru },
        select: { name: true, teaMenu: true },
      },
    },
    orderBy: { createdAt: "asc" },
  });
  for (const place of places) {
    const menu = place.translations[0]?.teaMenu;
    const n = Array.isArray(menu) ? menu.length : 0;
    console.log(`${place.slug}\t${n}\t${place.translations[0]?.name ?? "?"}`);
  }
  await prisma.$disconnect();
  await pool.end();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
