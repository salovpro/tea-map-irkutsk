import { Link } from "@/i18n/navigation";
import {
  PRIVACY_POLICY_SECTIONS,
  PRIVACY_POLICY_TITLE,
} from "@/content/privacy-policy";
import { ArrowLeft } from "lucide-react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { Metadata } from "next";

type Props = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("PrivacyPage");

  return {
    title: t("title"),
    description: t("title"),
  };
}

export default async function PrivacyPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("PrivacyPage");

  return (
    <main className="min-h-dvh w-full bg-stone-50">
      <article className="mx-auto max-w-2xl px-4 pt-12 pb-[max(6rem,env(safe-area-inset-bottom))] sm:px-6 sm:pt-16">
        <Link
          href="/"
          className="mb-6 inline-flex w-fit items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-amber-950"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={2} aria-hidden />
          {t("back")}
        </Link>

        <header className="pb-8 sm:pb-10">
          <h1 className="font-serif text-2xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-4xl sm:leading-[1.2]">
            {PRIVACY_POLICY_TITLE}
          </h1>
        </header>

        <div className="flex flex-col gap-8 text-base leading-relaxed text-slate-700 sm:text-[1.05rem] sm:leading-[1.75]">
          {PRIVACY_POLICY_SECTIONS.map((section) => (
            <section key={section.heading} className="flex flex-col gap-3">
              <h2 className="font-serif text-lg font-semibold tracking-tight text-slate-900 sm:text-xl">
                {section.heading}
              </h2>
              {section.blocks.map((block, index) =>
                block.type === "paragraph" ? (
                  <p key={`${section.heading}-p-${index}`}>{block.text}</p>
                ) : (
                  <ul
                    key={`${section.heading}-l-${index}`}
                    className="flex list-disc flex-col gap-2 pl-5"
                  >
                    {block.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ),
              )}
            </section>
          ))}
        </div>
      </article>
    </main>
  );
}
