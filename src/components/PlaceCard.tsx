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
  /** Closest venue to the user when geolocation is available. */
  isNearest?: boolean;
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

function MetaTag({
  icon,
  children,
  tone = "muted",
}: {
  icon?: ReactNode;
  children: ReactNode;
  tone?: "muted" | "bright";
}) {
  const toneClass =
    tone === "bright"
      ? "bg-amber-500 text-white"
      : "bg-slate-100 text-slate-700";

  return (
    <span
      className={`inline-flex max-w-full items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium leading-none sm:gap-2 sm:px-3 sm:py-1.5 sm:text-xs ${toneClass}`}
    >
      {icon ? (
        <span
          className={`flex-none ${tone === "bright" ? "text-white/90" : "text-slate-500"}`}
          aria-hidden
        >
          {icon}
        </span>
      ) : null}
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
  isNearest = false,
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
      label: t("travelShort", {
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
  const hasMetaTags = isNearest || showTeaCount || showAverageCheck;

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
        className={`flex flex-col gap-3.5 bg-white sm:gap-4 ${
          embedded ? "px-4 pb-1 pt-4 sm:px-5 sm:pt-5" : "p-4 sm:p-5"
        }`}
      >
        {hasMetaTags ? (
          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {isNearest ? (
              <MetaTag tone="bright">{t("nearestTag")}</MetaTag>
            ) : null}

            {showTeaCount ? (
              <MetaTag
                icon={<CupSoda className="h-3.5 w-3.5" strokeWidth={2} />}
              >
                {t("menuStatsCountOnly", { count: teaItemsCount })}
              </MetaTag>
            ) : null}

            {showAverageCheck ? (
              <MetaTag
                icon={<Wallet className="h-3.5 w-3.5" strokeWidth={2} />}
              >
                {t("averageCheckTag", { check: averageCheck })}
              </MetaTag>
            ) : null}
          </div>
        ) : null}

        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex flex-1 flex-col gap-1.5">
            <h3
              id={titleId}
              className="font-serif text-xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-[1.35rem]"
            >
              {displayName}
            </h3>

            {placeAddress || travelMeta ? (
              <p className="flex items-start gap-1.5 text-sm leading-snug text-slate-500">
                <MapPin
                  className="mt-0.5 h-3.5 w-3.5 flex-none text-slate-400"
                  strokeWidth={2}
                  aria-hidden
                />
                <span>
                  {placeAddress}
                  {placeAddress && travelMeta ? " • " : null}
                  {travelMeta ? travelMeta.label : null}
                </span>
              </p>
            ) : null}
          </div>

          <div className="flex shrink-0 items-center gap-0.5">
            <PlaceCardHeaderActions placeId={id} name={displayName} />
            {onClose ? (
              <button
                type="button"
                onClick={handleClose}
                aria-label={closeLabel ?? "Close"}
                className="flex h-9 w-9 flex-none items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-950"
              >
                <X className="h-[1.125rem] w-[1.125rem]" strokeWidth={2} aria-hidden />
              </button>
            ) : null}
          </div>
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
