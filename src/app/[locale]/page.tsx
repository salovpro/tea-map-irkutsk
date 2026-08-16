import { MapLoader } from "@/components/MapLoader";
import { getMapPlaces } from "@/lib/places";
import { setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const places = await getMapPlaces(locale);

  return (
    <main className="relative h-0 min-h-0 flex-1 overflow-hidden">
      <MapLoader places={places} />
    </main>
  );
}
