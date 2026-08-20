/**
 * Explicit catalog rank for the customer business order.
 * Unlisted places keep their incoming (query) order after this list.
 * Do not sort by localized display titles.
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

export function catalogRank(slug: string): number {
  return featuredRank.get(slug) ?? FEATURED_CATALOG_SLUGS.length;
}

/** Stable sort: featured slugs first, then original order for everyone else. */
export function sortPlacesByCatalogOrder<T extends { slug: string }>(
  places: readonly T[],
): T[] {
  return places
    .map((place, index) => ({ place, index }))
    .sort((a, b) => {
      const rankDiff = catalogRank(a.place.slug) - catalogRank(b.place.slug);
      if (rankDiff !== 0) return rankDiff;
      return a.index - b.index;
    })
    .map(({ place }) => place);
}
