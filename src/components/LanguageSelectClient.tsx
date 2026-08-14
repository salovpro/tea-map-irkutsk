"use client";

import { completeLanguageSelection } from "@/lib/onboarding";
import { useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { useTranslations } from "next-intl";

const LOCALE_META: Record<
  (typeof routing.locales)[number],
  { native: string; english: string }
> = {
  ru: { native: "Русский", english: "Russian" },
  en: { native: "English", english: "English" },
  zh: { native: "中文", english: "Chinese" },
};

export function LanguageSelectClient() {
  const t = useTranslations("LanguageSelect");
  const router = useRouter();

  function chooseLocale(locale: (typeof routing.locales)[number]) {
    completeLanguageSelection(locale);
    router.replace("/welcome", { locale });
  }

  return (
    <main className="relative flex min-h-dvh flex-col justify-center px-6 py-12 sm:px-8">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(120,53,15,0.08),_transparent_55%),linear-gradient(180deg,#f8fafc_0%,#f1efe9_100%)]"
      />

      <div className="relative mx-auto flex w-full max-w-md flex-col gap-10">
        <header className="flex flex-col gap-4 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-900/70">
            {t("eyebrow")}
          </p>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            {t("title")}
          </h1>
          <p className="text-base leading-relaxed text-slate-500 sm:text-lg">
            {t("subtitle")}
          </p>
        </header>

        <ul className="flex flex-col gap-3">
          {routing.locales.map((locale) => {
            const meta = LOCALE_META[locale];
            return (
              <li key={locale}>
                <button
                  type="button"
                  onClick={() => chooseLocale(locale)}
                  className="flex w-full items-center justify-between rounded-2xl border border-slate-200/80 bg-white/90 px-5 py-5 text-left shadow-sm transition-colors hover:border-amber-900/25 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-950"
                >
                  <span className="flex flex-col gap-1">
                    <span className="font-serif text-lg font-semibold text-slate-900">
                      {meta.native}
                    </span>
                    <span className="text-sm text-slate-500">{meta.english}</span>
                  </span>
                  <span className="text-xs font-medium tracking-wide text-slate-400">
                    {locale.toUpperCase()}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </main>
  );
}
