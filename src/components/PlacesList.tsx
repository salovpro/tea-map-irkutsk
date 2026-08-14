import { PlaceCard } from "@/components/PlaceCard";
import type { CatalogPlace } from "@/lib/places";

type PlacesListProps = {
  places: CatalogPlace[];
  onPlaceOpen?: (place: CatalogPlace) => void;
};

export function PlacesList({ places, onPlaceOpen }: PlacesListProps) {
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
          phone={place.phone}
          website={place.website}
          coordinates={place.coordinates}
          ratingAvg={place.ratingAvg}
          onOpen={() => onPlaceOpen?.(place)}
        />
      ))}
    </div>
  );
}
