"use client";

import {
  PlaceActions,
  PlaceCardHeaderActions,
} from "@/components/PlaceActions";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useRouter } from "@/i18n/navigation";
import { formatDistance, haversineMeters } from "@/lib/geo";
import { CupSoda, MapPin, Wallet, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

export type PlaceCardProps = {
  id: string;
  name: string;
  address?: string;
  phone: string;
  website?: string | null;
  coordinates: [number, number];
  /** @deprecated Ratings temporarily hidden in UI. */
  ratingAvg?: number | null;
  /** Optional override; otherwise taken from shared geolocation hook. */
  userCoordinates?: [number, number] | null;
  teaItemsCount?: number;
  averageCheck?: number | null;
  /** denser shadow for floating surfaces */
  elevated?: boolean;
  /** Strip outer list chrome when nested in the map preview sheet. */
  embedded?: boolean;
  titleId?: string;
  /** Close control for map preview sheet header. */
  onClose?: () => void;
  closeLabel?: string;
};

/** City travel estimate (~25 km/h). */
function estimateTravelMinutes(meters: number) {
  return Math.max(1, Math.round(meters / 420));
}

function hasValidCoordinates(
  coords: [number, number] | null | undefined,
): coords is [number, number] {
  return (
    Array.isArray(coords) &&
    coords.length === 2 &&
    Number.isFinite(coords[0]) &&
    Number.isFinite(coords[1])
  );
}

function ForestTag({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <span className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-white/80 bg-black/25 px-2.5 py-1 text-[11px] font-medium leading-none text-white backdrop-blur-[2px] sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs">
      <span className="flex-none opacity-95" aria-hidden>
        {icon}
      </span>
      <span className="min-w-0 truncate">{children}</span>
    </span>
  );
}

export function PlaceCard({
  id,
  name,
  address = "",
  phone,
  website,
  coordinates,
  userCoordinates: userCoordinatesProp,
  elevated = false,
  embedded = false,
  titleId,
  onClose,
  closeLabel,
  teaItemsCount = 0,
  averageCheck = null,
}: PlaceCardProps) {
  const t = useTranslations("PlaceCard");
  const router = useRouter();
  const liveUserCoordinates = useUserLocation();
  const userCoordinates =
    userCoordinatesProp === undefined
      ? liveUserCoordinates
      : userCoordinatesProp;

  const displayName = name?.trim() || "Без названия";
  const placeAddress = address.trim();

  const travelMeta = useMemo(() => {
    if (!hasValidCoordinates(userCoordinates)) return null;

    const meters = haversineMeters(userCoordinates, coordinates);
    if (!Number.isFinite(meters) || meters < 0) return null;

    const minutes = estimateTravelMinutes(meters);
    const formatted = formatDistance(meters);
    const distanceHint =
      formatted.unit === "m"
        ? t("distanceShortMeters", { meters: formatted.value })
        : t("distanceShortKilometers", {
            km: Number.isInteger(formatted.value)
              ? String(formatted.value)
              : formatted.value.toFixed(1).replace(/\.0$/, ""),
          });

    return {
      minutes,
      distanceHint,
      label: t("travelTimeWithDistance", {
        minutes,
        distance: distanceHint,
      }),
    };
  }, [coordinates, t, userCoordinates]);

  function openPlace() {
    router.push(`/places/${id}`);
  }

  function onCardKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      openPlace();
    }
  }

  function handleClose(event: MouseEvent) {
    event.preventDefault();
    event.stopPropagation();
    onClose?.();
  }

  const showTeaCount = teaItemsCount > 0;
  const showAverageCheck = averageCheck != null;
  const hasForestTags = showTeaCount || showAverageCheck;

  return (
    <article
      role="button"
      tabIndex={0}
      onClick={openPlace}
      onKeyDown={onCardKeyDown}
      className={
        embedded
          ? "relative flex cursor-pointer flex-col overflow-hidden bg-transparent"
          : `relative flex cursor-pointer flex-col overflow-hidden rounded-2xl bg-white ${
              elevated ? "shadow-lg" : "shadow-md"
            }`
      }
    >
      <div
        className={`relative isolate overflow-hidden bg-[url('/forest-bg.jpg')] bg-cover bg-center ${
          hasForestTags ? "px-3 py-3 sm:px-4 sm:py-3.5" : "px-3 py-3 sm:px-4"
        }`}
      >
        <div
          className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/55 via-black/40 to-black/50"
          aria-hidden
        />

        <div className="relative flex items-center justify-between gap-2">
          <div className="flex min-w-0 flex-1 flex-wrap gap-1.5 sm:gap-2">
            {showTeaCount ? (
              <ForestTag
                icon={<CupSoda className="h-3.5 w-3.5" strokeWidth={2} />}
              >
                {t("menuStatsCountOnly", { count: teaItemsCount })}
              </ForestTag>
            ) : null}

            {showAverageCheck ? (
              <ForestTag
                icon={<Wallet className="h-3.5 w-3.5" strokeWidth={2} />}
              >
                {t("averageCheckTag", { check: averageCheck })}
              </ForestTag>
            ) : null}
          </div>

          {onClose ? (
            <button
              type="button"
              onClick={handleClose}
              aria-label={closeLabel ?? "Close"}
              className="flex h-8 w-8 flex-none items-center justify-center rounded-full border border-white/70 bg-black/30 text-white backdrop-blur-[2px] transition-colors hover:bg-black/45 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              <X className="h-4 w-4" strokeWidth={2} aria-hidden />
            </button>
          ) : null}
        </div>
      </div>

      <div
        className={`flex flex-col gap-3.5 bg-white sm:gap-4 ${
          embedded ? "px-4 pb-1 pt-4 sm:px-5 sm:pt-5" : "p-4 sm:p-5"
        }`}
      >
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex flex-1 flex-col gap-1.5">
            <h3
              id={titleId}
              className="font-serif text-xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-[1.35rem]"
            >
              {displayName}
            </h3>

            {placeAddress ? (
              <p className="flex items-start gap-1.5 text-sm leading-snug text-slate-500">
                <MapPin
                  className="mt-0.5 h-3.5 w-3.5 flex-none text-slate-400"
                  strokeWidth={2}
                  aria-hidden
                />
                <span>{placeAddress}</span>
              </p>
            ) : null}

            {travelMeta ? (
              <p className="text-sm leading-snug text-slate-600">
                {travelMeta.label}
              </p>
            ) : null}
          </div>

          <PlaceCardHeaderActions placeId={id} name={displayName} />
        </header>

        <PlaceActions
          placeId={id}
          name={displayName}
          phone={phone}
          website={website}
          coordinates={coordinates}
        />
      </div>
    </article>
  );
}
