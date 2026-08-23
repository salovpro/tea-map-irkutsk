"use client";

import { RshbLogo } from "@/components/RshbLogo";
import { useTranslations } from "next-intl";

export function PartnersBlock() {
  const t = useTranslations("Partners");

  return (
    <div className="mt-2 border-t border-slate-200/80 pt-8">
      <div className="flex items-center justify-center gap-5 sm:gap-8">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/tppvs.png"
          alt={t("tppvsAlt")}
          className="h-14 w-auto max-w-[28%] object-contain sm:h-16"
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logos/irkutsk-arms.png"
          alt={t("irkutskAlt")}
          className="h-14 w-auto max-w-[28%] object-contain sm:h-16"
        />
        <RshbLogo
          title={t("rshbAlt")}
          className="h-11 w-auto max-w-[40%] font-sans sm:h-12"
        />
      </div>
    </div>
  );
}
