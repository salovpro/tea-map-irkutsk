"use client";

import { useLocale, useTranslations } from "next-intl";

export function PartnersBlock() {
  const locale = useLocale();
  const t = useTranslations("Partners");
  const rshbSrc = locale === "ru" ? "/logos/rshb-ru.png" : "/logos/rshb-en.png";

  return (
    <div className="mt-2 border-t border-slate-200/80 pt-8">
      <div className="flex items-center justify-center gap-5 sm:gap-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/irkutsk-arms.png"
          alt={t("irkutskAlt")}
          className="h-14 w-auto max-w-[28%] object-contain sm:h-16"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/tppvs.png"
          alt={t("tppvsAlt")}
          className="h-14 w-auto max-w-[28%] object-contain sm:h-16"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={rshbSrc}
          alt={t("rshbAlt")}
          className="h-10 w-auto max-w-[28%] object-contain sm:h-12"
        />
      </div>
    </div>
  );
}
