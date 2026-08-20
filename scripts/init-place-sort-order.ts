/**
 * One-time assignment of places.sort_order = 10, 20, 30...
 * matching the current public catalog order (featured slug rank, then
 * premium, createdAt, slug). Does not change ids/slugs.
 *
 *   npx tsx scripts/init-place-sort-order.ts --dry-run
 *   npx tsx scripts/init-place-sort-order.ts --apply
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Locale, PrismaClient } from "../src/generated/prisma/client";
import { comparePlacesByCatalogOrder } from "../src/lib/catalog-order";
import { createPgPool } from "../src/lib/pg-pool";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const apply = process.argv.includes("--apply");
const pool = createPgPool(connectionString);
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

function sortOrderForIndex(index: number) {
  return (index + 1) * 10;
}

async function main() {
  const places = await prisma.place.findMany({
    select: {
      id: true,
      slug: true,
      isPremium: true,
      createdAt: true,
      translations: {
        where: { locale: Locale.ru },
        select: { name: true },
      },
    },
  });

  const ordered = [...places].sort(comparePlacesByCatalogOrder);

  console.log(apply ? "APPLY" : "DRY-RUN");
  console.log("slug\tname\tsort_order");
  for (const [index, place] of ordered.entries()) {
    const name = place.translations[0]?.name ?? place.slug;
    console.log(`${place.slug}\t${name}\t${sortOrderForIndex(index)}`);
  }

  if (!apply) {
    console.log(
      `\n${ordered.length} places. Re-run with --apply to write sort_order.`,
    );
    return;
  }

  await prisma.$transaction(
    ordered.map((place, index) =>
      prisma.place.update({
        where: { id: place.id },
        data: { sortOrder: sortOrderForIndex(index) },
      }),
    ),
  );

  console.log(`Updated sort_order for ${ordered.length} places.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
