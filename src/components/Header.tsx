"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ShareButton } from "@/components/ShareButton";
import { useUI } from "@/context/UIContext";
import { useTranslations } from "next-intl";

function BrandMark({ atmospheric }: { atmospheric: boolean }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-8 w-8 shrink-0 transition-colors duration-500 ease-in-out"
      aria-hidden
      fill="none"
    >
      <circle
        cx="16"
        cy="16"
        r="15"
        className={
          atmospheric ? "stroke-white/25" : "stroke-amber-950/20"
        }
        strokeWidth="1"
      />
      <path
        d="M10 14c0-3.3 2.7-6 6-6s6 2.7 6 6v5.5c0 1.4-1.1 2.5-2.5 2.5h-7C11.1 22 10 20.9 10 19.5V14Z"
        className={atmospheric ? "fill-amber-100" : "fill-amber-950"}
      />
      <path
        d="M22 15.5h1.5A2.5 2.5 0 0 1 26 18v0A2.5 2.5 0 0 1 23.5 20.5H22"
        className={atmospheric ? "stroke-amber-200" : "stroke-amber-800"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 25h8"
        className={atmospheric ? "stroke-amber-200" : "stroke-amber-800"}
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 9.5c.8-1.2 1.6-1.8 2.4-1.8"
        className={atmospheric ? "stroke-amber-100/80" : "stroke-amber-700/80"}
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

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
          className={`flex min-w-0 items-center gap-2.5 transition-colors duration-500 ease-in-out hover:opacity-80 ${
            isAtmosphericMode ? "text-slate-100" : "text-slate-900"
          }`}
        >
          <BrandMark atmospheric={isAtmosphericMode} />
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
