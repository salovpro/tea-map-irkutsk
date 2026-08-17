"use client";

import { Link, usePathname } from "@/i18n/navigation";
import { useUI } from "@/context/UIContext";
import { BookOpen, Heart, Info, Map as MapIcon, Store } from "lucide-react";
import { useTranslations } from "next-intl";

const NAV_ITEMS = [
  { href: "/", key: "map" as const, icon: MapIcon },
  { href: "/places", key: "places" as const, icon: Store },
  { href: "/favorites", key: "favorites" as const, icon: Heart },
  { href: "/history", key: "history" as const, icon: BookOpen },
  { href: "/about", key: "about" as const, icon: Info },
];

function isActivePath(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navigation() {
  const t = useTranslations("Navigation");
  const pathname = usePathname();
  const { isAtmosphericMode } = useUI();

  return (
    <nav
      aria-label={t("ariaLabel")}
      className={`fixed right-0 bottom-0 left-0 z-50 pb-[env(safe-area-inset-bottom,0px)] transition-colors duration-500 ease-in-out ${
        isAtmosphericMode ? "bg-slate-900/85 backdrop-blur-md" : "bg-[#ffffff]"
      }`}
      style={{
        height:
          "calc(var(--app-nav-height) + env(safe-area-inset-bottom, 0px))",
      }}
    >
      <ul className="mx-auto flex h-[var(--app-nav-height)] max-w-3xl items-center justify-around px-1 sm:px-4">
        {NAV_ITEMS.map(({ href, key, icon: Icon }) => {
          const active = isActivePath(pathname, href);
          const filledHeart = key === "favorites" && active;

          return (
            <li key={href} className="flex h-full flex-1">
              <Link
                href={href}
                aria-current={active ? "page" : undefined}
                className={`flex h-full w-full flex-col items-center justify-center gap-0.5 rounded-xl px-0.5 text-[10px] leading-tight font-medium tracking-wide transition-colors duration-500 ease-in-out sm:px-2 sm:text-xs ${
                  isAtmosphericMode
                    ? active
                      ? "text-amber-200"
                      : "text-slate-400 hover:text-slate-200"
                    : active
                      ? "text-amber-900"
                      : "text-slate-400 hover:text-slate-700"
                }`}
              >
                <Icon
                  className={`h-5 w-5 sm:h-[1.35rem] sm:w-[1.35rem] ${
                    isAtmosphericMode
                      ? active
                        ? "stroke-amber-200"
                        : ""
                      : active
                        ? "stroke-amber-800"
                        : ""
                  } ${
                    filledHeart
                      ? isAtmosphericMode
                        ? "fill-amber-200"
                        : "fill-amber-900"
                      : ""
                  }`}
                  strokeWidth={active ? 2.25 : 1.75}
                  aria-hidden
                />
                <span className="text-center">{t(key)}</span>
                {active ? (
                  <span
                    aria-hidden
                    className={`mt-0.5 h-0.5 w-5 rounded-full transition-colors duration-500 ease-in-out ${
                      isAtmosphericMode ? "bg-amber-200" : "bg-amber-800"
                    }`}
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
