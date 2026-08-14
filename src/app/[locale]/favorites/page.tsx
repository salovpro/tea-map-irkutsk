import { FavoritesClient } from "@/components/FavoritesClient";
import { getCatalogPlaces } from "@/lib/places";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function FavoritesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("FavoritesPage");
  const places = await getCatalogPlaces(locale);

  return (
    <main className="mx-auto w-full max-w-lg px-4 pt-20 pb-24">
      <div className="flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900">
            {t("title")}
          </h1>
          <p className="text-sm leading-relaxed text-slate-500 sm:text-base">
            {t("subtitle")}
          </p>
        </header>

        <FavoritesClient places={places} />
      </div>
    </main>
  );
}
