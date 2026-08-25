"use client";

import { PlacesList } from "@/components/PlacesList";
import { useNearestPlaceId } from "@/hooks/useNearestPlaceId";
import type { CatalogPlace } from "@/lib/places";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type PlacesCatalogProps = {
  places: CatalogPlace[];
  /** When set, nearest badge is computed against this full set (e.g. all venues on Favorites). */
  nearestFromPlaces?: CatalogPlace[];
};

export function PlacesCatalog({
  places,
  nearestFromPlaces,
}: PlacesCatalogProps) {
  const t = useTranslations("PlacesPage");
  const [query, setQuery] = useState("");
  const nearestPlaceId = useNearestPlaceId(nearestFromPlaces ?? places);

  const filteredPlaces = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (normalizedQuery.length === 0) return places;

    return places.filter(
      (place) =>
        place.name.toLowerCase().includes(normalizedQuery) ||
        place.address.toLowerCase().includes(normalizedQuery),
    );
  }, [places, query]);

  return (
    <div className="flex flex-col gap-8">
      <label className="flex flex-col gap-2">
        <span className="text-xs font-medium uppercase tracking-[0.14em] text-slate-500">
          {t("searchLabel")}
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("searchPlaceholder")}
          className="w-full rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-amber-900/30"
        />
      </label>

      {filteredPlaces.length > 0 ? (
        <PlacesList places={filteredPlaces} nearestPlaceId={nearestPlaceId} />
      ) : (
        <p className="py-8 text-center text-sm leading-relaxed text-slate-500">
          {t("empty")}
        </p>
      )}
    </div>
  );
}
