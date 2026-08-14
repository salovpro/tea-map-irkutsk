"use client";

import { FavoriteButton } from "@/components/FavoriteButton";
import { useUserLocation } from "@/hooks/useUserLocation";
import { formatDistance, haversineMeters } from "@/lib/geo";
import { Globe, Navigation2, Phone, Star } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, type KeyboardEvent, type MouseEvent } from "react";

export type PlaceCardProps = {
  id: string;
  name: string;
  phone: string;
  website?: string | null;
  coordinates: [number, number];
  ratingAvg?: number | null;
  /** Optional override; otherwise taken from shared geolocation hook. */
  userCoordinates?: [number, number] | null;
  /** denser shadow for floating surfaces */
  elevated?: boolean;
  /** Strip card chrome when nested in the map bottom sheet. */
  embedded?: boolean;
  titleId?: string;
  onOpen?: () => void;
};

function buildRouteUrl(coordinates: [number, number]) {
  const [lat, lng] = coordinates;
  return `https://yandex.ru/maps/?rtext=~${lat},${lng}&rtt=auto`;
}

function toTelHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : null;
}

function formatRating(value: number) {
  return Number.isInteger(value) ? String(value) : value.toFixed(1);
}

const iconBtnClass =
  "inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition-colors hover:border-amber-900/30 hover:text-amber-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-950";

export function PlaceCard({
  id,
  name,
  phone,
  website,
  coordinates,
  ratingAvg = null,
  userCoordinates: userCoordinatesProp,
  elevated = false,
  embedded = false,
  titleId,
  onOpen,
}: PlaceCardProps) {
  const t = useTranslations("PlaceCard");
  const liveUserCoordinates = useUserLocation();
  const userCoordinates =
    userCoordinatesProp === undefined
      ? liveUserCoordinates
      : userCoordinatesProp;

  const displayName = name?.trim() || "Без названия";
  const telHref = phone ? toTelHref(phone) : null;
  const siteHref = website?.trim() ? website.trim() : null;
  const yandexRouteUrl = buildRouteUrl(coordinates);

  const distanceLabel = useMemo(() => {
    if (!userCoordinates) return null;

    const meters = haversineMeters(userCoordinates, coordinates);
    if (!Number.isFinite(meters)) return null;

    const formatted = formatDistance(meters);
    if (formatted.unit === "m") {
      return t("distanceShortMeters", { meters: formatted.value });
    }

    const kmLabel = Number.isInteger(formatted.value)
      ? String(formatted.value)
      : formatted.value.toFixed(1).replace(/\.0$/, "");

    return t("distanceShortKilometers", { km: kmLabel });
  }, [coordinates, t, userCoordinates]);

  const hasMeta =
    (ratingAvg != null && ratingAvg > 0) || Boolean(distanceLabel);

  function openPlace() {
    onOpen?.();
  }

  function onCardKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPlace();
    }
  }

  function stopCardNavigation(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
  }

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openPlace}
      onKeyDown={onCardKeyDown}
      className={
        embedded
          ? "relative flex cursor-pointer flex-col gap-4 bg-transparent p-0"
          : `relative flex cursor-pointer flex-col gap-4 rounded-2xl bg-white p-4 sm:gap-5 sm:p-5 ${
              elevated ? "shadow-lg" : "shadow-md"
            }`
      }
    >
      <div className={`absolute z-10 ${embedded ? "top-0 right-0" : "top-3 right-3"}`}>
        <FavoriteButton placeId={id} stopPropagation />
      </div>

      <header className="flex min-w-0 flex-col gap-2 pr-10">
        <h3
          id={titleId}
          className="font-serif text-xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-[1.35rem]"
        >
          {displayName}
        </h3>

        {hasMeta ? (
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-sm text-slate-500">
            {ratingAvg != null && ratingAvg > 0 ? (
              <span className="inline-flex items-center gap-1 font-medium text-slate-600">
                <Star
                  className="h-3.5 w-3.5 fill-amber-500 text-amber-500"
                  aria-hidden
                />
                <span>{formatRating(ratingAvg)}</span>
              </span>
            ) : null}

            {ratingAvg != null && ratingAvg > 0 && distanceLabel ? (
              <span aria-hidden className="text-slate-300">
                ·
              </span>
            ) : null}

            {distanceLabel ? <span>{distanceLabel}</span> : null}
          </div>
        ) : null}
      </header>

      <div className="flex items-center gap-2.5">
        <button
          type="button"
          onClick={(event) => {
            stopCardNavigation(event);
            openPlace();
          }}
          className="inline-flex h-12 min-w-0 flex-1 items-center justify-center rounded-xl bg-amber-950 px-4 text-sm font-medium tracking-wide text-slate-50 transition-colors hover:bg-amber-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-950"
        >
          {t("teaMapCta")}
        </button>

        <a
          href={yandexRouteUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={stopCardNavigation}
          aria-label={t("buildRoute")}
          title={t("buildRoute")}
          className={iconBtnClass}
        >
          <Navigation2 className="h-5 w-5" strokeWidth={2} aria-hidden />
        </a>

        {telHref ? (
          <a
            href={telHref}
            onClick={stopCardNavigation}
            aria-label={t("bookTable")}
            title={t("bookTable")}
            className={iconBtnClass}
          >
            <Phone className="h-5 w-5" strokeWidth={2} aria-hidden />
          </a>
        ) : null}

        {siteHref ? (
          <a
            href={siteHref}
            target="_blank"
            rel="noopener noreferrer"
            onClick={stopCardNavigation}
            aria-label={t("openWebsite")}
            title={t("openWebsite")}
            className={iconBtnClass}
          >
            <Globe className="h-5 w-5" strokeWidth={2} aria-hidden />
          </a>
        ) : null}
      </div>
    </article>
  );
}
