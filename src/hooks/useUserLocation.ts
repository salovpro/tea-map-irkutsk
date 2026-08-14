"use client";

import { useSyncExternalStore } from "react";

export type UserCoordinates = [number, number];

type LocationSnapshot = {
  coordinates: UserCoordinates | null;
};

let snapshot: LocationSnapshot = { coordinates: null };
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
      snapshot = {
        coordinates: [position.coords.latitude, position.coords.longitude],
      };
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
  if (subscriberCount === 1) startWatch();

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
  return { coordinates: null };
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
