import { PlaceDetailClient } from "@/components/PlaceDetailClient";
import {
  getPlaceSheetDetail,
  getRelatedPlaces,
} from "@/lib/places";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function PlaceDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const [place, related] = await Promise.all([
    getPlaceSheetDetail(id, locale),
    getRelatedPlaces(id, locale, 4),
  ]);

  if (!place) notFound();

  return <PlaceDetailClient place={place} related={related} />;
}
