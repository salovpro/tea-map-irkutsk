import { PlaceCard } from "@/components/PlaceCard";
import type { CatalogPlace } from "@/lib/places";

type PlacesListProps = {
  places: CatalogPlace[];
  nearestPlaceId?: string | null;
};

export function PlacesList({ places, nearestPlaceId = null }: PlacesListProps) {
  if (places.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-col gap-4 sm:gap-5">
      {places.map((place) => (
        <PlaceCard
          key={place.id}
          id={place.id}
          name={place.name}
          address={place.address}
          phone={place.phone}
          website={place.website}
          coordinates={place.coordinates}
          ratingAvg={place.ratingAvg}
          teaItemsCount={place.teaItemsCount}
          averageCheck={place.averageCheck}
          isNearest={nearestPlaceId === place.id}
        />
      ))}
    </div>
  );
}
