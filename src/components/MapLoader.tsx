"use client";

import dynamic from "next/dynamic";
import type { MapPlace } from "@/lib/places";
import { MapSkeleton } from "@/components/MapSkeleton";

const Map = dynamic(
  () => import("@/components/Map").then((mod) => mod.Map),
  {
    ssr: false,
    loading: () => <MapSkeleton />,
  },
);

type MapLoaderProps = {
  places: MapPlace[];
};

export function MapLoader({ places }: MapLoaderProps) {
  return <Map places={places} />;
}
