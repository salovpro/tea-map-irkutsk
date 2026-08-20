/**
 * One-time lat/lng update from the customer coordinate list.
 * Matches by slug only. Does not change names, addresses, or other fields.
 *
 *   npm run update:coordinates -- --dry-run
 *   npm run update:coordinates -- --apply
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { createPgPool } from "../src/lib/pg-pool";

type CoordinateUpdate = {
  slug: string;
  lat: number;
  lng: number;
};

const coordinateUpdates: CoordinateUpdate[] = [
  { slug: "sobranie-speshilova", lat: 52.2732, lng: 104.2915 },
  { slug: "zavarka", lat: 52.2761, lng: 104.318719 },
  { slug: "dyadyushka-fugo", lat: 52.282345, lng: 104.258827 },
  { slug: "knyaz-gvidon", lat: 52.28339, lng: 104.285638 },
  { slug: "baikal-severnoe-more", lat: 52.25208, lng: 104.321129 },
  { slug: "mangal", lat: 52.23155, lng: 104.315551 },
  { slug: "butin", lat: 52.278238, lng: 104.282206 },
  { slug: "partizan", lat: 52.275279, lng: 104.288167 },
  { slug: "restoran-ohotnikov", lat: 52.2779, lng: 104.3364 },
  { slug: "vyuga-mayak", lat: 51.8472, lng: 104.874 },
  { slug: "kitayskiy-ieroglif", lat: 52.2779, lng: 104.3364 },
  { slug: "klyukva-baykalsk", lat: 51.510804, lng: 104.119368 },
  { slug: "evropa", lat: 52.274745, lng: 104.30496 },
  { slug: "kurbatov", lat: 52.289187, lng: 104.26973 },
  { slug: "pepel", lat: 52.285522, lng: 104.282592 },
  { slug: "cui-tea", lat: 52.257, lng: 104.248 },
  { slug: "kochevnik", lat: 52.284, lng: 104.283 },
  { slug: "pappare", lat: 52.2845, lng: 104.281 },
  { slug: "la-premiere", lat: 52.27968, lng: 104.279429 },
  { slug: "prego", lat: 52.2826, lng: 104.2849 },
  { slug: "chento", lat: 52.2753, lng: 104.291 },
  { slug: "kruzhal", lat: 52.2753, lng: 104.291 },
  { slug: "grot-pervomayskiy", lat: 52.260732, lng: 104.241394 },
  { slug: "red-grot", lat: 52.2476, lng: 104.3606 },
  { slug: "yabloko", lat: 52.2797, lng: 104.301291 },
  { slug: "chempiony", lat: 52.2838, lng: 104.2869 },
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
      `Abort: missing places for slugs: ${missing.join(", ") || "(unknown)"}`,
    );
  }

  const bySlug = new Map(existing.map((place) => [place.slug, place]));

  console.log(apply ? "APPLY" : "DRY-RUN");
  console.log("slug\told_lat\told_lng\tnew_lat\tnew_lng");
  for (const item of coordinateUpdates) {
    const place = bySlug.get(item.slug);
    if (!place) {
      throw new Error(`Abort: place not found for slug ${item.slug}`);
    }
    console.log(
      `${item.slug}\t${place.lat}\t${place.lng}\t${item.lat}\t${item.lng}`,
    );
  }

  if (!apply) {
    console.log(
      `\n${coordinateUpdates.length} places ready. Re-run with --apply to write lat/lng.`,
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
