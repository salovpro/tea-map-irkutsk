"use client";

import { useLocale, useTranslations } from "next-intl";

/**
 * Required Yandex Tiles API chrome: clickable logo + terms link.
 * No "Open in Maps" CTA (removed by product request).
 * Official logo SVGs already include padding — do not add extra inset.
 */
export function YandexMapBranding() {
  const locale = useLocale();
  const t = useTranslations("Map");
  const useRuLogo = locale === "ru" || locale === "zh";
  const logoSrc = useRuLogo
    ? "/yandex/yndex_logo_ru.svg"
    : "/yandex/yndex_logo_en.svg";
  const mapsHome =
    locale === "en" ? "https://yandex.com/maps/" : "https://yandex.ru/maps/";
  const termsHref =
    locale === "en"
      ? "https://yandex.com/legal/maps_termsofuse/"
      : "https://yandex.ru/legal/maps_termsofuse/";

  return (
    <div className="pointer-events-none absolute bottom-0 left-0 z-[460] flex flex-col items-start">
      <a
        href={mapsHome}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto block"
        aria-label={t("yandexLogoAria")}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={logoSrc}
          alt="Yandex"
          width={84}
          height={36}
          className="h-9 w-auto select-none"
          draggable={false}
        />
      </a>
      <a
        href={termsHref}
        target="_blank"
        rel="noopener noreferrer"
        className="pointer-events-auto mb-1 ml-2 text-[10px] leading-none text-slate-600/90 underline-offset-2 hover:underline"
      >
        {t("yandexTerms")}
      </a>
    </div>
  );
}
