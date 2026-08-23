import { Locale } from "@/generated/prisma/client";
import { PLACE_DESCRIPTION_UPDATES } from "@/lib/place-description-data";
import {
  extractDescriptionBody,
  replaceDescriptionBody,
} from "@/lib/place-description";
import { prisma } from "@/lib/prisma";

let syncPromise: Promise<void> | null = null;

function shouldSkipSync() {
  if (process.env.NEXT_PHASE === "phase-production-build") return true;
  if (!process.env.DATABASE_URL) return true;
  return false;
}

async function runPlaceDescriptionSync() {
  if (shouldSkipSync()) return;

  const slugs = PLACE_DESCRIPTION_UPDATES.map((item) => item.slug);
  const existing = await prisma.place.findMany({
    where: { slug: { in: slugs } },
    select: {
      slug: true,
      translations: {
        select: { id: true, locale: true, description: true },
      },
    },
  });
  const bySlug = new Map(existing.map((place) => [place.slug, place]));

  const pending: { id: string; description: string }[] = [];

  for (const item of PLACE_DESCRIPTION_UPDATES) {
    const place = bySlug.get(item.slug);
    if (!place) continue;

    const bodies: Partial<Record<Locale, string>> = {
      [Locale.ru]: item.ru,
      [Locale.en]: item.en,
      [Locale.zh]: item.zh,
    };

    for (const translation of place.translations) {
      const body = bodies[translation.locale];
      if (!body) continue;
      if (extractDescriptionBody(translation.description) === body) continue;
      pending.push({
        id: translation.id,
        description: replaceDescriptionBody(translation.description, body),
      });
    }
  }

  if (pending.length === 0) {
    console.log("[place-descriptions] already in sync");
    return;
  }

  await prisma.$transaction(
    pending.map((row) =>
      prisma.placeTranslation.update({
        where: { id: row.id },
        data: { description: row.description },
      }),
    ),
  );

  console.log(`[place-descriptions] updated ${pending.length} translations`);
}

/** Idempotent about-text write. Safe on first map/catalog/detail load. */
export function syncPlaceDescriptions(): Promise<void> {
  if (!syncPromise) {
    syncPromise = runPlaceDescriptionSync().catch((error) => {
      syncPromise = null;
      const message = error instanceof Error ? error.message : "unknown error";
      console.error(`[place-descriptions] sync failed: ${message}`);
    });
  }
  return syncPromise;
}
