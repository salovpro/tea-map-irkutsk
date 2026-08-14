"use client";

import { completeOnboarding } from "@/lib/onboarding";
import { useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";

export function WelcomeClient() {
  const t = useTranslations("Welcome");
  const router = useRouter();

  function goToMap() {
    completeOnboarding();
    router.replace("/");
  }

  const paragraphs = [t("p1"), t("p2"), t("p3"), t("p4"), t("p5"), t("p6")];

  return (
    <main className="relative flex min-h-dvh flex-col">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(120,53,15,0.07),_transparent_50%),linear-gradient(180deg,#f8fafc_0%,#f3f0ea_100%)]"
      />

      <div className="relative mx-auto flex w-full max-w-lg flex-1 flex-col px-6 py-12 sm:px-8 sm:py-16">
        <div className="flex flex-1 flex-col gap-8">
          <header className="flex flex-col gap-3">
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-amber-900/70">
              {t("eyebrow")}
            </p>
            <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl">
              {t("greeting")}
            </h1>
            <p className="font-serif text-lg leading-snug text-slate-700 sm:text-xl">
              {t("lead")}
            </p>
          </header>

          <div className="flex flex-col gap-5 text-base leading-relaxed text-slate-600 sm:text-[1.05rem] sm:leading-[1.7]">
            {paragraphs.map((text) => (
              <p key={text.slice(0, 24)}>{text}</p>
            ))}
          </div>
        </div>

        <div className="sticky bottom-0 -mx-6 mt-10 border-t border-slate-200/80 bg-gradient-to-t from-[#f3f0ea] via-[#f3f0ea] to-transparent px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:-mx-8 sm:px-8">
          <button
            type="button"
            onClick={goToMap}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-amber-950 px-6 py-4 text-base font-medium tracking-wide text-slate-50 transition-colors hover:bg-amber-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-950"
          >
            {t("cta")}
          </button>
        </div>
      </div>
    </main>
  );
}
