import { PlaceActions } from "@/components/PlaceActions";
import { RelatedPlacesCarousel } from "@/components/RelatedPlacesCarousel";
import { Link } from "@/i18n/navigation";
import {
  getPlaceSheetDetail,
  getRelatedPlaces,
} from "@/lib/places";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

type Props = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function PlaceDetailPage({ params }: Props) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("PlaceDetail");
  const tMap = await getTranslations("Map");

  const [place, related] = await Promise.all([
    getPlaceSheetDetail(id, locale),
    getRelatedPlaces(id, locale, 4),
  ]);

  if (!place) notFound();

  return (
    <main className="mx-auto w-full max-w-lg px-4 pt-20 pb-28">
      <div className="flex flex-col gap-10">
        <Link
          href="/places"
          className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-amber-950"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          {t("backToList")}
        </Link>

        {/* Block 1: Header */}
        <section className="flex flex-col gap-5">
          <div className="overflow-hidden rounded-3xl bg-slate-100">
            <div className="relative aspect-[16/10] w-full">
              {place.logoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={place.logoUrl}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover"
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-amber-50 to-slate-100">
                  <span className="font-serif text-6xl text-amber-950/25">茶</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-2">
            <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-amber-900/70">
              {place.isPremium
                ? tMap("premiumDescriptor")
                : tMap("teaHouseDescriptor")}
            </p>
            <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-slate-900">
              {place.name}
            </h1>
            {place.address ? (
              <p className="text-sm leading-relaxed text-slate-500">
                {place.address}
              </p>
            ) : null}
          </div>

          <PlaceActions
            placeId={place.id}
            name={place.name}
            phone={place.phone}
            website={place.website}
            coordinates={place.coordinates}
            variant="detail"
            showPrimary={false}
          />
        </section>

        {/* Block 2: Description */}
        <section className="flex flex-col gap-3">
          <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">
            {t("aboutTitle")}
          </h2>
          <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
            {place.description || tMap("noDescription")}
          </p>
        </section>

        {/* Block 3: Tea menu */}
        <section className="flex flex-col gap-4">
          <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">
            {t("teaMenuTitle")}
          </h2>
          {place.teaMenu.length > 0 ? (
            <ul className="flex flex-col gap-3">
              {place.teaMenu.map((item, index) => (
                <li
                  key={`${item.title}-${index}`}
                  className="flex items-start justify-between gap-4 rounded-2xl bg-white px-4 py-3.5 shadow-sm"
                >
                  <div className="min-w-0 flex flex-col gap-1">
                    {item.category ? (
                      <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-slate-400">
                        {item.category}
                      </span>
                    ) : null}
                    <span className="text-sm font-medium text-slate-900">
                      {item.title}
                    </span>
                    {item.volume ? (
                      <span className="text-xs text-slate-400">{item.volume}</span>
                    ) : null}
                    {item.description ? (
                      <span className="text-xs leading-relaxed text-slate-500">
                        {item.description}
                      </span>
                    ) : null}
                  </div>
                  {item.price != null ? (
                    <span className="shrink-0 text-sm font-medium text-slate-900">
                      {item.price} ₽
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-slate-500">{t("teaMenuEmpty")}</p>
          )}
        </section>

        {/* Block 4: Related */}
        <RelatedPlacesCarousel
          places={related}
          title={t("relatedTitle")}
        />
      </div>
    </main>
  );
}
