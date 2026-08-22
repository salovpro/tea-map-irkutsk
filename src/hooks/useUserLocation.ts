"use client";

import {
  queryDeviceGeoPermission,
  storeGeoPermission,
} from "@/lib/geo-permission";
import { useSyncExternalStore } from "react";

export type UserCoordinates = [number, number];

type LocationSnapshot = {
  coordinates: UserCoordinates | null;
};

const SERVER_SNAPSHOT: LocationSnapshot = { coordinates: null };
let snapshot: LocationSnapshot = SERVER_SNAPSHOT;
let watchId: number | null = null;
let subscriberCount = 0;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) listener();
}

function startWatch() {
  if (
    watchId !== null ||
    typeof navigator === "undefined" ||
    !navigator.geolocation
  ) {
    return;
  }

  watchId = navigator.geolocation.watchPosition(
    (position) => {
      const lat = position.coords.latitude;
      const lng = position.coords.longitude;
      const current = snapshot.coordinates;
      if (current && current[0] === lat && current[1] === lng) {
        return;
      }
      snapshot = { coordinates: [lat, lng] };
      emit();
    },
    () => {
      // Keep last known coordinates; distance stays hidden until first fix.
    },
    {
      enableHighAccuracy: false,
      maximumAge: 30_000,
      timeout: 15_000,
    },
  );
}

function stopWatch() {
  if (
    watchId === null ||
    typeof navigator === "undefined" ||
    !navigator.geolocation
  ) {
    return;
  }
  navigator.geolocation.clearWatch(watchId);
  watchId = null;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  subscriberCount += 1;
  if (subscriberCount === 1) {
    void queryDeviceGeoPermission().then((state) => {
      if (state === "granted") startWatch();
    });
  }

  return () => {
    listeners.delete(listener);
    subscriberCount = Math.max(0, subscriberCount - 1);
    if (subscriberCount === 0) stopWatch();
  };
}

function getSnapshot(): LocationSnapshot {
  return snapshot;
}

function getServerSnapshot(): LocationSnapshot {
  return SERVER_SNAPSHOT;
}

/** Start watching after the user has granted geolocation (and remember it). */
export function startUserLocationWatch() {
  storeGeoPermission("granted");
  startWatch();
}

export function markUserLocationDenied() {
  storeGeoPermission("denied");
}

/** Shared device geolocation for list cards and other UI (one watch for all). */
export function useUserLocation(): UserCoordinates | null {
  const { coordinates } = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );
  return coordinates;
}
