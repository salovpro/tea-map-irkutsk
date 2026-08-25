import { PLACE_LOGO_UPDATES } from "@/lib/place-logo-data";
import { prisma } from "@/lib/prisma";

let syncPromise: Promise<void> | null = null;

function shouldSkipSync() {
  if (process.env.NEXT_PHASE === "phase-production-build") return true;
  if (!process.env.DATABASE_URL) return true;
  return false;
}

async function runPlaceLogoSync() {
  if (shouldSkipSync()) return;

  const slugs = PLACE_LOGO_UPDATES.map((item) => item.slug);
  const existing = await prisma.place.findMany({
    where: { slug: { in: slugs } },
    select: { slug: true, logoUrl: true },
  });
  const bySlug = new Map(existing.map((place) => [place.slug, place]));

  const pending = PLACE_LOGO_UPDATES.filter((item) => {
    const place = bySlug.get(item.slug);
    if (!place) return false;
    return (place.logoUrl ?? null) !== item.logoUrl;
  });

  if (pending.length === 0) {
    console.log("[place-logos] already in sync");
    return;
  }

  await prisma.$transaction(
    pending.map((item) =>
      prisma.place.update({
        where: { slug: item.slug },
        data: { logoUrl: item.logoUrl },
      }),
    ),
  );

  console.log(`[place-logos] updated ${pending.length} places`);
}

/** Idempotent logoUrl write. Safe on first map/catalog/detail load. */
export function syncPlaceLogos(): Promise<void> {
  if (!syncPromise) {
    syncPromise = runPlaceLogoSync().catch((error) => {
      syncPromise = null;
      const message = error instanceof Error ? error.message : "unknown error";
      console.error(`[place-logos] sync failed: ${message}`);
    });
  }
  return syncPromise;
}
