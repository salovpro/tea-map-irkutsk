"use client";

import { Link } from "@/i18n/navigation";
import { logoNeedsDarkBackdrop } from "@/lib/place-logo-data";
import type { RelatedPlaceCard } from "@/lib/places";

type RelatedPlacesCarouselProps = {
  places: RelatedPlaceCard[];
  title: string;
};

export function RelatedPlacesCarousel({
  places,
  title,
}: RelatedPlacesCarouselProps) {
  if (places.length === 0) return null;

  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">
        {title}
      </h2>
      <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-none">
        {places.map((place) => (
          <Link
            key={place.id}
            href={`/places/${place.id}`}
            className="flex w-[min(72vw,220px)] shrink-0 snap-start flex-col gap-3 rounded-2xl bg-white p-4 shadow-md transition-opacity hover:opacity-90"
          >
            <div
              className={`flex h-16 w-16 items-center justify-center overflow-hidden rounded-2xl p-2 ${
                logoNeedsDarkBackdrop(place.logoUrl)
                  ? "bg-stone-900"
                  : "bg-slate-100"
              }`}
            >
              {place.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={place.logoUrl}
                  alt=""
                  className="h-full w-full object-contain object-center"
                />
              ) : (
                <span className="font-serif text-2xl text-amber-950/40">茶</span>
              )}
            </div>
            <div className="flex min-w-0 flex-col gap-1">
              <p className="truncate font-serif text-base font-semibold text-slate-900">
                {place.name}
              </p>
              {place.address ? (
                <p className="line-clamp-2 text-xs leading-snug text-slate-500">
                  {place.address}
                </p>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
