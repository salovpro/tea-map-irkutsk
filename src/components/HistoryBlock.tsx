import { getTranslations } from "next-intl/server";

export async function HistoryBlock() {
  const t = await getTranslations("HistoryBlock");

  return (
    <section className="w-full bg-stone-50">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-6 px-6 py-8 sm:gap-8 sm:py-10">
        <header className="flex flex-col gap-4">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-amber-900/70">
            {t("eyebrow")}
          </p>
          <h2 className="font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            {t("title")}
          </h2>
          <p className="text-base leading-relaxed text-slate-500 sm:text-lg">
            {t("subtitle")}
          </p>
        </header>

        <div className="flex flex-col gap-6 text-base leading-relaxed text-slate-700 sm:text-lg">
          <p>{t("p1")}</p>
          <p>{t("p2")}</p>
          <p>{t("p3")}</p>
        </div>
      </div>
    </section>
  );
}
