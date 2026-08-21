import { Locale } from "@/generated/prisma/client";
import {
  isHiddenPublicSlug,
  publicPlaceWhere,
  sortPlacesByCatalogOrder,
} from "@/lib/catalog-order";
import { syncPlaceCoordinates } from "@/lib/place-coordinates";
import { prisma } from "@/lib/prisma";

export type TeaMenuStats = {
  teaItemsCount: number;
  averageCheck: number | null;
};

export type MapPlace = {
  id: string;
  slug: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  coordinates: [number, number];
  isPremium: boolean;
  logoUrl: string | null;
  ratingAvg: number | null;
  teaItemsCount: number;
  averageCheck: number | null;
};

export type CatalogPlace = {
  id: string;
  slug: string;
  name: string;
  address: string;
  phone: string;
  website: string;
  logoUrl: string | null;
  isPremium: boolean;
  hasAuthorTea: boolean;
  coordinates: [number, number];
  teaMenu: { name: string; note?: string }[];
  description: string;
  ratingAvg: number | null;
  teaItemsCount: number;
  averageCheck: number | null;
};

/** Minimal place payload to open the preview sheet before details load. */
export type PlaceSheetSeed = {
  id: string;
  name: string;
  description: string;
  address: string;
  phone: string;
  website: string;
  logoUrl: string | null;
  isPremium: boolean;
  coordinates: [number, number];
  ratingAvg: number | null;
  teaItemsCount: number;
  averageCheck: number | null;
};

export type PlaceSheetTeaItem = {
  title: string;
  category?: string;
  price?: number;
  volume?: string;
  description?: string;
};

export type PlaceSheetReview = {
  id: string;
  authorName: string;
  rating: number;
  text: string;
  createdAt: string;
};

export type PlaceSheetDetail = PlaceSheetSeed & {
  teaMenu: PlaceSheetTeaItem[];
  reviews: PlaceSheetReview[];
};

type TranslationRow = {
  locale: Locale;
  name: string;
  description: string;
  teaMenu: unknown;
};

function toLocale(value: string): Locale {
  if (value === "en") return Locale.en;
  if (value === "zh") return Locale.zh;
  return Locale.ru;
}

/** Prefer current locale; fall back to Russian when a translation is missing. */
export function pickTranslation<T extends { locale: Locale }>(
  translations: T[],
  locale: Locale,
): T | undefined {
  return (
    translations.find((item) => item.locale === locale) ??
    translations.find((item) => item.locale === Locale.ru) ??
    translations[0]
  );
}

function translationFilter(locale: Locale) {
  if (locale === Locale.ru) {
    return { locale: Locale.ru };
  }

  return {
    OR: [{ locale }, { locale: Locale.ru }],
  };
}

function averageRating(reviews: { rating: number }[]): number | null {
  if (reviews.length === 0) return null;
  const sum = reviews.reduce((total, review) => total + review.rating, 0);
  return Math.round((sum / reviews.length) * 10) / 10;
}

/**
 * Pull the venue address from a localized description.
 * Addresses often start with abbreviations like "г. Иркутск" — never treat
 * those periods as the end of the address value.
 */
export function extractAddress(description: string): string {
  const match =
    description.match(/Адрес:\s*([\s\S]*)$/i) ??
    description.match(/Address:\s*([\s\S]*)$/i) ??
    description.match(/地址[：:]\s*([\s\S]*)$/);

  if (!match?.[1]) return "";

  return match[1].replace(/\.\s*$/, "").trim();
}

function normalizeTeaMenu(value: unknown): { name: string; note?: string }[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const row = item as Record<string, unknown>;
    const name = String(row.name ?? row.title ?? "").trim();
    if (!name) return [];

    const note = row.note ?? row.category;
    const price = row.price;
    const volume = row.volume;

    const parts = [
      note != null ? String(note) : null,
      volume != null ? String(volume) : null,
      price != null && price !== "" ? `${price} ₽` : null,
    ].filter(Boolean);

    return [
      {
        name,
        note: parts.length > 0 ? parts.join(" · ") : undefined,
      },
    ];
  });
}

/** Count menu items and average price from the translation JSON menu. */
export function summarizeTeaMenu(value: unknown): TeaMenuStats {
  if (!Array.isArray(value)) {
    return { teaItemsCount: 0, averageCheck: null };
  }

  const prices: number[] = [];
  let teaItemsCount = 0;

  for (const item of value) {
    if (typeof item !== "object" || item === null) continue;
    const row = item as Record<string, unknown>;
    const title = String(row.title ?? row.name ?? "").trim();
    if (!title) continue;

    teaItemsCount += 1;
    const price = typeof row.price === "number" ? row.price : Number(row.price);
    if (Number.isFinite(price) && price > 0) {
      prices.push(price);
    }
  }

  if (teaItemsCount === 0 || prices.length === 0) {
    return { teaItemsCount, averageCheck: null };
  }

  const sum = prices.reduce((total, price) => total + price, 0);
  return {
    teaItemsCount,
    averageCheck: Math.round(sum / teaItemsCount),
  };
}

function parseSheetTeaMenu(value: unknown): PlaceSheetTeaItem[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (typeof item !== "object" || item === null) return [];
    const row = item as Record<string, unknown>;
    const title = String(row.title ?? row.name ?? "").trim();
    if (!title) return [];

    return [
      {
        title,
        category:
          row.category != null
            ? String(row.category)
            : row.note != null
              ? String(row.note)
              : undefined,
        price: typeof row.price === "number" ? row.price : undefined,
        volume: row.volume != null ? String(row.volume) : undefined,
        description:
          row.description != null ? String(row.description) : undefined,
      },
    ];
  });
}

function classifyPlacesLoadError(error: unknown): "missing_database_url" | "database_unavailable" {
  const message = error instanceof Error ? error.message : String(error);
  if (message.includes("DATABASE_URL is not set")) {
    return "missing_database_url";
  }
  return "database_unavailable";
}

export class PlacesLoadError extends Error {
  readonly code: "missing_database_url" | "database_unavailable";

  constructor(code: "missing_database_url" | "database_unavailable") {
    super(code);
    this.name = "PlacesLoadError";
    this.code = code;
  }
}

/** Public map: all registered venues except those removed from the tea map. */
export async function getMapPlaces(localeCode: string): Promise<MapPlace[]> {
  const locale = toLocale(localeCode);

  try {
    await syncPlaceCoordinates();
    const places = await prisma.place.findMany({
      where: publicPlaceWhere,
      include: {
        translations: {
          where: translationFilter(locale),
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: [{ isPremium: "desc" }, { createdAt: "asc" }],
    });

    return places.map((place) => {
      const translation = pickTranslation(
        place.translations as TranslationRow[],
        locale,
      );
      const description = translation?.description ?? "";
      const { teaItemsCount, averageCheck } = summarizeTeaMenu(
        translation?.teaMenu,
      );

      return {
        id: place.id,
        slug: place.slug,
        name: translation?.name || "Без названия",
        description,
        address: extractAddress(description),
        phone: place.phone ?? "",
        website: place.website ?? "",
        coordinates: [place.lat, place.lng] as [number, number],
        isPremium: place.isPremium,
        logoUrl: place.logoUrl,
        ratingAvg: averageRating(place.reviews),
        teaItemsCount,
        averageCheck,
      };
    });
  } catch (error) {
    const code = classifyPlacesLoadError(error);
    const name = error instanceof Error ? error.name : "UnknownError";
    console.error(`[getMapPlaces] ${code} (${name})`);
    throw new PlacesLoadError(code);
  }
}

export async function getCatalogPlaces(
  localeCode: string,
): Promise<CatalogPlace[]> {
  const locale = toLocale(localeCode);

  try {
    await syncPlaceCoordinates();
    const places = await prisma.place.findMany({
      where: publicPlaceWhere,
      include: {
        translations: {
          where: translationFilter(locale),
        },
        reviews: {
          select: { rating: true },
        },
      },
      orderBy: [{ isPremium: "desc" }, { createdAt: "asc" }],
    });

    const mapped = places.map((place) => {
      const translation = pickTranslation(
        place.translations as TranslationRow[],
        locale,
      );
      const description = translation?.description ?? "";
      const teaMenu = normalizeTeaMenu(translation?.teaMenu);
      const { teaItemsCount, averageCheck } = summarizeTeaMenu(
        translation?.teaMenu,
      );

      return {
        id: place.id,
        slug: place.slug,
        name: translation?.name || "Без названия",
        address: extractAddress(description),
        phone: place.phone ?? "",
        website: place.website ?? "",
        logoUrl: place.logoUrl,
        isPremium: place.isPremium,
        hasAuthorTea: teaMenu.length > 0,
        coordinates: [place.lat, place.lng] as [number, number],
        teaMenu,
        description,
        ratingAvg: averageRating(place.reviews),
        teaItemsCount,
        averageCheck,
      };
    });

    return sortPlacesByCatalogOrder(mapped);
  } catch (error) {
    console.error("Failed to load catalog places:", error);
    return [];
  }
}

export async function getPlaceSheetDetail(
  id: string,
  localeCode: string,
): Promise<PlaceSheetDetail | null> {
  const place = await getPlaceById(id, localeCode);
  const translation = place?.translations?.[0];

  if (!place || !translation) return null;
  if (isHiddenPublicSlug(place.slug)) return null;

  const description = translation.description ?? "";
  const teaMenu = parseSheetTeaMenu(translation.teaMenu);
  const { teaItemsCount, averageCheck } = summarizeTeaMenu(translation.teaMenu);

  return {
    id: place.id,
    name: translation.name || "Без названия",
    description,
    address: extractAddress(description),
    phone: place.phone ?? "",
    website: place.website ?? "",
    logoUrl: place.logoUrl,
    isPremium: place.isPremium,
    coordinates: [place.lat, place.lng],
    ratingAvg: averageRating(place.reviews),
    teaItemsCount,
    averageCheck,
    teaMenu,
    reviews: place.reviews.map((review) => ({
      id: review.id,
      authorName: review.authorName,
      rating: review.rating,
      text: review.text,
      createdAt: review.createdAt.toISOString(),
    })),
  };
}

export async function getPlaceById(id: string, localeCode: string) {
  const locale = toLocale(localeCode);

  try {
    const place = await prisma.place.findUnique({
      where: { id },
      include: {
        translations: {
          where: translationFilter(locale),
        },
        reviews: {
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!place) return null;

    const translation = pickTranslation(place.translations, locale);

    return {
      ...place,
      translations: translation ? [translation] : [],
    };
  } catch (error) {
    console.error("Failed to load place:", error);
    return null;
  }
}

export async function getPlaceBySlug(slug: string, localeCode: string) {
  const locale = toLocale(localeCode);

  try {
    const place = await prisma.place.findUnique({
      where: { slug },
      include: {
        translations: {
          where: translationFilter(locale),
        },
        reviews: {
          orderBy: { createdAt: "desc" },
          take: 5,
        },
      },
    });

    if (!place) return null;

    const translation = pickTranslation(place.translations, locale);

    return {
      ...place,
      translations: translation ? [translation] : [],
    };
  } catch (error) {
    console.error("Failed to load place:", error);
    return null;
  }
}

export type RelatedPlaceCard = {
  id: string;
  name: string;
  address: string;
  logoUrl: string | null;
  isPremium: boolean;
};

export async function getRelatedPlaces(
  excludeId: string,
  localeCode: string,
  limit = 4,
): Promise<RelatedPlaceCard[]> {
  const locale = toLocale(localeCode);

  try {
    const places = await prisma.place.findMany({
      where: { id: { not: excludeId }, ...publicPlaceWhere },
      include: {
        translations: {
          where: translationFilter(locale),
        },
      },
      orderBy: [{ isPremium: "desc" }, { createdAt: "asc" }],
    });

    return sortPlacesByCatalogOrder(places)
      .slice(0, limit)
      .map((place) => {
        const translation = pickTranslation(
          place.translations as TranslationRow[],
          locale,
        );
        const description = translation?.description ?? "";

        return {
          id: place.id,
          name: translation?.name || "Без названия",
          address: extractAddress(description),
          logoUrl: place.logoUrl,
          isPremium: place.isPremium,
        };
      });
  } catch (error) {
    console.error("Failed to load related places:", error);
    return [];
  }
}
