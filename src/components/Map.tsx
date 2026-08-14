"use client";

import {
  Clusterer,
  Map as YandexMap,
  Placemark,
  useYMaps,
  YMaps,
} from "@pbe/react-yandex-maps";
import type { ComponentProps, MutableRefObject } from "react";
import { List, LocateFixed } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";
import { PlacePreviewSheet } from "@/components/PlacePreviewSheet";
import { useFavorites } from "@/hooks/useFavorites";
import { Link } from "@/i18n/navigation";
import type { MapPlace, PlaceSheetSeed } from "@/lib/places";
import { getYandexMapsApiKey } from "@/lib/yandex";

const IRKUTSK_CENTER: [number, number] = [52.286974, 104.305018];
const IRKUTSK_ZOOM = 13;
const USER_FOCUS_ZOOM = 16;

/** Keep selected pin in the upper ~28% of the map (above bottom sheet). */
const PIN_FOCUS_Y_RATIO = 0.28;

/** Active bottom-nav accent (Tailwind amber-900). */
const NAV_BROWN = "#78350f";
const NAV_BROWN_DARK = "#451a03";

/** Above this zoom, nearby pins are shown separately (no clustering). */
const CLUSTER_MAX_ZOOM = 15;

/** From this zoom, free-standing pins show the name pill. */
const LABEL_MIN_ZOOM = 15;

/** Max zoom so users can open up spiderfied piles. */
const MAP_MAX_ZOOM = 19;

/** Aggressive clustering when pins start to overlap. */
const CLUSTER_GRID_SIZE = 88;
const CLUSTER_MARGIN = 28;

/**
 * Group pins within ~11 m (4 decimal places) and fan them in a ring
 * so they remain clickable after the clusterer dissolves.
 */
const SPIDERFY_PRECISION = 4;
const SPIDERFY_BASE_RADIUS_DEG = 0.0002; // ≈ 22 m

function coordGroupKey(lat: number, lng: number) {
  return `${lat.toFixed(SPIDERFY_PRECISION)},${lng.toFixed(SPIDERFY_PRECISION)}`;
}

/** Display positions: identical / near-identical points are offset in a circle. */
function buildDisplayCoordinates(
  places: MapPlace[],
): Map<string, [number, number]> {
  const groups = new Map<string, MapPlace[]>();

  for (const place of places) {
    const [lat, lng] = place.coordinates;
    const key = coordGroupKey(lat, lng);
    const bucket = groups.get(key);
    if (bucket) bucket.push(place);
    else groups.set(key, [place]);
  }

  const display = new Map<string, [number, number]>();

  for (const group of groups.values()) {
    if (group.length === 1) {
      display.set(group[0].id, group[0].coordinates);
      continue;
    }

    const centerLat =
      group.reduce((sum, place) => sum + place.coordinates[0], 0) /
      group.length;
    const centerLng =
      group.reduce((sum, place) => sum + place.coordinates[1], 0) /
      group.length;
    const cosLat = Math.max(Math.cos((centerLat * Math.PI) / 180), 0.2);
    const radius =
      SPIDERFY_BASE_RADIUS_DEG * Math.sqrt(Math.max(group.length, 2));

    group.forEach((place, index) => {
      const angle = (2 * Math.PI * index) / group.length - Math.PI / 2;
      display.set(place.id, [
        centerLat + radius * Math.sin(angle),
        centerLng + (radius * Math.cos(angle)) / cosLat,
      ]);
    });
  }

  return display;
}

const MAP_CUSTOMIZATION = [
  {
    tags: {
      any: [
        "poi",
        "outdoor",
        "park",
        "cemetery",
        "medical",
        "landmark",
        "religion",
        "commerce",
        "catering",
        "hotel",
        "transit",
        "traffic",
      ],
    },
    stylers: [{ visibility: "off" }],
  },
  {
    tags: { any: ["road"] },
    elements: "label",
    stylers: [{ visibility: "off" }],
  },
];

const TEA_CUP_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M13.5 17.2h10.2c.55 0 1 .45 1 1v5.1c0 2.85-2.35 5.15-5.2 5.15h-1.8c-2.85 0-5.2-2.3-5.2-5.15v-5.1c0-.55.45-1 1-1Z" fill="#ffffff"/>
    <path d="M24.7 19.2h1.55c1.25 0 2.25 1 2.25 2.25v.85c0 1.25-1 2.25-2.25 2.25H24.7" stroke="#ffffff" stroke-width="1.7" stroke-linecap="round" fill="none"/>
    <path d="M13.2 17.2h10.8" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" opacity="0.85"/>
    <path d="M16.2 12.2c0-1.1-.4-1.95-.95-2.5M19.5 11.8c0-1.4-.55-2.5-1.35-3.15M22.8 12.2c0-1.1.35-2 .9-2.55" stroke="#ffffff" stroke-width="1.35" stroke-linecap="round"/>
  </svg>
`;

const HEART_SVG = `
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 40 40" fill="none" aria-hidden="true">
    <path d="M20 28.2c-.35 0-.7-.12-.97-.36C14.7 23.9 12 21.45 12 18.35 12 16.1 13.75 14.4 16 14.4c1.2 0 2.3.55 3 1.42.7-.87 1.8-1.42 3-1.42 2.25 0 4 1.7 4 3.95 0 3.1-2.7 5.55-7.03 9.49-.27.24-.62.36-.97.36Z" fill="#ffffff"/>
  </svg>
`;

function userLocationPinDataUri() {
  return (
    "data:image/svg+xml;charset=UTF-8," +
    encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none">
        <circle cx="24" cy="24" r="18" fill="#2563eb" fill-opacity="0.18"/>
        <circle cx="24" cy="24" r="9" fill="#ffffff"/>
        <circle cx="24" cy="24" r="6.5" fill="#2563eb"/>
      </svg>
    `)
  );
}

const USER_PIN_HREF = userLocationPinDataUri();

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

type LayoutFactory = {
  createClass: (
    template: string,
    overrides?: Record<string, unknown>,
  ) => unknown;
};

type PinLayouts = {
  cluster: unknown;
  basicTea: unknown;
  basicFavorite: unknown;
  labeledTea: unknown;
  labeledFavorite: unknown;
};

function pinDotHtml(iconSvg: string) {
  return `
    <div class="tea-map-pin__dot" style="
      width:40px;
      height:40px;
      border-radius:999px;
      background:$[properties.dotColor];
      display:flex;
      align-items:center;
      justify-content:center;
      flex-shrink:0;
      box-shadow:0 2px 10px rgba(15,23,42,0.18);
      border:2px solid rgba(255,255,255,0.92);
    ">${iconSvg}</div>
  `;
}

function labeledPinHtml(iconSvg: string) {
  return `
    <div class="tea-map-pin tea-map-pin--labeled" style="
      display:inline-flex;
      align-items:center;
      gap:8px;
      transform:translate(-20px,-20px);
      cursor:pointer;
      user-select:none;
      pointer-events:auto;
    ">
      ${pinDotHtml(iconSvg)}
      <div class="tea-map-pin__label" style="
        max-width:min(52vw,200px);
        padding:7px 12px;
        border-radius:999px;
        background:#ffffff;
        color:#0f172a;
        font-family:var(--font-noto-serif),ui-serif,Georgia,serif;
        font-size:13px;
        font-weight:600;
        line-height:1.2;
        letter-spacing:-0.01em;
        white-space:nowrap;
        overflow:hidden;
        text-overflow:ellipsis;
        box-shadow:0 4px 14px rgba(15,23,42,0.14);
        border:1px solid rgba(148,163,184,0.28);
      ">$[properties.iconCaption]</div>
    </div>
  `;
}

function basicPinHtml(iconSvg: string) {
  return `
    <div class="tea-map-pin tea-map-pin--basic" style="
      transform:translate(-20px,-20px);
      cursor:pointer;
      user-select:none;
      pointer-events:auto;
    ">
      ${pinDotHtml(iconSvg)}
    </div>
  `;
}

function createPinLayouts(factory: LayoutFactory): PinLayouts {
  const cluster = factory.createClass(`
    <div class="tea-map-cluster" style="
      width:44px;
      height:44px;
      border-radius:999px;
      background:${NAV_BROWN};
      color:#ffffff;
      display:flex;
      align-items:center;
      justify-content:center;
      font-family:var(--font-roboto),system-ui,sans-serif;
      font-size:14px;
      font-weight:600;
      line-height:1;
      box-shadow:0 3px 12px rgba(15,23,42,0.22);
      border:2px solid rgba(255,255,255,0.92);
      transform:translate(-22px,-22px);
      cursor:pointer;
      user-select:none;
    ">$[properties.geoObjects.length]</div>
  `);

  return {
    cluster,
    basicTea: factory.createClass(basicPinHtml(TEA_CUP_SVG)),
    basicFavorite: factory.createClass(basicPinHtml(HEART_SVG)),
    labeledTea: factory.createClass(labeledPinHtml(TEA_CUP_SVG)),
    labeledFavorite: factory.createClass(labeledPinHtml(HEART_SVG)),
  };
}

const BASIC_PIN_SHAPE = {
  type: "Circle" as const,
  coordinates: [0, 0] as [number, number],
  radius: 22,
};

const LABELED_PIN_SHAPE = {
  type: "Rectangle" as const,
  coordinates: [
    [-20, -22],
    [220, 22],
  ] as [[number, number], [number, number]],
};

const CLUSTER_ICON_SHAPE = {
  type: "Circle" as const,
  coordinates: [0, 0] as [number, number],
  radius: 24,
};

type YMapsMap = {
  panTo: (
    center: number[] | number[][],
    options?: { duration?: number; flying?: boolean; timingFunction?: string },
  ) => Promise<void> | void;
  getZoom: () => number;
  setZoom: (zoom: number, options?: { duration?: number }) => void;
  getGlobalPixelCenter: () => number[];
  setGlobalPixelCenter: (
    center: number[],
    zoom?: number,
    options?: { duration?: number },
  ) => void;
  container: { getSize: () => number[] };
  converter: {
    globalToPage: (globalPixels: number[]) => number[];
  };
  options: {
    get: (key: string) => {
      toGlobalPixels: (coords: number[], zoom: number) => number[];
    };
  };
};

type MapProps = {
  places: MapPlace[];
};

type UserLocation = {
  coordinates: [number, number];
  accuracy: number | null;
};

function toSheetSeed(place: MapPlace): PlaceSheetSeed {
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

async function panMapToPlace(
  map: YMapsMap,
  coordinates: [number, number],
) {
  await map.panTo(coordinates, {
    duration: 350,
    flying: true,
    timingFunction: "ease-out",
  });

  try {
    const zoom = map.getZoom();
    const projection = map.options.get("projection");
    const globalPixels = projection.toGlobalPixels(coordinates, zoom);
    const pagePoint = map.converter.globalToPage(globalPixels);
    const [width, height] = map.container.getSize();
    const targetPage: [number, number] = [width / 2, height * PIN_FOCUS_Y_RATIO];
    const deltaX = pagePoint[0] - targetPage[0];
    const deltaY = pagePoint[1] - targetPage[1];
    const currentCenter = map.getGlobalPixelCenter();

    map.setGlobalPixelCenter(
      [currentCenter[0] + deltaX, currentCenter[1] + deltaY],
      zoom,
      { duration: 220 },
    );
  } catch {
    // Fallback: nudge center slightly south so the pin sits higher
    const [lat, lng] = coordinates;
    map.panTo([lat - 0.006, lng], { duration: 200, flying: false });
  }
}

async function centerMapOnUser(
  map: YMapsMap,
  coordinates: [number, number],
) {
  const zoom = Math.max(map.getZoom(), USER_FOCUS_ZOOM);
  await map.panTo(coordinates, {
    duration: 450,
    flying: true,
    timingFunction: "ease-out",
  });
  if (map.getZoom() < USER_FOCUS_ZOOM) {
    map.setZoom(zoom, { duration: 280 });
  }
}

function readGeolocationError(
  error: GeolocationPositionError,
): "denied" | "unavailable" {
  if (error.code === error.PERMISSION_DENIED) return "denied";
  return "unavailable";
}

type MapCanvasProps = {
  places: MapPlace[];
  displayCoordinates: Map<string, [number, number]>;
  favoriteIds: ReadonlySet<string>;
  userLocation: UserLocation | null;
  userHint: string;
  selectedPlace: MapPlace | null;
  onSelectPlace: (place: MapPlace) => void;
  onClearSelection: () => void;
  onMapError: (error: unknown) => void;
  mapRef: MutableRefObject<YMapsMap | null>;
};

function MapCanvas({
  places,
  displayCoordinates,
  favoriteIds,
  userLocation,
  userHint,
  selectedPlace,
  onSelectPlace,
  onClearSelection,
  onMapError,
  mapRef,
}: MapCanvasProps) {
  const ymaps = useYMaps(["templateLayoutFactory"]);
  const [zoom, setZoom] = useState(IRKUTSK_ZOOM);

  const layouts = useMemo(() => {
    if (!ymaps?.templateLayoutFactory) return null;
    return createPinLayouts(
      ymaps.templateLayoutFactory as LayoutFactory,
    );
  }, [ymaps]);

  const showLabels = zoom >= LABEL_MIN_ZOOM;

  function syncZoomFromMap(map: YMapsMap | null) {
    if (!map) return;
    try {
      setZoom(map.getZoom());
    } catch {
      // Map may be disposing
    }
  }

  function handleMapError(error: unknown) {
    onMapError(error);
  }

  return (
    <YandexMap
      instanceRef={(ref) => {
        const map = ref as unknown as YMapsMap | null;
        mapRef.current = map;
        syncZoomFromMap(map);
      }}
      defaultState={{
        center: IRKUTSK_CENTER,
        zoom: IRKUTSK_ZOOM,
        controls: [],
      }}
      width="100%"
      height="100%"
      options={
        {
          suppressMapOpenBlock: true,
          yandexMapDisablePoiInteractivity: true,
          maxZoom: MAP_MAX_ZOOM,
          customization: MAP_CUSTOMIZATION,
        } as ComponentProps<typeof YandexMap>["options"]
      }
      modules={["control.ZoomControl", "templateLayoutFactory"]}
      onClick={onClearSelection}
      onBoundschange={() => syncZoomFromMap(mapRef.current)}
      onActionEnd={() => syncZoomFromMap(mapRef.current)}
      onError={handleMapError}
    >
      <Clusterer
        options={{
          groupByCoordinates: false,
          clusterDisableClickZoom: false,
          clusterOpenBalloonOnClick: false,
          clusterHideIconOnBalloonOpen: false,
          geoObjectHideIconOnBalloonOpen: false,
          gridSize: CLUSTER_GRID_SIZE,
          minClusterSize: 2,
          margin: CLUSTER_MARGIN,
          maxZoom: CLUSTER_MAX_ZOOM,
          ...(layouts
            ? {
                clusterIconLayout: layouts.cluster,
                clusterIconShape: CLUSTER_ICON_SHAPE,
              }
            : {}),
          hasBalloon: false,
          hasHint: true,
        }}
        onError={handleMapError}
      >
        {layouts
          ? places.map((place) => {
              const displayName = place.name?.trim() || "Без названия";
              const selected = selectedPlace?.id === place.id;
              const favorite = favoriteIds.has(place.id);
              const geometry =
                displayCoordinates.get(place.id) ?? place.coordinates;

              const iconLayout = favorite
                ? showLabels
                  ? layouts.labeledFavorite
                  : layouts.basicFavorite
                : showLabels
                  ? layouts.labeledTea
                  : layouts.basicTea;

              const dotColor = favorite
                ? selected
                  ? "#b91c1c"
                  : "#ef4444"
                : selected
                  ? NAV_BROWN_DARK
                  : NAV_BROWN;

              return (
                <Placemark
                  key={`${place.id}-${showLabels ? "l" : "b"}-${favorite ? "f" : "t"}-${selected ? "s" : "n"}`}
                  geometry={geometry}
                  properties={{
                    hintContent: displayName,
                    iconCaption: escapeHtml(displayName),
                    dotColor,
                  }}
                  options={{
                    cursor: "pointer",
                    iconLayout,
                    iconShape: showLabels ? LABELED_PIN_SHAPE : BASIC_PIN_SHAPE,
                    hasBalloon: false,
                    hasHint: true,
                    zIndex: selected ? 1000 : favorite ? 500 : 1,
                    zIndexHover: selected ? 1001 : 600,
                  }}
                  modules={["geoObject.addon.hint"]}
                  onClick={(event: {
                    stopPropagation?: () => void;
                    originalEvent?: {
                      preventDefault?: () => void;
                      stopPropagation?: () => void;
                    };
                  }) => {
                    event.stopPropagation?.();
                    event.originalEvent?.preventDefault?.();
                    event.originalEvent?.stopPropagation?.();
                    onSelectPlace(place);
                  }}
                />
              );
            })
          : null}
      </Clusterer>

      {userLocation ? (
        <Placemark
          geometry={userLocation.coordinates}
          properties={{
            hintContent: userHint,
          }}
          options={{
            cursor: "default",
            iconLayout: "default#image",
            iconImageHref: USER_PIN_HREF,
            iconImageSize: [48, 48],
            iconImageOffset: [-24, -24],
            hasBalloon: false,
            zIndex: 2000,
            interactiveZIndex: false,
          }}
          modules={["geoObject.addon.hint"]}
        />
      ) : null}
    </YandexMap>
  );
}

/** Named PlacesMap so it does not shadow the built-in Map constructor. */
function PlacesMap({ places }: MapProps) {
  const locale = useLocale();
  const t = useTranslations("Map");
  const mapRef = useRef<YMapsMap | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<
    "denied" | "unavailable" | null
  >(null);
  const [mapLoadError, setMapLoadError] = useState<"missing-key" | "load" | null>(
    null,
  );

  const displayCoordinates = useMemo(
    () => buildDisplayCoordinates(places),
    [places],
  );
  const { favoriteIds } = useFavorites();
  const favoriteIdSet = useMemo(
    () => new Set(favoriteIds),
    [favoriteIds],
  );

  const apiKey = getYandexMapsApiKey();
  const mapsLang =
    locale === "en" ? "en_US" : locale === "zh" ? "zh_CN" : "ru_RU";

  useEffect(() => {
    if (!apiKey) {
      setMapLoadError("missing-key");
    }
  }, [apiKey]);

  useEffect(() => {
    // @pbe/react-yandex-maps rejects script load failures as Event objects
    // without a catch in useYMaps — that becomes unhandledRejection: [object Event].
    function onUnhandledRejection(event: PromiseRejectionEvent) {
      const reason = event.reason;
      const isDomEvent =
        reason instanceof Event ||
        (typeof reason === "object" &&
          reason !== null &&
          "type" in reason &&
          "target" in reason);

      if (!isDomEvent) return;

      event.preventDefault();
      setMapLoadError((current) => current ?? "load");
    }

    window.addEventListener("unhandledrejection", onUnhandledRejection);
    return () =>
      window.removeEventListener("unhandledrejection", onUnhandledRejection);
  }, []);

  useEffect(() => {
    if (!selectedPlace) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setSelectedPlace(null);
      }
    }

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedPlace]);

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocationError("unavailable");
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserLocation({
          coordinates: [position.coords.latitude, position.coords.longitude],
          accuracy: Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null,
        });
        setLocationError(null);
      },
      (error) => {
        setLocationError(readGeolocationError(error));
      },
      {
        enableHighAccuracy: true,
        maximumAge: 15_000,
        timeout: 20_000,
      },
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  function selectPlace(place: MapPlace) {
    setSelectedPlace(place);
    const map = mapRef.current;
    if (map) {
      void panMapToPlace(
        map,
        displayCoordinates.get(place.id) ?? place.coordinates,
      );
    }
  }

  function applyUserPosition(position: GeolocationPosition) {
    const next: UserLocation = {
      coordinates: [position.coords.latitude, position.coords.longitude],
      accuracy: Number.isFinite(position.coords.accuracy)
        ? position.coords.accuracy
        : null,
    };
    setUserLocation(next);
    setLocationError(null);
    return next;
  }

  function locateUser() {
    if (!navigator.geolocation) {
      setLocationError("unavailable");
      return;
    }

    setLocating(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const next = applyUserPosition(position);
        const map = mapRef.current;
        if (map) {
          void centerMapOnUser(map, next.coordinates);
        }
        setLocating(false);
      },
      (error) => {
        setLocationError(readGeolocationError(error));
        setLocating(false);
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5_000,
        timeout: 15_000,
      },
    );
  }

  function handleMapError() {
    setMapLoadError("load");
  }

  const locationErrorText =
    locationError === "denied"
      ? t("locationDenied")
      : locationError === "unavailable"
        ? t("locationUnavailable")
        : null;

  const showMap = Boolean(apiKey) && mapLoadError === null;

  return (
    <div className="fixed inset-0 z-0 overflow-hidden bg-slate-100 pt-14 pb-20 sm:pt-16 sm:pb-24">
      {showMap ? (
        <YMaps
          query={{
            apikey: apiKey,
            // Yandex typings omit zh_CN, but the API accepts it
            lang: mapsLang as "ru_RU" | "en_US",
            load: "package.full",
          }}
        >
          <MapCanvas
            places={places}
            displayCoordinates={displayCoordinates}
            favoriteIds={favoriteIdSet}
            userLocation={userLocation}
            userHint={t("youAreHere")}
            selectedPlace={selectedPlace}
            onSelectPlace={selectPlace}
            onClearSelection={() => setSelectedPlace(null)}
            onMapError={handleMapError}
            mapRef={mapRef}
          />
        </YMaps>
      ) : (
        <div className="flex h-full items-center justify-center px-6">
          <div className="flex max-w-sm flex-col items-center gap-4 rounded-3xl bg-white px-6 py-10 text-center shadow-md">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-slate-900">
              {t("mapLoadErrorTitle")}
            </h2>
            <p className="text-sm leading-relaxed text-slate-500">
              {mapLoadError === "missing-key"
                ? t("mapMissingKey")
                : t("mapLoadErrorDescription")}
            </p>
            <Link
              href="/places"
              className="inline-flex items-center justify-center rounded-xl bg-amber-950 px-5 py-3.5 text-sm font-medium tracking-wide text-slate-50 transition-colors hover:bg-amber-900"
            >
              {t("openPlacesList")}
            </Link>
          </div>
        </div>
      )}

      <div
        role="group"
        aria-label={t("filtersLabel")}
        className="pointer-events-none absolute top-16 right-0 left-0 z-40 flex justify-center px-4 sm:top-[4.5rem]"
      >
        <div className="pointer-events-auto flex max-w-3xl flex-wrap gap-2">
          <Link
            href="/places"
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 text-xs font-medium tracking-wide text-slate-600 shadow-sm ring-1 ring-slate-200/90 transition-colors hover:text-amber-950"
          >
            <List className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
            {t("viewAsList")}
          </Link>
        </div>
      </div>

      {showMap ? (
        <div className="pointer-events-none absolute right-4 bottom-24 z-40 flex flex-col items-end gap-2 sm:right-6 sm:bottom-28">
          {locationErrorText ? (
            <p className="pointer-events-none max-w-[14rem] rounded-2xl bg-white/95 px-3 py-2 text-right text-[11px] leading-snug text-slate-600 shadow-sm ring-1 ring-slate-200/90">
              {locationErrorText}
            </p>
          ) : null}
          <button
            type="button"
            onClick={locateUser}
            disabled={locating}
            aria-label={t("locateMe")}
            title={t("locateMe")}
            className="pointer-events-auto inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-amber-950 shadow-sm ring-1 ring-slate-200/90 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            <LocateFixed
              className={`h-5 w-5 ${locating ? "animate-pulse" : ""}`}
              strokeWidth={2.1}
              aria-hidden
            />
            <span className="sr-only">
              {locating ? t("locating") : t("locateMe")}
            </span>
          </button>
        </div>
      ) : null}

      <PlacePreviewSheet
        place={selectedPlace ? toSheetSeed(selectedPlace) : null}
        onClose={() => setSelectedPlace(null)}
      />
    </div>
  );
}

export { PlacesMap as Map };
