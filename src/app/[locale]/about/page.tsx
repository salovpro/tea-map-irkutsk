import { PartnersBlock } from "@/components/PartnersBlock";
import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("AboutPage");
  const welcome = await getTranslations("Welcome");
  const paragraphs = [
    welcome("p1"),
    welcome("p2"),
    welcome("p3"),
    welcome("p4"),
    welcome("p5"),
    welcome("p6"),
  ];

  return (
    <main className="w-full bg-stone-50">
      <article className="mx-auto max-w-2xl px-4 pt-4 pb-24 sm:px-6">
        <header className="flex flex-col gap-6 pb-10 sm:gap-8 sm:pb-12">
          <h1 className="font-serif text-3xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl sm:leading-[1.15]">
            {t("title")}
          </h1>
          <div className="flex flex-col gap-3">
            <p className="font-serif text-xl font-semibold leading-snug text-slate-900 sm:text-2xl">
              {welcome("greeting")}
            </p>
            <p className="font-serif text-lg leading-snug text-slate-700 sm:text-xl">
              {welcome("lead")}
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-5 text-base leading-relaxed text-slate-700 sm:text-lg sm:leading-[1.85]">
          {paragraphs.map((text) => (
            <p key={text.slice(0, 24)}>{text}</p>
          ))}
        </div>

        <div className="mt-10">
          <PartnersBlock />
        </div>
      </article>
    </main>
  );
}
