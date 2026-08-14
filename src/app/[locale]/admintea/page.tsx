import { getTranslations, setRequestLocale } from "next-intl/server";

type Props = {
  params: Promise<{ locale: string }>;
};

export default async function AdminPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("AdminPage");

  return (
    <main className="mx-auto flex w-full max-w-lg flex-1 flex-col justify-center gap-6 px-6 py-10">
      <div className="flex flex-col gap-3 text-center">
        <h1 className="font-serif text-2xl font-semibold tracking-tight text-slate-900">
          {t("title")}
        </h1>
        <p className="text-sm leading-relaxed text-slate-500">{t("subtitle")}</p>
      </div>

      <form className="flex flex-col gap-4 rounded-2xl bg-white p-6 shadow-sm sm:p-8">
        <label className="flex flex-col gap-2 text-left text-sm">
          <span className="font-medium text-slate-900">{t("email")}</span>
          <input
            type="email"
            name="email"
            autoComplete="username"
            className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-amber-900/40"
            placeholder="admin@example.com"
          />
        </label>
        <label className="flex flex-col gap-2 text-left text-sm">
          <span className="font-medium text-slate-900">{t("password")}</span>
          <input
            type="password"
            name="password"
            autoComplete="current-password"
            className="rounded-xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition-colors focus:border-amber-900/40"
          />
        </label>
        <button
          type="button"
          className="mt-2 rounded-xl bg-amber-950 px-6 py-4 text-sm font-medium tracking-wide text-slate-50 transition-colors hover:bg-amber-900"
        >
          {t("submit")}
        </button>
      </form>
    </main>
  );
}
