/**
 * Apply tea menus from place-tea-menu-data.ts to the local DB.
 *
 *   npm run update:tea-menus -- --dry-run
 *   npm run update:tea-menus -- --apply
 *
 * Writes RU from `items`. Writes EN/ZH only when `itemsEn` / `itemsZh` are set.
 */
import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { PLACE_TEA_MENU_UPDATES } from "../src/lib/place-tea-menu-data";
import { createPgPool } from "../src/lib/pg-pool";

const apply = process.argv.includes("--apply");

async function main() {
  const pool = createPgPool(process.env.DATABASE_URL!);
  const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

  try {
    console.log(apply ? "MODE: APPLY" : "MODE: DRY-RUN");
    console.log("");

    let updated = 0;
    let missing = 0;

    for (const item of PLACE_TEA_MENU_UPDATES) {
      const place = await prisma.place.findUnique({
        where: { slug: item.slug },
        select: {
          id: true,
          slug: true,
          translations: {
            select: { id: true, locale: true, name: true, teaMenu: true },
          },
        },
      });

      if (!place) {
        missing += 1;
        console.log(`MISSING: ${item.slug}`);
        continue;
      }

      const ru = place.translations.find((t) => t.locale === "ru");
      const oldCount = Array.isArray(ru?.teaMenu) ? ru!.teaMenu.length : 0;
      const locales = [
        "ru",
        item.itemsEn ? "en" : null,
        item.itemsZh ? "zh" : null,
      ].filter(Boolean);
      console.log(
        `- ${item.slug} / ${ru?.name ?? "?"} : ${oldCount} -> ${item.items.length} teas [${locales.join(", ")}]`,
      );

      if (!apply) continue;

      for (const translation of place.translations) {
        const nextMenu =
          translation.locale === "ru"
            ? item.items
            : translation.locale === "en"
              ? item.itemsEn
              : translation.locale === "zh"
                ? item.itemsZh
                : undefined;
        if (!nextMenu) continue;

        await prisma.placeTranslation.update({
          where: { id: translation.id },
          data: { teaMenu: nextMenu },
        });
        updated += 1;
      }
    }

    console.log("");
    console.log(`VENUES: ${PLACE_TEA_MENU_UPDATES.length}`);
    console.log(`MISSING: ${missing}`);
    if (apply) console.log(`TRANSLATIONS UPDATED: ${updated}`);
    else console.log("No UPDATE executed.");
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
