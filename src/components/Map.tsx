"use client";

import L from "leaflet";
import { List } from "lucide-react";
import { useTranslations } from "next-intl";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
} from "react";
import {
  AttributionControl,
  MapContainer,
  Marker,
  TileLayer,
  useMap,
  useMapEvents,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import { MapControls } from "@/components/MapControls";
import { PlacePreviewSheet } from "@/components/PlacePreviewSheet";
import { useFavorites } from "@/hooks/useFavorites";
import { Link } from "@/i18n/navigation";
import type { MapPlace, PlaceSheetSeed } from "@/lib/places";

import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";

const IRKUTSK_CENTER: [number, number] = [52.286974, 104.305018];
const IRKUTSK_ZOOM = 13;
const USER_FOCUS_ZOOM = 15;
const LABEL_MIN_ZOOM = 15;
const MAP_MAX_ZOOM = 19;
const PIN_FOCUS_Y_RATIO = 0.28;
const CLUSTER_MAX_ZOOM = 15;
const CLUSTER_RADIUS = 64;

const NAV_BROWN = "#78350f";
const NAV_BROWN_DARK = "#451a03";

const SPIDERFY_PRECISION = 4;
const SPIDERFY_BASE_RADIUS_DEG = 0.0002;

const CARTO_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

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

function coordGroupKey(lat: number, lng: number) {
  return `${lat.toFixed(SPIDERFY_PRECISION)},${lng.toFixed(SPIDERFY_PRECISION)}`;
}

function buildDisplayCoordinates(
  places: MapPlace[],
): globalThis.Map<string, [number, number]> {
  const groups = new globalThis.Map<string, MapPlace[]>();

  for (const place of places) {
    const [lat, lng] = place.coordinates;
    const key = coordGroupKey(lat, lng);
    const bucket = groups.get(key);
    if (bucket) bucket.push(place);
    else groups.set(key, [place]);
  }

  const display = new globalThis.Map<string, [number, number]>();

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

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function createPinIcon({
  label,
  favorite,
  selected,
  showLabel,
}: {
  label: string;
  favorite: boolean;
  selected: boolean;
  showLabel: boolean;
}) {
  const iconSvg = favorite ? HEART_SVG : TEA_CUP_SVG;
  const dotColor = favorite
    ? selected
      ? "#b91c1c"
      : "#ef4444"
    : selected
      ? NAV_BROWN_DARK
      : NAV_BROWN;
  const scale = selected ? 1.12 : 1;
  const withLabel = showLabel || selected;
  const safeLabel = escapeHtml(label);

  const html = withLabel
    ? `
      <div style="display:flex;align-items:center;gap:8px;transform:translate(-20px,-20px) scale(${scale});transform-origin:20px 20px;pointer-events:none;">
        <div style="width:40px;height:40px;border-radius:999px;background:${dotColor};display:flex;align-items:center;justify-content:center;flex-shrink:0;box-shadow:0 2px 10px rgba(15,23,42,0.18);border:2px solid rgba(255,255,255,0.92);">${iconSvg}</div>
        <div style="max-width:180px;padding:8px 12px;border-radius:999px;background:rgba(255,255,255,0.96);color:#0f172a;font-size:12px;font-weight:600;line-height:1.2;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;box-shadow:0 2px 10px rgba(15,23,42,0.12);border:1px solid rgba(226,232,240,0.95);">${safeLabel}</div>
      </div>
    `
    : `
      <div style="width:40px;height:40px;transform:translate(-20px,-20px) scale(${scale});transform-origin:20px 20px;pointer-events:none;">
        <div style="width:40px;height:40px;border-radius:999px;background:${dotColor};display:flex;align-items:center;justify-content:center;box-shadow:0 2px 10px rgba(15,23,42,0.18);border:2px solid rgba(255,255,255,0.92);">${iconSvg}</div>
      </div>
    `;

  return L.divIcon({
    className: "tea-map-pin-icon",
    html,
    iconSize: withLabel ? [220, 44] : [40, 40],
    iconAnchor: [20, 20],
  });
}

function createUserLocationIcon() {
  return L.divIcon({
    className: "tea-map-user-icon",
    html: `
      <div style="width:48px;height:48px;transform:translate(-24px,-24px);pointer-events:none;">
        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none" aria-hidden="true">
          <circle cx="24" cy="24" r="18" fill="#2563eb" fill-opacity="0.18"/>
          <circle cx="24" cy="24" r="9" fill="#ffffff"/>
          <circle cx="24" cy="24" r="6.5" fill="#2563eb"/>
        </svg>
      </div>
    `,
    iconSize: [48, 48],
    iconAnchor: [24, 24],
  });
}

function createClusterIcon(cluster: { getChildCount: () => number }) {
  const count = cluster.getChildCount();
  return L.divIcon({
    className: "tea-map-cluster-icon",
    html: `
      <div style="width:44px;height:44px;border-radius:999px;background:${NAV_BROWN};color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;box-shadow:0 3px 12px rgba(15,23,42,0.22);border:2px solid rgba(255,255,255,0.92);transform:translate(-22px,-22px);">${count}</div>
    `,
    iconSize: [44, 44],
    iconAnchor: [22, 22],
  });
}

type MapProps = { places: MapPlace[] };

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

function panMapToPlace(map: L.Map, coordinates: [number, number]) {
  const zoom = Math.max(map.getZoom(), LABEL_MIN_ZOOM);
  const point = map.project(coordinates, zoom);
  const size = map.getSize();
  const offsetY = size.y / 2 - size.y * PIN_FOCUS_Y_RATIO;
  const targetLatLng = map.unproject(point.add([0, offsetY]), zoom);
  map.flyTo(targetLatLng, zoom, { duration: 0.45, easeLinearity: 0.25 });
}

function centerMapOnUser(map: L.Map, coordinates: [number, number]) {
  const zoom = Math.max(map.getZoom(), USER_FOCUS_ZOOM);
  map.flyTo(coordinates, zoom, { duration: 0.5, easeLinearity: 0.25 });
}

function readGeolocationError(
  error: GeolocationPositionError,
): "denied" | "unavailable" {
  if (error.code === error.PERMISSION_DENIED) return "denied";
  return "unavailable";
}

function MapRefBridge({ mapRef }: { mapRef: MutableRefObject<L.Map | null> }) {
  const map = useMap();
  useEffect(() => {
    mapRef.current = map;
    return () => {
      mapRef.current = null;
    };
  }, [map, mapRef]);
  return null;
}

function MapInteractionLayer({
  onClearSelection,
  onZoomChange,
}: {
  onClearSelection: () => void;
  onZoomChange: (zoom: number) => void;
}) {
  const map = useMap();
  useMapEvents({
    click: () => onClearSelection(),
    zoom: () => onZoomChange(map.getZoom()),
    zoomend: () => onZoomChange(map.getZoom()),
  });
  useEffect(() => {
    onZoomChange(map.getZoom());
  }, [map, onZoomChange]);
  return null;
}

function PlaceMarkers({
  places,
  displayCoordinates,
  favoriteIds,
  selectedPlace,
  showLabels,
  onSelectPlace,
}: {
  places: MapPlace[];
  displayCoordinates: globalThis.Map<string, [number, number]>;
  favoriteIds: ReadonlySet<string>;
  selectedPlace: MapPlace | null;
  showLabels: boolean;
  onSelectPlace: (place: MapPlace) => void;
}) {
  return (
    <MarkerClusterGroup
      chunkedLoading
      showCoverageOnHover={false}
      spiderfyOnMaxZoom
      disableClusteringAtZoom={CLUSTER_MAX_ZOOM + 1}
      maxClusterRadius={CLUSTER_RADIUS}
      iconCreateFunction={createClusterIcon}
    >
      {places.map((place) => {
        const displayName = place.name?.trim() || "Без названия";
        const selected = selectedPlace?.id === place.id;
        const favorite = favoriteIds.has(place.id);
        const position =
          displayCoordinates.get(place.id) ?? place.coordinates;

        return (
          <Marker
            key={`${place.id}-${showLabels ? "l" : "b"}-${favorite ? "f" : "t"}-${selected ? "s" : "n"}`}
            position={position}
            zIndexOffset={selected ? 1000 : favorite ? 500 : 1}
            icon={createPinIcon({
              label: displayName,
              favorite,
              selected,
              showLabel: showLabels,
            })}
            eventHandlers={{
              click: (event) => {
                L.DomEvent.stopPropagation(event);
                onSelectPlace(place);
              },
            }}
          />
        );
      })}
    </MarkerClusterGroup>
  );
}

function PlacesMap({ places }: MapProps) {
  const t = useTranslations("Map");
  const mapRef = useRef<L.Map | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<
    "denied" | "unavailable" | null
  >(null);
  const [zoom, setZoom] = useState(IRKUTSK_ZOOM);

  const displayCoordinates = useMemo(
    () => buildDisplayCoordinates(places),
    [places],
  );
  const { favoriteIds } = useFavorites();
  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const showLabels = zoom >= LABEL_MIN_ZOOM;
  const userIcon = useMemo(() => createUserLocationIcon(), []);

  const handleZoomChange = useCallback((nextZoom: number) => {
    setZoom(nextZoom);
  }, []);

  useEffect(() => {
    if (!selectedPlace) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setSelectedPlace(null);
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
      (error) => setLocationError(readGeolocationError(error)),
      { enableHighAccuracy: true, maximumAge: 15_000, timeout: 20_000 },
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  function selectPlace(place: MapPlace) {
    setSelectedPlace(place);
    const map = mapRef.current;
    if (map) {
      panMapToPlace(
        map,
        displayCoordinates.get(place.id) ?? place.coordinates,
      );
    }
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
        const next: UserLocation = {
          coordinates: [position.coords.latitude, position.coords.longitude],
          accuracy: Number.isFinite(position.coords.accuracy)
            ? position.coords.accuracy
            : null,
        };
        setUserLocation(next);
        const map = mapRef.current;
        if (map) centerMapOnUser(map, next.coordinates);
        setLocating(false);
      },
      (error) => {
        setLocationError(readGeolocationError(error));
        setLocating(false);
      },
      { enableHighAccuracy: true, maximumAge: 5_000, timeout: 15_000 },
    );
  }

  const locationErrorText =
    locationError === "denied"
      ? t("locationDenied")
      : locationError === "unavailable"
        ? t("locationUnavailable")
        : null;

  return (
    <div className="fixed inset-0 z-0 h-screen w-full overflow-hidden bg-slate-100 pb-[calc(var(--app-nav-height)+env(safe-area-inset-bottom,0px))]">
      <MapContainer
        center={IRKUTSK_CENTER}
        zoom={IRKUTSK_ZOOM}
        maxZoom={MAP_MAX_ZOOM}
        minZoom={10}
        zoomControl={false}
        attributionControl={false}
        className="tea-leaflet-map h-full w-full"
        style={{ height: "100%", width: "100%" }}
      >
        <AttributionControl prefix={false} position="bottomright" />
        <TileLayer url={CARTO_URL} attribution={CARTO_ATTRIBUTION} />
        <MapRefBridge mapRef={mapRef} />
        <MapInteractionLayer
          onClearSelection={() => setSelectedPlace(null)}
          onZoomChange={handleZoomChange}
        />
        <PlaceMarkers
          places={places}
          displayCoordinates={displayCoordinates}
          favoriteIds={favoriteIdSet}
          selectedPlace={selectedPlace}
          showLabels={showLabels}
          onSelectPlace={selectPlace}
        />
        {userLocation ? (
          <Marker
            position={userLocation.coordinates}
            icon={userIcon}
            zIndexOffset={2000}
            interactive={false}
            title={t("youAreHere")}
          />
        ) : null}
        <MapControls
          locating={locating}
          locationErrorText={locationErrorText}
          onLocate={locateUser}
        />
      </MapContainer>

      <div
        role="group"
        aria-label={t("filtersLabel")}
        className="pointer-events-none absolute top-6 left-4 z-[1000]"
      >
        <Link
          href="/places"
          className="pointer-events-auto inline-flex h-12 items-center gap-1.5 rounded-full bg-white/90 px-4 text-xs font-medium tracking-wide text-slate-600 shadow-lg ring-1 ring-slate-200/70 backdrop-blur-md transition-transform hover:text-amber-950 active:scale-95"
        >
          <List className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          {t("viewAsList")}
        </Link>
      </div>

      <PlacePreviewSheet
        place={selectedPlace ? toSheetSeed(selectedPlace) : null}
        onClose={() => setSelectedPlace(null)}
      />
    </div>
  );
}

export { PlacesMap as Map };
