"use client";

import { PlacesCatalog } from "@/components/PlacesCatalog";
import { useFavorites } from "@/hooks/useFavorites";
import type { CatalogPlace } from "@/lib/places";
import { Heart } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo } from "react";
import { Link } from "@/i18n/navigation";

type FavoritesClientProps = {
  places: CatalogPlace[];
};

export function FavoritesClient({ places }: FavoritesClientProps) {
  const t = useTranslations("FavoritesPage");
  const { favoriteIds, ready } = useFavorites();

  const favoritePlaces = useMemo(() => {
    if (!ready || favoriteIds.length === 0) return [];

    const byId = new Map(places.map((place) => [place.id, place]));
    return favoriteIds
      .map((id) => byId.get(id))
      .filter((place): place is CatalogPlace => Boolean(place));
  }, [favoriteIds, places, ready]);

  if (!ready) {
    return (
      <p className="py-12 text-center text-sm text-slate-400">{t("loading")}</p>
    );
  }

  if (favoritePlaces.length === 0) {
    return (
      <div className="flex flex-col items-center gap-6 rounded-3xl bg-white px-6 py-14 text-center shadow-sm">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50">
          <Heart className="h-7 w-7 text-red-400" strokeWidth={1.75} aria-hidden />
        </div>
        <div className="flex max-w-sm flex-col gap-3">
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-slate-900">
            {t("emptyTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
            {t("emptyDescription")}
          </p>
        </div>
        <Link
          href="/places"
          className="inline-flex items-center justify-center rounded-xl bg-amber-950 px-6 py-3.5 text-sm font-medium tracking-wide text-slate-50 transition-colors hover:bg-amber-900"
        >
          {t("browsePlaces")}
        </Link>
      </div>
    );
  }

  return <PlacesCatalog places={favoritePlaces} />;
}
