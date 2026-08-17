import { MapLoader } from "@/components/MapLoader";
import { Link } from "@/i18n/navigation";
import { getMapPlaces, PlacesLoadError } from "@/lib/places";
import { getTranslations, setRequestLocale } from "next-intl/server";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HomePage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  try {
    const places = await getMapPlaces(locale);

    return (
      <main className="relative h-0 min-h-0 flex-1 overflow-hidden">
        <MapLoader places={places} />
      </main>
    );
  } catch (error) {
    if (!(error instanceof PlacesLoadError)) {
      throw error;
    }

    const t = await getTranslations("Map");

    return (
      <main className="relative flex min-h-0 flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
        <h1 className="font-serif text-2xl font-semibold text-slate-900">
          {t("mapLoadErrorTitle")}
        </h1>
        <p className="max-w-sm text-sm leading-relaxed text-slate-500">
          {t("mapLoadErrorDescription")}
        </p>
        <Link
          href="/places"
          className="text-sm font-medium text-amber-950 underline-offset-4 hover:underline"
        >
          {t("openPlacesList")}
        </Link>
      </main>
    );
  }
}
