/**
 * One-time Place lat/lng update from the customer coordinate list.
 * Matches by slug only. Does not change names, addresses, translations,
 * or any other fields.
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

const coordinateUpdates: CoordinateUpdate[] = [
  coordinateUpdate("sobranie-speshilova", "52.2732", "104.2915"),
  coordinateUpdate("zavarka", "52.276100", "104.318719"),
  coordinateUpdate("dyadyushka-fugo", "52.282345", "104.258827"),
  coordinateUpdate("knyaz-gvidon", "52.283390", "104.285638"),
  coordinateUpdate("baikal-severnoe-more", "52.252080", "104.321129"),
  coordinateUpdate("mangal", "52.231550", "104.315551"),
  coordinateUpdate("butin", "52.278238", "104.282206"),
  coordinateUpdate("partizan", "52.275279", "104.288167"),
  coordinateUpdate("restoran-ohotnikov", "52.277900", "104.336400"),
  coordinateUpdate("vyuga-mayak", "51.847200", "104.874000"),
  coordinateUpdate("kitayskiy-ieroglif", "52.277900", "104.336400"),
  coordinateUpdate("klyukva-baykalsk", "51.510804", "104.119368"),
  coordinateUpdate("evropa", "52.274745", "104.304960"),
  coordinateUpdate("kurbatov", "52.289187", "104.269730"),
  coordinateUpdate("pepel", "52.285522", "104.282592"),
  coordinateUpdate("cui-tea", "52.257", "104.248"),
  coordinateUpdate("kochevnik", "52.2840", "104.2830"),
  coordinateUpdate("pappare", "52.2845", "104.2810"),
  coordinateUpdate("la-premiere", "52.279680", "104.279429"),
  coordinateUpdate("prego", "52.282600", "104.284900"),
  coordinateUpdate("chento", "52.2753", "104.2910"),
  coordinateUpdate("kruzhal", "52.2753", "104.2910"),
  coordinateUpdate("grot-pervomayskiy", "52.260732", "104.241394"),
  coordinateUpdate("red-grot", "52.247600", "104.360600"),
  coordinateUpdate("yabloko", "52.279700", "104.301291"),
  coordinateUpdate("chempiony", "52.283800", "104.286900"),
];

function isValidLat(lat: number) {
  return Number.isFinite(lat) && lat >= -90 && lat <= 90;
}

function isValidLng(lng: number) {
  return Number.isFinite(lng) && lng >= -180 && lng <= 180;
}

function extractAddress(description: string): string {
  const match =
    description.match(/Адрес:\s*([\s\S]*)$/i) ??
    description.match(/Address:\s*([\s\S]*)$/i) ??
    description.match(/地址[：:]\s*([\s\S]*)$/);
  if (!match?.[1]) return "";
  return match[1].replace(/\.\s*$/, "").trim();
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
    include: { translations: true },
    orderBy: { slug: "asc" },
  });

  const existingBySlug = new Map(existing.map((place) => [place.slug, place]));
  const missing = coordinateUpdates
    .filter((item) => !existingBySlug.has(item.slug))
    .map((item) => item.slug);

  if (missing.length > 0 || existing.filter((place) => uniqueSlugs.has(place.slug)).length !== coordinateUpdates.length) {
    throw new Error(
      `Abort: missing places for slugs: ${missing.join(", ") || "(count mismatch)"}`,
    );
  }

  const notInRequest = existing
    .filter((place) => !uniqueSlugs.has(place.slug))
    .map((place) => place.slug);

  console.log(apply ? "MODE: APPLY" : "MODE: DRY-RUN");
  console.log(
    "Requested venue slug\tid\tru title\told_lat\told_lng\tnew_lat\tnew_lng",
  );

  for (const item of coordinateUpdates) {
    const place = existingBySlug.get(item.slug);
    if (!place) {
      throw new Error(`Abort: place not found for slug ${item.slug}`);
    }
    const ru = place.translations.find((translation) => translation.locale === "ru");
    const title = ru?.name ?? "";
    const address = extractAddress(ru?.description ?? "");
    console.log(
      [
        item.slug,
        place.id,
        title.replace(/\t/g, " "),
        place.lat,
        place.lng,
        item.latSource,
        item.lngSource,
        address.replace(/\t/g, " "),
      ].join("\t"),
    );
  }

  console.log(`\nNOT IN REQUEST (unchanged): ${notInRequest.join(", ") || "(none)"}`);
  console.log(`Matched ${coordinateUpdates.length} / ${coordinateUpdates.length}`);

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
