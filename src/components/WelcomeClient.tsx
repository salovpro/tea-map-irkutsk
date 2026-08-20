"use client";

import { PartnersBlock } from "@/components/PartnersBlock";
import { completeOnboarding } from "@/lib/onboarding";
import { Link, useRouter } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useId, useState } from "react";

export function WelcomeClient() {
  const t = useTranslations("Welcome");
  const router = useRouter();
  const consentId = useId();
  const [accepted, setAccepted] = useState(false);

  function goToMap() {
    if (!accepted) return;
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

          <PartnersBlock />
        </div>

        <div className="sticky bottom-0 -mx-6 mt-10 flex flex-col gap-4 border-t border-slate-200/80 bg-gradient-to-t from-[#f3f0ea] via-[#f3f0ea] to-transparent px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] sm:-mx-8 sm:px-8">
          <div className="flex gap-3">
            <input
              id={consentId}
              name="privacy-consent"
              type="checkbox"
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              required
              aria-required="true"
              className="mt-1 h-4 w-4 shrink-0 accent-amber-950 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-950"
            />
            <label htmlFor={consentId} className="text-sm leading-relaxed text-slate-600">
              {t.rich("privacyConsent", {
                policy: (chunks) => (
                  <Link
                    href="/privacy"
                    className="font-medium text-amber-950 underline underline-offset-2 hover:text-amber-900"
                    onClick={(event) => event.stopPropagation()}
                  >
                    {chunks}
                  </Link>
                ),
              })}
            </label>
          </div>
          <button
            type="button"
            onClick={goToMap}
            disabled={!accepted}
            aria-disabled={!accepted}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-amber-950 px-6 py-4 text-base font-medium tracking-wide text-slate-50 transition-colors hover:bg-amber-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-950 disabled:cursor-not-allowed disabled:bg-amber-950/40 disabled:hover:bg-amber-950/40"
          >
            {t("cta")}
          </button>
        </div>
      </div>
    </main>
  );
}
