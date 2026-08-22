import { PLACE_COORDINATE_UPDATES } from "@/lib/place-coordinate-data";
import { prisma } from "@/lib/prisma";

export { PLACE_COORDINATE_UPDATES } from "@/lib/place-coordinate-data";

const COORD_EPSILON = 1e-7;

function sameCoord(a: number, b: number) {
  return Math.abs(a - b) < COORD_EPSILON;
}

let syncPromise: Promise<void> | null = null;

function shouldSkipSync() {
  if (process.env.NEXT_PHASE === "phase-production-build") return true;
  if (!process.env.DATABASE_URL) return true;
  return false;
}

async function runPlaceCoordinateSync() {
  if (shouldSkipSync()) return;

  const slugs = PLACE_COORDINATE_UPDATES.map((item) => item.slug);
  const existing = await prisma.place.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, lat: true, lng: true },
  });
  const bySlug = new Map(existing.map((place) => [place.slug, place]));

  const pending = PLACE_COORDINATE_UPDATES.filter((item) => {
    const place = bySlug.get(item.slug);
    if (!place) return false;
    return !sameCoord(place.lat, item.lat) || !sameCoord(place.lng, item.lng);
  });

  if (pending.length === 0) {
    console.log("[place-coordinates] already in sync");
    return;
  }

  await prisma.$transaction(
    pending.map((item) =>
      prisma.place.update({
        where: { slug: item.slug },
        data: { lat: item.lat, lng: item.lng },
      }),
    ),
  );

  console.log(`[place-coordinates] updated ${pending.length} places`);
}

/** Idempotent lat/lng write. Safe on first map/catalog load. Do not import from instrumentation.ts — webpack would bundle `pg` for Edge and fail on `fs`. */
export function syncPlaceCoordinates(): Promise<void> {
  if (!syncPromise) {
    syncPromise = runPlaceCoordinateSync().catch((error) => {
      syncPromise = null;
      const message = error instanceof Error ? error.message : "unknown error";
      console.error(`[place-coordinates] sync failed: ${message}`);
    });
  }
  return syncPromise;
}
