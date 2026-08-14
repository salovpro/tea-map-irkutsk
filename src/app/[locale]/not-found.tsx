import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function LocaleNotFound() {
  const t = await getTranslations("NotFound");

  return (
    <div className="mx-auto flex min-h-[50vh] w-full max-w-lg flex-col items-center justify-center gap-6 px-6 text-center">
      <h1 className="font-serif text-2xl font-semibold text-slate-900">404</h1>
      <p className="text-slate-500">{t("message")}</p>
      <Link
        href="/"
        className="text-sm font-medium text-amber-950 underline-offset-4 hover:underline"
      >
        {t("home")}
      </Link>
    </div>
  );
}
