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
import { createPgPool } from "../src/lib/pg-pool";

type CoordinateUpdate = {
  slug: string;
  lat: number;
  lng: number;
  latSource: string;
  lngSource: string;
};

function coordinateUpdate(
  slug: string,
  latSource: string,
  lngSource: string,
): CoordinateUpdate {
  return {
    slug,
    lat: Number(latSource),
    lng: Number(lngSource),
    latSource,
    lngSource,
  };
}

/**
 * Coordinates are house-level geocodes for the customer address list.
 * Sukhe-Bator venues use distinct building points (6 / 11а / 18), not a shared centroid.
 */
const coordinateUpdates: CoordinateUpdate[] = [
  coordinateUpdate("sobranie-speshilova", "52.2731252", "104.2923875"),
  coordinateUpdate("zavarka", "52.2765632", "104.3184306"),
  coordinateUpdate("dyadyushka-fugo", "52.2821963", "104.2590692"),
  coordinateUpdate("knyaz-gvidon", "52.2831743", "104.2858043"),
  coordinateUpdate("baikal-severnoe-more", "52.2520097", "104.3212448"),
  coordinateUpdate("mangal", "52.2315254", "104.3155725"),
  coordinateUpdate("butin", "52.2781128", "104.2822746"),
  coordinateUpdate("partizan", "52.2753021", "104.2881413"),
  coordinateUpdate("restoran-ohotnikov", "52.2779532", "104.3365531"),
  coordinateUpdate("vyuga-mayak", "51.8473501", "104.8730536"),
  coordinateUpdate("kitayskiy-ieroglif", "52.2779532", "104.3365531"),
  coordinateUpdate("klyukva-baykalsk", "51.510804", "104.119368"),
  coordinateUpdate("evropa", "52.2746106", "104.3048839"),
  coordinateUpdate("kurbatov", "52.289858", "104.269127"),
  coordinateUpdate("pepel", "52.2855070", "104.2825261"),
  coordinateUpdate("cui-tea", "52.251347", "104.257373"),
  coordinateUpdate("kochevnik", "52.2837445", "104.2836576"),
  coordinateUpdate("pappare", "52.285743", "104.283373"),
  coordinateUpdate("la-premiere", "52.2791024", "104.2788452"),
  coordinateUpdate("prego", "52.2826584", "104.2847184"),
  coordinateUpdate("chento", "52.2756", "104.2867"),
  coordinateUpdate("kruzhal", "52.2756", "104.2867"),
  coordinateUpdate("grot-pervomayskiy", "52.2606340", "104.2415329"),
  coordinateUpdate("red-grot", "52.2476049", "104.3605747"),
  coordinateUpdate("yabloko", "52.2797443", "104.3013649"),
  coordinateUpdate("chempiony", "52.2840621", "104.2869573"),
];

function isValidLat(lat: number) {
  return Number.isFinite(lat) && lat >= -90 && lat <= 90;
}

function isValidLng(lng: number) {
  return Number.isFinite(lng) && lng >= -180 && lng <= 180;
}

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
  const uniqueSlugs = new Set(coordinateUpdates.map((item) => item.slug));
  if (uniqueSlugs.size !== coordinateUpdates.length) {
    throw new Error("Duplicate slugs in coordinate update list");
  }

  for (const item of coordinateUpdates) {
    if (!isValidLat(item.lat) || !isValidLng(item.lng)) {
      throw new Error(`Invalid coordinates for slug ${item.slug}`);
    }
  }

  const existing = await prisma.place.findMany({
    where: { slug: { in: [...uniqueSlugs] } },
    select: { id: true, slug: true, lat: true, lng: true },
  });

  if (existing.length !== coordinateUpdates.length) {
    const found = new Set(existing.map((place) => place.slug));
    const missing = coordinateUpdates
      .filter((item) => !found.has(item.slug))
      .map((item) => item.slug);
    throw new Error(
      `Abort: missing places for slugs: ${missing.join(", ") || "(count mismatch)"}`,
    );
  }

  const bySlug = new Map(existing.map((place) => [place.slug, place]));

  console.log(apply ? "MODE: APPLY" : "MODE: DRY-RUN");
  console.log("slug\tid\told_lat\told_lng\tnew_lat\tnew_lng");

  for (const item of coordinateUpdates) {
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
        item.latSource,
        item.lngSource,
      ].join("\t"),
    );
  }

  console.log(`\nMatched ${coordinateUpdates.length} / ${coordinateUpdates.length}`);

  if (!apply) {
    console.log(
      `\nNo UPDATE executed. Re-run with --apply to write lat/lng only.`,
    );
    return;
  }

  await prisma.$transaction(
    coordinateUpdates.map((item) =>
      prisma.place.update({
        where: { slug: item.slug },
        data: { lat: item.lat, lng: item.lng },
      }),
    ),
  );

  const readBack = await prisma.place.findMany({
    where: { slug: { in: [...uniqueSlugs] } },
    select: { slug: true, lat: true, lng: true },
  });
  const readBySlug = new Map(readBack.map((place) => [place.slug, place]));

  console.log("\nREAD-BACK");
  console.log("slug\tlat\tlng");
  for (const item of coordinateUpdates) {
    const place = readBySlug.get(item.slug);
    if (!place) {
      throw new Error(`Abort after update: missing ${item.slug}`);
    }
    console.log(`${place.slug}\t${place.lat}\t${place.lng}`);
  }
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
