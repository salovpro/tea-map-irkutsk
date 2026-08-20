import { PartnersBlock } from "@/components/PartnersBlock";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("AboutPage");

  return (
    <main className="w-full bg-stone-50">
      <article className="mx-auto max-w-2xl px-4 pt-4 pb-24 sm:px-6">
        <header className="flex flex-col gap-6 pb-10 sm:gap-8 sm:pb-12">
          <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.15]">
            {t("title")}
          </h1>
        </header>

        <div className="flex flex-col gap-5 text-base leading-relaxed text-slate-700 sm:text-lg sm:leading-[1.85]">
          <p>{t("p1")}</p>
          <p>{t("p2")}</p>
          <p>{t("p3")}</p>
          <p>{t("p4")}</p>
          <div className="flex flex-col gap-3">
            <p>{t("contactsLead")}</p>
            <p>
              {t("phoneLabel")}{" "}
              <a
                href="tel:+73952335100"
                className="font-medium text-amber-950 underline-offset-2 hover:underline"
              >
                {t("phoneValue")}
              </a>
            </p>
            <p>
              {t("emailLabel")}{" "}
              <a
                href="mailto:dcp@tppvs.ru"
                className="font-medium text-amber-950 underline-offset-2 hover:underline"
              >
                {t("emailValue")}
              </a>
            </p>
          </div>
        </div>

        <div className="mt-10">
          <PartnersBlock />
        </div>
      </article>
    </main>
  );
}
