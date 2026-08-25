"use client";

import { useUserLocation } from "@/hooks/useUserLocation";
import { findNearestPlaceId } from "@/lib/geo";
import { useMemo } from "react";

type PlaceWithCoordinates = {
  id: string;
  coordinates: [number, number];
};

/** Nearest place id for the current user fix, or null if geo is unavailable. */
export function useNearestPlaceId(
  places: PlaceWithCoordinates[],
): string | null {
  const userCoordinates = useUserLocation();

  return useMemo(
    () => findNearestPlaceId(places, userCoordinates),
    [places, userCoordinates],
  );
}
