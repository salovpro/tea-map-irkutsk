import { PLACE_TEA_MENU_UPDATES } from "@/lib/place-tea-menu-data";
import { prisma } from "@/lib/prisma";

let syncPromise: Promise<void> | null = null;

function shouldSkipSync() {
  if (process.env.NEXT_PHASE === "phase-production-build") return true;
  if (!process.env.DATABASE_URL) return true;
  return false;
}

function menuSignature(value: unknown): string {
  return JSON.stringify(value ?? []);
}

async function runPlaceTeaMenuSync() {
  if (shouldSkipSync()) return;

  const slugs = PLACE_TEA_MENU_UPDATES.map((item) => item.slug);
  const existing = await prisma.place.findMany({
    where: { slug: { in: slugs } },
    select: {
      slug: true,
      translations: {
        select: { id: true, locale: true, teaMenu: true },
      },
    },
  });
  const bySlug = new Map(existing.map((place) => [place.slug, place]));

  const pending: { id: string; teaMenu: (typeof PLACE_TEA_MENU_UPDATES)[number]["items"] }[] =
    [];

  for (const item of PLACE_TEA_MENU_UPDATES) {
    const place = bySlug.get(item.slug);
    if (!place) continue;

    for (const translation of place.translations) {
      if (menuSignature(translation.teaMenu) === menuSignature(item.items)) {
        continue;
      }
      pending.push({ id: translation.id, teaMenu: item.items });
    }
  }

  if (pending.length === 0) {
    console.log("[place-tea-menus] already in sync");
    return;
  }

  await prisma.$transaction(
    pending.map((row) =>
      prisma.placeTranslation.update({
        where: { id: row.id },
        data: { teaMenu: row.teaMenu },
      }),
    ),
  );

  console.log(`[place-tea-menus] updated ${pending.length} translations`);
}

/** Idempotent tea-menu write. Safe on first map/catalog/detail load. */
export function syncPlaceTeaMenus(): Promise<void> {
  if (!syncPromise) {
    syncPromise = runPlaceTeaMenuSync().catch((error) => {
      syncPromise = null;
      const message = error instanceof Error ? error.message : "unknown error";
      console.error(`[place-tea-menus] sync failed: ${message}`);
    });
  }
  return syncPromise;
}
