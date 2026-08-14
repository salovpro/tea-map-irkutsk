"use client";

import { PlacePreviewSheet } from "@/components/PlacePreviewSheet";
import { PlacesList } from "@/components/PlacesList";
import type { CatalogPlace, PlaceSheetSeed } from "@/lib/places";
import { useTranslations } from "next-intl";
import { useMemo, useState } from "react";

type FilterKey = "all" | "premium" | "author";

type PlacesCatalogProps = {
  places: CatalogPlace[];
};

function toSheetSeed(place: CatalogPlace): PlaceSheetSeed {
  return {
    id: place.id,
    name: place.name,
    description: place.description,
    address: place.address,
    phone: place.phone,
    website: place.website,
    logoUrl: place.logoUrl,
    isPremium: place.isPremium,
    coordinates: place.coordinates,
    ratingAvg: place.ratingAvg,
  };
}

export function PlacesCatalog({ places }: PlacesCatalogProps) {
  const t = useTranslations("PlacesPage");
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<FilterKey>("all");
  const [selectedPlace, setSelectedPlace] = useState<PlaceSheetSeed | null>(
    null,
  );

  const filteredPlaces = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return places.filter((place) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        place.name.toLowerCase().includes(normalizedQuery) ||
        place.address.toLowerCase().includes(normalizedQuery);

      const matchesFilter =
        filter === "all" ||
        (filter === "premium" && place.isPremium) ||
        (filter === "author" && place.hasAuthorTea);

      return matchesQuery && matchesFilter;
    });
  }, [places, query, filter]);

  const filters: { key: FilterKey; label: string }[] = [
    { key: "all", label: t("filterAll") },
    { key: "premium", label: t("filterPremium") },
    { key: "author", label: t("filterAuthor") },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-6">
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

        <div
          role="group"
          aria-label={t("filtersLabel")}
          className="flex flex-wrap gap-2"
        >
          {filters.map(({ key, label }) => {
            const active = filter === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setFilter(key)}
                aria-pressed={active}
                className={`rounded-full px-4 py-2 text-xs font-medium tracking-wide transition-colors ${
                  active
                    ? "bg-amber-950 text-slate-50"
                    : "bg-white text-slate-500 ring-1 ring-slate-200 hover:text-slate-900"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {filteredPlaces.length > 0 ? (
        <PlacesList
          places={filteredPlaces}
          onPlaceOpen={(place) => setSelectedPlace(toSheetSeed(place))}
        />
      ) : (
        <p className="py-8 text-center text-sm leading-relaxed text-slate-500">
          {t("empty")}
        </p>
      )}

      <PlacePreviewSheet
        place={selectedPlace}
        onClose={() => setSelectedPlace(null)}
      />
    </div>
  );
}
