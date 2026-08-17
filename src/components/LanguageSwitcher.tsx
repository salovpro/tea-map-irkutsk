"use client";

import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import type { ChangeEvent } from "react";

const LOCALE_LABELS: Record<string, string> = {
  ru: "RU",
  en: "EN",
  zh: "ZH",
};

function GlobeIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3a14 14 0 0 1 0 18" />
      <path d="M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

export function LanguageSwitcher({
  atmospheric = false,
}: {
  atmospheric?: boolean;
}) {
  const t = useTranslations("LanguageSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  function onChange(event: ChangeEvent<HTMLSelectElement>) {
    const nextLocale = event.target.value;
    if (nextLocale === locale) return;
    router.replace(pathname, { locale: nextLocale });
  }

  return (
    <label
      className={`relative inline-flex items-center gap-1.5 transition-colors duration-500 ease-in-out ${
        atmospheric ? "text-slate-300" : "text-slate-600"
      }`}
      aria-label={t("ariaLabel")}
    >
      <GlobeIcon
        className={`pointer-events-none h-4 w-4 shrink-0 transition-colors duration-500 ease-in-out ${
          atmospheric ? "text-slate-400" : "text-slate-500"
        }`}
      />
      <select
        value={locale}
        onChange={onChange}
        className={`appearance-none bg-transparent py-1 pr-4 pl-0 text-xs font-medium tracking-wide outline-none cursor-pointer transition-colors duration-500 ease-in-out ${
          atmospheric
            ? "text-slate-200 focus-visible:text-white"
            : "text-slate-700 focus-visible:text-slate-900"
        }`}
      >
        {routing.locales.map((code) => (
          <option key={code} value={code}>
            {LOCALE_LABELS[code] ?? code.toUpperCase()}
          </option>
        ))}
      </select>
      <span
        aria-hidden
        className={`pointer-events-none absolute right-0 top-1/2 -translate-y-1/2 text-[8px] leading-none transition-colors duration-500 ease-in-out ${
          atmospheric ? "text-slate-500" : "text-slate-400"
        }`}
      >
        ▼
      </span>
    </label>
  );
}
