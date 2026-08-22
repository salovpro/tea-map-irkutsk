/**
 * One-time Place.sortOrder init from the current public catalog order
 * (featured slug list, then remaining in query order).
 *
 *   npm run update:sort-order -- --dry-run
 *   npm run update:sort-order -- --apply
 *
 * Default is dry-run. Never prints DATABASE_URL. Does not run automatically.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import {
  CATALOG_ORDER_BY,
  orderPlacesForCatalog,
} from "../src/lib/catalog-order";
import { createPgPool } from "../src/lib/pg-pool";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const apply = process.argv.includes("--apply");
const dryRunFlag = process.argv.includes("--dry-run");

if (apply && dryRunFlag) {
  throw new Error("Use either --dry-run or --apply, not both");
}

const pool = createPgPool(connectionString);
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

async function main() {
  const places = await prisma.place.findMany({
    select: { id: true, slug: true, sortOrder: true, createdAt: true },
    orderBy: CATALOG_ORDER_BY,
  });

  const ordered = orderPlacesForCatalog(places);
  const next = ordered.map((place, index) => ({
    id: place.id,
    slug: place.slug,
    oldSortOrder: place.sortOrder,
    sortOrder: (index + 1) * 10,
  }));

  console.log(apply ? "MODE: APPLY" : "MODE: DRY-RUN");
  console.log("slug\tid\told_sort_order\tnew_sort_order");
  for (const row of next) {
    console.log(
      [row.slug, row.id, row.oldSortOrder, row.sortOrder].join("\t"),
    );
  }
  console.log(`\nMatched ${next.length} places`);

  if (!apply) {
    console.log("\nNo UPDATE executed. Re-run with --apply to write sortOrder only.");
    return;
  }

  await prisma.$transaction(
    next.map((row) =>
      prisma.place.update({
        where: { id: row.id },
        data: { sortOrder: row.sortOrder },
      }),
    ),
  );

  console.log("Applied sortOrder values.");
}

main()
  .catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
