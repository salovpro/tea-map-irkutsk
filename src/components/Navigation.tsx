"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { BookOpen, Heart, Map as MapIcon, Store } from "lucide-react";
import { useTranslations } from "next-intl";

const NAV_ITEMS = [
  { href: "/", key: "map" as const, icon: MapIcon },
  { href: "/places", key: "places" as const, icon: Store },
  { href: "/favorites", key: "favorites" as const, icon: Heart },
  { href: "/history", key: "history" as const, icon: BookOpen },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navigation() {
  const t = useTranslations("Navigation");
  const pathname = usePathname();

  return (
    <nav
      aria-label={t("ariaLabel")}
      className="fixed right-0 bottom-0 left-0 z-50 border-t border-slate-100 bg-white"
    >
      <ul className="mx-auto flex max-w-3xl items-stretch justify-around px-1 py-2 sm:px-4 sm:py-3">
        {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
          const active = isActivePath(pathname, href);
          const filledHeart = key === "favorites" && active;

          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex flex-col items-center gap-1 rounded-xl px-1.5 py-2 text-[10px] font-medium tracking-wide transition-colors sm:px-2 sm:text-xs ${
                  active
                    ? "text-amber-900"
                    : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <Icon
                  className={`h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem] ${
                    active ? "stroke-amber-800" : ""
                  } ${filledHeart ? "fill-amber-900" : ""}`}
                  strokeWidth={active ? 2.25 : 1.75}
                  aria-hidden
                />
                <span>{t(key)}</span>
                {active ? (
                  <span
                    aria-hidden
                    className="mt-0.5 h-0.5 w-5 rounded-full bg-amber-800"
                  />
                ) : (
                  <span aria-hidden className="mt-0.5 h-0.5 w-5" />
                )}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
