import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import {
  isOnboardingPath,
  LANG_SELECTED_COOKIE,
  ONBOARDING_DONE_COOKIE,
} from "./lib/onboarding";

const handleI18nRouting = createMiddleware(routing);

const ADMIN_SESSION_COOKIE = "admin_session";

/** Strip optional locale prefix (`/en`, `/zh`; default `ru` has no prefix). */
function stripLocalePrefix(pathname: string): string {
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue;
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return pathname.slice(locale.length + 1) || "/";
    }
  }
  return pathname;
}

function isAdminteaPath(pathname: string): boolean {
  const path = stripLocalePrefix(pathname);
  return path === "/admintea" || path.startsWith("/admintea/");
}

/** Login screen itself stays public; nested admintea routes require a session. */
function isAdminteaLoginPath(pathname: string): boolean {
  const path = stripLocalePrefix(pathname);
  return path === "/admintea" || path === "/admintea/";
}

function localePrefixFor(pathname: string): string {
  for (const locale of routing.locales) {
    if (locale === routing.defaultLocale) continue;
    if (pathname === `/${locale}` || pathname.startsWith(`/${locale}/`)) {
      return `/${locale}`;
    }
  }
  return "";
}

function localizedPath(pathname: string, path: string, localeHint?: string): string {
  const fromPath = localePrefixFor(pathname).replace(/^\//, "");
  const locale =
    fromPath ||
    (localeHint && routing.locales.includes(localeHint as "ru" | "en" | "zh")
      ? localeHint
      : "");

  if (!locale || locale === routing.defaultLocale) {
    return path;
  }

  if (path === "/") return `/${locale}`;
  return `/${locale}${path}`;
}

/**
 * Next.js 16 expects this file to export a function named `proxy`
 * (formerly `middleware`). Without it, locale rewrites never run and
 * paths like `/places` are matched as `[locale]=places` → 404.
 */
export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const path = stripLocalePrefix(pathname);
  const localeHint = request.cookies.get("NEXT_LOCALE")?.value;

  if (isAdminteaPath(pathname) && !isAdminteaLoginPath(pathname)) {
    const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
    if (!session) {
      const loginUrl = request.nextUrl.clone();
      loginUrl.pathname = localizedPath(pathname, "/admintea", localeHint);
      loginUrl.search = "";
      return NextResponse.redirect(loginUrl);
    }
  }

  const onboardingDone =
    request.cookies.get(ONBOARDING_DONE_COOKIE)?.value === "1";
  const langSelected =
    request.cookies.get(LANG_SELECTED_COOKIE)?.value === "1";
  const onboardingRoute = isOnboardingPath(path);

  // Skip onboarding gate for admintea (deep links / bookmarks).
  if (!isAdminteaPath(pathname)) {
    if (onboardingDone && onboardingRoute) {
      const home = request.nextUrl.clone();
      home.pathname = localizedPath(pathname, "/", localeHint);
      home.search = "";
      return NextResponse.redirect(home);
    }

    if (!onboardingDone) {
      if (!langSelected && path !== "/language-select") {
        const url = request.nextUrl.clone();
        url.pathname = "/language-select";
        url.search = "";
        return NextResponse.redirect(url);
      }

      if (langSelected && path !== "/welcome" && path !== "/language-select") {
        const url = request.nextUrl.clone();
        url.pathname = localizedPath(pathname, "/welcome", localeHint);
        url.search = "";
        return NextResponse.redirect(url);
      }
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|.*\\..*).*)"],
};
