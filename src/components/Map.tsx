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
import { useNearestPlaceId } from "@/hooks/useNearestPlaceId";
import {
  markUserLocationDenied,
  startUserLocationWatch,
} from "@/hooks/useUserLocation";
import { Link } from "@/i18n/navigation";
import { queryDeviceGeoPermission } from "@/lib/geo-permission";
import {
  bindLogoImageFallback,
  createUserLocationIcon,
  getPinIcon,
} from "@/lib/map-pin-icon";
import type { MapPlace, PlaceSheetSeed } from "@/lib/places";

import "leaflet/dist/leaflet.css";
import "react-leaflet-cluster/dist/assets/MarkerCluster.css";

const IRKUTSK_CENTER: [number, number] = [52.286974, 104.305018];
const IRKUTSK_ZOOM = 13;
const USER_FOCUS_ZOOM = 15;
const LABEL_MIN_ZOOM = 15;
/** CARTO Positron (`light_all`) documents OSM zooms 0–20; leaflet-providers uses maxZoom 20. */
const MAP_MAX_ZOOM = 20;
const MAP_MIN_ZOOM = 10;
const PIN_FOCUS_Y_RATIO = 0.28;
const CLUSTER_MAX_ZOOM = 15;
const CLUSTER_RADIUS = 64;
/** Logo pin diameter in CSS pixels; tea-cup fallback is 40. */
const PIN_DIAMETER_PX = 44;

const NAV_BROWN = "#78350f";

const CARTO_URL =
  "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png";
const CARTO_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>';

type MapCameraView = {
  center: [number, number];
  zoom: number;
};

function exactCoordKey(lat: number, lng: number) {
  return `${lat},${lng}`;
}

/**
 * When several venues share the exact same lat/lng, sit their pins next to
 * each other so the circles meet at that coordinate (n=2: left and right).
 */
function buildAdjacentDisplayCoordinates(
  places: MapPlace[],
  map: L.Map,
  zoom: number,
): globalThis.Map<string, [number, number]> {
  const groups = new globalThis.Map<string, MapPlace[]>();

  for (const place of places) {
    const [lat, lng] = place.coordinates;
    const key = exactCoordKey(lat, lng);
    const bucket = groups.get(key);
    if (bucket) bucket.push(place);
    else groups.set(key, [place]);
  }

  const display = new globalThis.Map<string, [number, number]>();
  const radiusPx = PIN_DIAMETER_PX / 2;

  for (const group of groups.values()) {
    if (group.length === 1) {
      display.set(group[0].id, group[0].coordinates);
      continue;
    }

    const origin = map.project(group[0].coordinates, zoom);
    const count = group.length;
    const startAngle = count === 2 ? Math.PI : -Math.PI / 2;

    group.forEach((place, index) => {
      const angle = startAngle + (2 * Math.PI * index) / count;
      const point = L.point(
        origin.x + radiusPx * Math.cos(angle),
        origin.y + radiusPx * Math.sin(angle),
      );
      const latlng = map.unproject(point, zoom);
      display.set(place.id, [latlng.lat, latlng.lng]);
    });
  }

  return display;
}

function createClusterIcon(cluster: { getChildCount: () => number }) {
  const count = cluster.getChildCount();
  return L.divIcon({
    className: "tea-map-cluster-icon",
    html: `
      <div style="width:44px;height:44px;border-radius:999px;background:${NAV_BROWN};color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;box-shadow:0 3px 12px rgba(15,23,42,0.22);border:2px solid rgba(255,255,255,0.92);transform:translate(-22px,-22px);cursor:pointer;pointer-events:auto;position:relative;z-index:10;">${count}</div>
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
    teaItemsCount: place.teaItemsCount,
    averageCheck: place.averageCheck,
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

function readCameraView(map: L.Map): MapCameraView {
  const center = map.getCenter();
  return {
    center: [center.lat, center.lng],
    zoom: map.getZoom(),
  };
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

function PlaceMarker({
  place,
  position,
  favorite,
  selected,
  showLabels,
  onSelectPlace,
}: {
  place: MapPlace;
  position: [number, number];
  favorite: boolean;
  selected: boolean;
  showLabels: boolean;
  onSelectPlace: (place: MapPlace) => void;
}) {
  const displayName = place.name?.trim() || "Без названия";
  const icon = useMemo(
    () =>
      getPinIcon({
        label: displayName,
        logoUrl: place.logoUrl,
        favorite,
        selected,
        showLabel: showLabels,
      }),
    [displayName, favorite, place.logoUrl, selected, showLabels],
  );

  return (
    <Marker
      position={position}
      zIndexOffset={selected ? 1000 : favorite ? 500 : 1}
      icon={icon}
      eventHandlers={{
        click: (event) => {
          L.DomEvent.stopPropagation(event);
          onSelectPlace(place);
        },
        add: (event) => {
          const marker = event.target;
          if (!(marker instanceof L.Marker)) return;
          bindLogoImageFallback(marker, {
            label: displayName,
            logoUrl: place.logoUrl,
            favorite,
            selected,
            showLabel: showLabels,
          });
        },
      }}
    />
  );
}

function PlaceMarkers({
  places,
  favoriteIds,
  selectedPlace,
  showLabels,
  zoom,
  onSelectPlace,
}: {
  places: MapPlace[];
  favoriteIds: ReadonlySet<string>;
  selectedPlace: MapPlace | null;
  showLabels: boolean;
  zoom: number;
  onSelectPlace: (place: MapPlace) => void;
}) {
  const map = useMap();
  const displayCoordinates = useMemo(
    () => buildAdjacentDisplayCoordinates(places, map, zoom),
    [map, places, zoom],
  );

  return (
    <MarkerClusterGroup
      chunkedLoading
      showCoverageOnHover={false}
      spiderfyOnMaxZoom={false}
      zoomToBoundsOnClick
      disableClusteringAtZoom={CLUSTER_MAX_ZOOM + 1}
      maxClusterRadius={CLUSTER_RADIUS}
      iconCreateFunction={createClusterIcon}
    >
      {places.map((place) => {
        const selected = selectedPlace?.id === place.id;
        const favorite = favoriteIds.has(place.id);
        const position =
          displayCoordinates.get(place.id) ?? place.coordinates;

        return (
          <PlaceMarker
            key={`${place.id}-${showLabels ? "l" : "b"}-${favorite ? "f" : "t"}-${selected ? "s" : "n"}-${place.logoUrl ?? ""}`}
            place={place}
            position={position}
            favorite={favorite}
            selected={selected}
            showLabels={showLabels}
            onSelectPlace={onSelectPlace}
          />
        );
      })}
    </MarkerClusterGroup>
  );
}

function PlacesMap({ places }: MapProps) {
  const t = useTranslations("Map");
  const mapRef = useRef<L.Map | null>(null);
  const previousViewRef = useRef<MapCameraView | null>(null);
  const [selectedPlace, setSelectedPlace] = useState<MapPlace | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState<
    "denied" | "unavailable" | null
  >(() =>
    typeof navigator === "undefined" || !navigator.geolocation
      ? "unavailable"
      : null,
  );
  const [zoom, setZoom] = useState(IRKUTSK_ZOOM);
  const [geoWatchEnabled, setGeoWatchEnabled] = useState(false);

  const { favoriteIds } = useFavorites();
  const favoriteIdSet = useMemo(() => new Set(favoriteIds), [favoriteIds]);
  const nearestPlaceId = useNearestPlaceId(places);
  const showLabels = zoom >= LABEL_MIN_ZOOM;
  const userIcon = useMemo(() => createUserLocationIcon(), []);

  const handleZoomChange = useCallback((nextZoom: number) => {
    setZoom(nextZoom);
  }, []);

  const closeSelectedPlace = useCallback(() => {
    const map = mapRef.current;
    const previousView = previousViewRef.current;
    previousViewRef.current = null;
    setSelectedPlace(null);
    if (map && previousView) {
      map.flyTo(previousView.center, previousView.zoom, {
        duration: 0.45,
        easeLinearity: 0.25,
      });
    }
  }, []);

  useEffect(() => {
    if (!selectedPlace) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") closeSelectedPlace();
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedPlace, closeSelectedPlace]);

  useEffect(() => {
    let cancelled = false;
    void queryDeviceGeoPermission().then((state) => {
      if (!cancelled && state === "granted") setGeoWatchEnabled(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!geoWatchEnabled || !navigator.geolocation) {
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
  }, [geoWatchEnabled]);

  function selectPlace(place: MapPlace) {
    const map = mapRef.current;
    if (map && !previousViewRef.current) {
      previousViewRef.current = readCameraView(map);
    }
    setSelectedPlace(place);
    if (map) {
      panMapToPlace(map, place.coordinates);
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
        startUserLocationWatch();
        setGeoWatchEnabled(true);
        const map = mapRef.current;
        if (map) centerMapOnUser(map, next.coordinates);
        setLocating(false);
      },
      (error) => {
        const code = readGeolocationError(error);
        if (code === "denied") markUserLocationDenied();
        setLocationError(code);
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
    <div className="fixed inset-0 z-0 w-full overflow-hidden bg-slate-100">
      <div
        className="absolute inset-x-0 top-0"
        style={{
          bottom:
            "calc(var(--bottom-nav-height) + env(safe-area-inset-bottom, 0px))",
        }}
      >
        <MapContainer
          center={IRKUTSK_CENTER}
          zoom={IRKUTSK_ZOOM}
          maxZoom={MAP_MAX_ZOOM}
          minZoom={MAP_MIN_ZOOM}
          zoomControl={false}
          attributionControl={false}
          className="tea-leaflet-map h-full w-full"
          style={{ height: "100%", width: "100%" }}
        >
          <AttributionControl prefix={false} position="bottomright" />
          <TileLayer
            url={CARTO_URL}
            attribution={CARTO_ATTRIBUTION}
            maxZoom={MAP_MAX_ZOOM}
            maxNativeZoom={MAP_MAX_ZOOM}
            minZoom={MAP_MIN_ZOOM}
          />
          <MapRefBridge mapRef={mapRef} />
          <MapInteractionLayer
            onClearSelection={closeSelectedPlace}
            onZoomChange={handleZoomChange}
          />
          <PlaceMarkers
            places={places}
            favoriteIds={favoriteIdSet}
            selectedPlace={selectedPlace}
            showLabels={showLabels}
            zoom={zoom}
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
      </div>

      <div
        role="group"
        aria-label={t("filtersLabel")}
        className="pointer-events-none absolute top-6 left-4 z-[45]"
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
        isNearest={
          Boolean(selectedPlace && nearestPlaceId === selectedPlace.id)
        }
        onClose={closeSelectedPlace}
      />
    </div>
  );
}

export { PlacesMap as Map };
