import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import {
  isManagedVenueImageUrl,
  saveVenueImageBytes,
} from "../src/lib/venue-storage";

function isSupabaseStorageUrl(url: string) {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const isSupabaseHost =
      host.endsWith(".supabase.co") || host.endsWith(".supabase.in");
    return isSupabaseHost && parsed.pathname.includes("/storage/");
  } catch {
    return false;
  }
}

async function migrateVenueImages() {
  const places = await prisma.place.findMany({
    select: { id: true, logoUrl: true },
  });

  let skipped = 0;
  let migrated = 0;
  let failed = 0;

  for (const place of places) {
    const logoUrl = place.logoUrl?.trim() ?? "";
    if (!logoUrl) {
      skipped += 1;
      console.log(`[skip] ${place.id} empty logoUrl`);
      continue;
    }

    if (isManagedVenueImageUrl(logoUrl)) {
      skipped += 1;
      console.log(`[skip] ${place.id} already on local media`);
      continue;
    }

    if (!isSupabaseStorageUrl(logoUrl)) {
      skipped += 1;
      console.log(`[skip] ${place.id} not a Supabase Storage URL`);
      continue;
    }

    try {
      const response = await fetch(logoUrl);
      if (!response.ok) {
        failed += 1;
        console.error(
          `[error] ${place.id} download status ${response.status}`,
        );
        continue;
      }

      const declaredMime = response.headers.get("content-type") ?? undefined;
      const bytes = new Uint8Array(await response.arrayBuffer());
      const saved = await saveVenueImageBytes(bytes, declaredMime?.split(";")[0]);

      if (!saved.ok) {
        failed += 1;
        console.error(`[error] ${place.id} ${saved.error}`);
        continue;
      }

      await prisma.place.update({
        where: { id: place.id },
        data: { logoUrl: saved.url },
      });
      migrated += 1;
      console.log(`[ok] ${place.id} -> ${saved.url}`);
    } catch (error) {
      failed += 1;
      const message = error instanceof Error ? error.message : "unknown error";
      console.error(`[error] ${place.id} ${message}`);
    }
  }

  console.log(
    `done skipped=${skipped} migrated=${migrated} failed=${failed} total=${places.length}`,
  );
}

migrateVenueImages()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect?.().catch(() => undefined);
  });
