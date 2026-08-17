import { PlacesCatalog } from "@/components/PlacesCatalog";
import { getCatalogPlaces } from "@/lib/places";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function PlacesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("PlacesPage");
  const places = await getCatalogPlaces(locale);

  return (
    <main className="mx-auto w-full max-w-lg px-4 pt-4 pb-[calc(var(--app-nav-height)+env(safe-area-inset-bottom,0px)+1.5rem)]">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
            {t("title")}
          </h1>
          <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
            {t("subtitle")}
          </p>
        </header>

        <PlacesCatalog places={places} />
      </div>
    </main>
  );
}
