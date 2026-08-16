"use client";

import {
  PlaceActions,
  PlaceCardHeaderActions,
  placeHeaderIconClass,
} from "@/components/PlaceActions";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useRouter } from "@/i18n/navigation";
import { formatDistance, haversineMeters } from "@/lib/geo";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMemo, type KeyboardEvent, type MouseEvent } from "react";

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
  /** denser shadow for floating surfaces */
  elevated?: boolean;
  /** Strip card chrome when nested in the map preview sheet. */
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

    const travelTimeLabel = t("travelTimeMinutes", {
      minutes: estimateTravelMinutes(meters),
    });

    const formatted = formatDistance(meters);
    const distanceHint =
      formatted.unit === "m"
        ? t("distanceShortMeters", { meters: formatted.value })
        : t("distanceShortKilometers", {
            km: Number.isInteger(formatted.value)
              ? String(formatted.value)
              : formatted.value.toFixed(1).replace(/\.0$/, ""),
          });

    return { travelTimeLabel, distanceHint };
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
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex flex-1 flex-col gap-1.5">
          <h3
            id={titleId}
            className="font-serif text-xl font-semibold leading-snug tracking-tight text-slate-900 sm:text-[1.35rem]"
          >
            {displayName}
          </h3>

          {placeAddress ? (
            <p className="text-sm leading-snug text-slate-500">{placeAddress}</p>
          ) : null}

          {travelMeta ? (
            <p className="text-sm text-slate-600">
              <span>{travelMeta.travelTimeLabel}</span>
              {travelMeta.distanceHint ? (
                <span className="text-slate-400">
                  {" "}
                  · {travelMeta.distanceHint}
                </span>
              ) : null}
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
              className={placeHeaderIconClass}
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
    </article>
  );
}
