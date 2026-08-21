/**
 * One-time Place lat/lng update from venue addresses.
 * Matches by slug only. Does not change names, addresses, or translations.
 *
 *   npm run update:coordinates -- --dry-run
 *   npm run update:coordinates -- --apply
 *
 * Default (no flags) is dry-run. Never prints DATABASE_URL.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { PLACE_COORDINATE_UPDATES } from "../src/lib/place-coordinate-data";
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
  const uniqueSlugs = new Set(PLACE_COORDINATE_UPDATES.map((item) => item.slug));
  if (uniqueSlugs.size !== PLACE_COORDINATE_UPDATES.length) {
    throw new Error("Duplicate slugs in coordinate update list");
  }

  const existing = await prisma.place.findMany({
    where: { slug: { in: [...uniqueSlugs] } },
    select: { id: true, slug: true, lat: true, lng: true },
  });

  const found = new Set(existing.map((place) => place.slug));
  const missing = PLACE_COORDINATE_UPDATES.filter(
    (item) => !found.has(item.slug),
  ).map((item) => item.slug);
  if (missing.length > 0) {
    throw new Error(`Abort: missing places for slugs: ${missing.join(", ")}`);
  }

  const bySlug = new Map(existing.map((place) => [place.slug, place]));

  console.log(apply ? "MODE: APPLY" : "MODE: DRY-RUN");
  console.log("slug\tid\told_lat\told_lng\tnew_lat\tnew_lng");

  for (const item of PLACE_COORDINATE_UPDATES) {
    const place = bySlug.get(item.slug);
    if (!place) {
      throw new Error(`Abort: place not found for slug ${item.slug}`);
    }
    console.log(
      [
        item.slug,
        place.id,
        place.lat,
        place.lng,
        item.lat,
        item.lng,
      ].join("\t"),
    );
  }

  console.log(
    `\nMatched ${PLACE_COORDINATE_UPDATES.length} / ${PLACE_COORDINATE_UPDATES.length}`,
  );

  if (!apply) {
    console.log(
      `\nNo UPDATE executed. Re-run with --apply to write lat/lng only.`,
    );
    return;
  }

  await prisma.$transaction(
    PLACE_COORDINATE_UPDATES.map((item) =>
      prisma.place.update({
        where: { slug: item.slug },
        data: { lat: item.lat, lng: item.lng },
      }),
    ),
  );

  console.log("Applied lat/lng updates.");
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
