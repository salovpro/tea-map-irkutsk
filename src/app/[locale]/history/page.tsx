import { Link } from "@/i18n/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function HistoryPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("HistoryPage");

  return (
    <main className="w-full bg-stone-50">
      <article className="mx-auto max-w-2xl px-4 pt-4 pb-24 sm:px-6">
        <header className="flex flex-col gap-6 pb-12 text-center sm:gap-8 sm:pb-16">
          <p className="text-xs font-medium uppercase tracking-[0.22em] text-amber-900/70">
            {t("eyebrow")}
          </p>
          <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.15]">
            {t("title")}
          </h1>
          <p className="mx-auto max-w-xl text-lg leading-relaxed text-slate-500 sm:text-xl sm:leading-relaxed">
            {t("lead")}
          </p>
        </header>

        <div className="mx-auto mb-12 h-px w-16 bg-amber-900/30 sm:mb-16" />

        <div className="flex flex-col gap-10 text-base leading-relaxed text-slate-700 sm:gap-12 sm:text-lg sm:leading-[1.85]">
          <section className="flex flex-col gap-5">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {t("s1Title")}
            </h2>
            <p>{t("s1p1")}</p>
            <p>{t("s1p2")}</p>
          </section>

          <div className="mx-auto h-px w-full max-w-xs bg-slate-200" />

          <section className="flex flex-col gap-5">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {t("s2Title")}
            </h2>
            <p>{t("s2p1")}</p>
            <p>{t("s2p2")}</p>
          </section>

          <blockquote className="relative border-l-2 border-amber-800/60 py-2 pl-6 sm:pl-8">
            <p className="text-xl font-medium leading-snug text-slate-900 sm:text-2xl sm:leading-snug">
              {t("quote")}
            </p>
            <footer className="mt-4 text-sm tracking-wide text-slate-500">
              {t("quoteAttr")}
            </footer>
          </blockquote>

          <div className="mx-auto h-px w-full max-w-xs bg-slate-200" />

          <section className="flex flex-col gap-5">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {t("s3Title")}
            </h2>
            <p>{t("s3p1")}</p>
            <p>{t("s3p2")}</p>
          </section>

          <div className="mx-auto h-px w-full max-w-xs bg-slate-200" />

          <section className="flex flex-col gap-5">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
              {t("s4Title")}
            </h2>
            <p>{t("s4p1")}</p>
            <p>{t("s4p2")}</p>
          </section>
        </div>

        <aside className="mt-16 flex flex-col gap-6 rounded-2xl bg-white p-8 text-center shadow-sm sm:mt-20 sm:gap-8 sm:p-10">
          <div className="flex flex-col gap-3">
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-slate-900">
              {t("ctaTitle")}
            </h2>
            <p className="mx-auto max-w-md text-base leading-relaxed text-slate-500">
              {t("ctaText")}
            </p>
          </div>
          <Link
            href="/places"
            className="inline-flex w-full items-center justify-center rounded-xl bg-amber-950 px-8 py-4 text-sm font-medium tracking-wide text-slate-50 transition-colors hover:bg-amber-900 sm:mx-auto sm:w-auto sm:min-w-[240px]"
          >
            {t("ctaButton")}
          </Link>
        </aside>
      </article>
    </main>
  );
}
