/**
 * Initial catalog rank used only by scripts/init-place-sort-order.ts.
 * Runtime catalog/admin order is Place.sortOrder in PostgreSQL.
 */
export const FEATURED_CATALOG_SLUGS = [
  "sobranie-speshilova",
  "knyaz-gvidon",
  "restoran-ohotnikov",
  "baikal-severnoe-more",
  "chento",
  "prego",
  "vyuga-mayak",
  "mangal",
  "butin",
  "kurbatov",
  "evropa",
  "klyukva-baykalsk",
  "pepel",
  "kitayskiy-ieroglif",
  "pappare",
  "chempiony",
  "kruzhal",
  "red-grot",
  "yabloko",
  "kochevnik",
  "grot-pervomayskiy",
] as const;

const featuredRank = new Map<string, number>(
  FEATURED_CATALOG_SLUGS.map((slug, index) => [slug, index]),
);

type CatalogSortable = {
  slug: string;
  isPremium: boolean;
  createdAt: Date;
};

export function comparePlacesByCatalogOrder(
  a: CatalogSortable,
  b: CatalogSortable,
): number {
  const aRank = featuredRank.get(a.slug) ?? Number.POSITIVE_INFINITY;
  const bRank = featuredRank.get(b.slug) ?? Number.POSITIVE_INFINITY;
  if (aRank !== bRank) return aRank - bRank;

  if (a.isPremium !== b.isPremium) {
    return Number(b.isPremium) - Number(a.isPremium);
  }

  const byCreated = a.createdAt.getTime() - b.createdAt.getTime();
  if (byCreated !== 0) return byCreated;

  return a.slug.localeCompare(b.slug);
}
