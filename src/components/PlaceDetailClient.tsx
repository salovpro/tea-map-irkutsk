"use client";

import { PlaceActions, parsePhoneNumbers } from "@/components/PlaceActions";
import { RelatedPlacesCarousel } from "@/components/RelatedPlacesCarousel";
import { TeaMenuShowcase } from "@/components/TeaMenuShowcase";
import { Link } from "@/i18n/navigation";
import { extractDescriptionBody } from "@/lib/place-description";
import type { PlaceSheetDetail, RelatedPlaceCard } from "@/lib/places";
import { ArrowLeft, Phone } from "lucide-react";
import { useTranslations } from "next-intl";
import { useEffect, useMemo, useRef, useState } from "react";

type PlaceDetailClientProps = {
  place: PlaceSheetDetail;
  related: RelatedPlaceCard[];
};

function toTelHref(phone: string) {
  const normalized = phone.replace(/[^\d+]/g, "");
  return normalized ? `tel:${normalized}` : null;
}

export function PlaceDetailClient({ place, related }: PlaceDetailClientProps) {
  const t = useTranslations("PlaceDetail");
  const tMap = useTranslations("Map");
  const tCard = useTranslations("PlaceCard");
  const aboutText = extractDescriptionBody(place.description);

  const actionsRef = useRef<HTMLDivElement>(null);
  const [showFloatingButton, setShowFloatingButton] = useState(false);

  const phones = useMemo(
    () => (place.phone?.trim() ? parsePhoneNumbers(place.phone) : []),
    [place.phone],
  );
  const primaryTelHref = phones.length > 0 ? toTelHref(phones[0]) : null;

  useEffect(() => {
    const node = actionsRef.current;
    if (!node || !primaryTelHref) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFloatingButton(!entry.isIntersecting);
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      setShowFloatingButton(false);
    };
  }, [primaryTelHref]);

  return (
    <main className="w-full bg-slate-50 pb-[calc(var(--app-nav-height)+env(safe-area-inset-bottom,0px)+2rem)]">
      <div className="relative bg-slate-50">
        <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-4 pt-4 pb-12">
          <Link
            href="/places"
            className="inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-amber-950"
          >
            <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
            {t("backToList")}
          </Link>

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
                    <span className="font-serif text-6xl text-amber-950/25">
                      茶
                    </span>
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
              {place.teaItemsCount > 0 ? (
                <p className="text-base font-medium text-amber-950">
                  {place.averageCheck != null
                    ? tCard("menuStats", {
                        count: place.teaItemsCount,
                        check: place.averageCheck,
                      })
                    : tCard("menuStatsCountOnly", {
                        count: place.teaItemsCount,
                      })}
                </p>
              ) : null}
            </div>

            <div ref={actionsRef}>
              <PlaceActions
                placeId={place.id}
                name={place.name}
                phone={place.phone}
                website={place.website}
                coordinates={place.coordinates}
                variant="detail"
                showPrimary={false}
              />
            </div>
          </section>

          {aboutText ? (
            <section className="flex flex-col gap-3">
              <h2 className="font-serif text-xl font-semibold tracking-tight text-slate-900">
                {t("aboutTitle")}
              </h2>
              <p className="whitespace-pre-line text-sm leading-relaxed text-slate-600 sm:text-base">
                {aboutText}
              </p>
            </section>
          ) : null}
        </div>
      </div>

      <TeaMenuShowcase
        title={t("teaMenuTitle")}
        emptyText={t("teaMenuEmpty")}
        items={place.teaMenu}
      />

      <div className="relative z-20 bg-white">
        <div className="mx-auto w-full max-w-lg px-4 pt-10 pb-28">
          <RelatedPlacesCarousel
            places={related}
            title={t("relatedTitle")}
          />
        </div>
      </div>

      {primaryTelHref ? (
        <div
          className={`fixed inset-x-0 z-40 px-4 transition-all duration-300 ease-in-out ${
            showFloatingButton
              ? "pointer-events-auto translate-y-0 opacity-100"
              : "pointer-events-none translate-y-4 opacity-0"
          }`}
          style={{
            bottom:
              "calc(var(--app-nav-height) + env(safe-area-inset-bottom, 0px) + 0.75rem)",
          }}
        >
          <a
            href={primaryTelHref}
            className="mx-auto flex h-14 w-full max-w-lg items-center justify-center gap-2.5 rounded-2xl bg-amber-950 px-5 text-base font-medium tracking-wide text-slate-50 shadow-lg transition-colors hover:bg-amber-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-950"
          >
            <Phone className="h-5 w-5 flex-none" strokeWidth={2} aria-hidden />
            <span>{tCard("bookTable")}</span>
          </a>
        </div>
      ) : null}
    </main>
  );
}
