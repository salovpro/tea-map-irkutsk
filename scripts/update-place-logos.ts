/**
 * Apply venue logos from place-logo-data.ts to the local DB.
 *
 *   npx tsx scripts/update-place-logos.ts --dry-run
 *   npx tsx scripts/update-place-logos.ts --apply
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { PLACE_LOGO_UPDATES } from "../src/lib/place-logo-data";
import { createPgPool } from "../src/lib/pg-pool";

const apply = process.argv.includes("--apply");

async function main() {
  const pool = createPgPool(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    console.log(apply ? "MODE: APPLY" : "MODE: DRY-RUN");
    console.log("");

    let updated = 0;
    let missing = 0;
    let unchanged = 0;

    for (const item of PLACE_LOGO_UPDATES) {
      const place = await prisma.place.findUnique({
        where: { slug: item.slug },
        select: { slug: true, logoUrl: true },
      });

      if (!place) {
        missing += 1;
        console.log(`MISSING: ${item.slug}`);
        continue;
      }

      if ((place.logoUrl ?? null) === item.logoUrl) {
        unchanged += 1;
        console.log(`OK: ${item.slug} ${item.logoUrl}`);
        continue;
      }

      console.log(
        `${apply ? "UPDATE" : "DRY"}: ${item.slug} ${place.logoUrl ?? "null"} -> ${item.logoUrl}`,
      );

      if (!apply) continue;

      await prisma.place.update({
        where: { slug: item.slug },
        data: { logoUrl: item.logoUrl },
      });
      updated += 1;
    }

    console.log("");
    console.log(`VENUES: ${PLACE_LOGO_UPDATES.length}`);
    console.log(`MISSING: ${missing}`);
    console.log(`UNCHANGED: ${unchanged}`);
    if (apply) console.log(`UPDATED: ${updated}`);
    else console.log("No UPDATE executed.");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : "unknown error");
  process.exit(1);
});
