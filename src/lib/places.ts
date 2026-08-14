import { Locale } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

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

function extractAddress(description: string): string {
  const match =
    description.match(/Адрес:\s*([^.]+)/i) ??
    description.match(/Address:\s*([^.]+)/i) ??
    description.match(/地址[：:]\s*([^\n.]+)/);

  return match?.[1]?.trim() ?? "";
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

/** Slugs / filters removed — map shows all registered venues. */
export async function getMapPlaces(localeCode: string): Promise<MapPlace[]> {
  const locale = toLocale(localeCode);

  try {
    const places = await prisma.place.findMany({
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
      };
    });
  } catch (error) {
    console.error("Failed to load map places:", error);
    return [];
  }
}

export async function getCatalogPlaces(
  localeCode: string,
): Promise<CatalogPlace[]> {
  const locale = toLocale(localeCode);

  try {
    const places = await prisma.place.findMany({
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
      const teaMenu = normalizeTeaMenu(translation?.teaMenu);

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
      };
    });
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

  const description = translation.description ?? "";

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
    teaMenu: parseSheetTeaMenu(translation.teaMenu),
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
