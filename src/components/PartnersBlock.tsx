"use client";

import { useLocale, useTranslations } from "next-intl";

export function PartnersBlock() {
  const locale = useLocale();
  const t = useTranslations("Partners");
  const rshbSrc = locale === "ru" ? "/logos/rshb-ru.png" : "/logos/rshb-en.png";

  return (
    <section className="mt-2 flex flex-col gap-8 border-t border-slate-200/80 pt-8">
      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-sm font-medium leading-relaxed text-slate-600">
          {t("supportedBy")}
        </p>
        <div className="flex items-center justify-center gap-6 sm:gap-8">
          <img
            src="/logos/irkutsk-arms.png"
            alt={t("irkutskAlt")}
            className="h-16 w-auto object-contain sm:h-20"
          />
          <img
            src="/logos/tppvs.png"
            alt={t("tppvsAlt")}
            className="h-16 w-auto object-contain sm:h-20"
          />
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        <p className="text-center text-sm font-medium leading-relaxed text-slate-600">
          {t("officialSponsor")}
        </p>
        <img
          src={rshbSrc}
          alt={t("rshbAlt")}
          className="h-10 w-auto object-contain sm:h-12"
        />
      </div>
    </section>
  );
}
