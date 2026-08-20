"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ShareButton } from "@/components/ShareButton";
import { useUI } from "@/context/UIContext";
import { useTranslations } from "next-intl";

export function Header() {
  const t = useTranslations("Header");
  const pathname = usePathname();
  const { isAtmosphericMode } = useUI();

  if (pathname === "/") {
    return null;
  }

  return (
    <header
      className={`fixed top-0 right-0 left-0 z-50 border-b backdrop-blur-md transition-colors duration-500 ease-in-out ${
        isAtmosphericMode
          ? "border-slate-800 bg-slate-900/85"
          : "border-slate-100 bg-white/80"
      }`}
    >
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className={`flex min-w-0 items-center transition-colors duration-500 ease-in-out hover:opacity-80 ${
            isAtmosphericMode ? "text-slate-100" : "text-slate-900"
          }`}
        >
          <span className="truncate font-serif text-sm font-semibold tracking-tight sm:text-base">
            {t("brand")}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher atmospheric={isAtmosphericMode} />
          <ShareButton variant="icon" atmospheric={isAtmosphericMode} />
        </div>
      </div>
    </header>
  );
}
