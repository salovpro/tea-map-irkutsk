import { Locale } from "@/generated/prisma/client";
import { PLACE_DESCRIPTION_UPDATES } from "@/lib/place-description-data";
import {
  composePlaceDescription,
  extractAddress,
  extractDescriptionBody,
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
        select: { id: true, locale: true, name: true, description: true },
      },
    },
  });
  const bySlug = new Map(existing.map((place) => [place.slug, place]));

  const pending: { id: string; name?: string; description: string }[] = [];

  for (const item of PLACE_DESCRIPTION_UPDATES) {
    const place = bySlug.get(item.slug);
    if (!place) continue;

    for (const translation of place.translations) {
      const body =
        translation.locale === Locale.ru
          ? item.ru
          : translation.locale === Locale.en
            ? item.en
            : translation.locale === Locale.zh
              ? item.zh
              : undefined;
      if (!body) continue;

      const localizedAddress =
        translation.locale === Locale.en
          ? item.addressEn
          : translation.locale === Locale.zh
            ? item.addressZh
            : undefined;
      const address =
        localizedAddress?.trim() ||
        extractAddress(translation.description) ||
        "";
      const nextDescription = address
        ? composePlaceDescription(
            body,
            address,
            translation.locale as "ru" | "en" | "zh",
          )
        : body.trim();

      const nextName =
        translation.locale === Locale.en
          ? item.nameEn
          : translation.locale === Locale.zh
            ? item.nameZh
            : undefined;

      const nameChanged =
        Boolean(nextName) && nextName !== translation.name;
      const descriptionChanged =
        extractDescriptionBody(translation.description) !==
          extractDescriptionBody(nextDescription) ||
        extractAddress(translation.description) !== extractAddress(nextDescription);

      if (!nameChanged && !descriptionChanged) continue;

      pending.push({
        id: translation.id,
        ...(nextName ? { name: nextName } : {}),
        description: nextDescription,
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
        data: {
          description: row.description,
          ...(row.name ? { name: row.name } : {}),
        },
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
