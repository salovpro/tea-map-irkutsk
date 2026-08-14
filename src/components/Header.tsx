"use client";

import { Link } from "@/i18n/navigation";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { ShareButton } from "@/components/ShareButton";
import { useTranslations } from "next-intl";

function BrandMark() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="h-8 w-8 shrink-0"
      aria-hidden
      fill="none"
    >
      <circle cx="16" cy="16" r="15" className="stroke-amber-950/20" strokeWidth="1" />
      <path
        d="M10 14c0-3.3 2.7-6 6-6s6 2.7 6 6v5.5c0 1.4-1.1 2.5-2.5 2.5h-7C11.1 22 10 20.9 10 19.5V14Z"
        className="fill-amber-950"
      />
      <path
        d="M22 15.5h1.5A2.5 2.5 0 0 1 26 18v0A2.5 2.5 0 0 1 23.5 20.5H22"
        className="stroke-amber-800"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M12 25h8"
        className="stroke-amber-800"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M14 9.5c.8-1.2 1.6-1.8 2.4-1.8"
        className="stroke-amber-700/80"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Header() {
  const t = useTranslations("Header");

  return (
    <header className="fixed top-0 right-0 left-0 z-50 border-b border-slate-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-3xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <Link
          href="/"
          className="flex min-w-0 items-center gap-2.5 text-slate-900 transition-opacity hover:opacity-80"
        >
          <BrandMark />
          <span className="truncate font-serif text-sm font-semibold tracking-tight sm:text-base">
            {t("brand")}
          </span>
        </Link>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <LanguageSwitcher />
          <ShareButton variant="icon" />
        </div>
      </div>
    </header>
  );
}
