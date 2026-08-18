import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import {
  isOnboardingPath,
  LANG_SELECTED_COOKIE,
  ONBOARDING_DONE_COOKIE,
} from "./lib/onboarding";
import {
  ADMIN_BASE_PATH,
  ADMIN_SESSION_COOKIE,
  isValidAdminSessionToken,
} from "./lib/admin-auth";

const handleI18nRouting = createMiddleware(routing);

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

function isSecretAdminPath(pathname: string): boolean {
  return (
    pathname === ADMIN_BASE_PATH || pathname.startsWith(`${ADMIN_BASE_PATH}/`)
  );
}

function isSecretAdminLoginPath(pathname: string): boolean {
  return pathname === ADMIN_BASE_PATH || pathname === `${ADMIN_BASE_PATH}/`;
}

function isAdminteaPath(pathname: string): boolean {
  const path = stripLocalePrefix(pathname);
  return path === "/admintea" || path.startsWith("/admintea/");
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

  if (path === "/media" || path.startsWith("/media/")) {
    return NextResponse.next();
  }

  // Hidden admin panel — bypass i18n + onboarding; gate nested routes by cookie.
  if (isSecretAdminPath(pathname)) {
    if (!isSecretAdminLoginPath(pathname)) {
      const session = request.cookies.get(ADMIN_SESSION_COOKIE)?.value;
      if (!isValidAdminSessionToken(session)) {
        const loginUrl = request.nextUrl.clone();
        loginUrl.pathname = ADMIN_BASE_PATH;
        loginUrl.search = "";
        return NextResponse.redirect(loginUrl);
      }
    }
    return NextResponse.next();
  }

  // Legacy stub route — skip onboarding only.
  if (isAdminteaPath(pathname)) {
    return handleI18nRouting(request);
  }

  const onboardingDone =
    request.cookies.get(ONBOARDING_DONE_COOKIE)?.value === "1";
  const langSelected =
    request.cookies.get(LANG_SELECTED_COOKIE)?.value === "1";
  const onboardingRoute = isOnboardingPath(path);

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

  return handleI18nRouting(request);
}

export const config = {
  matcher: ["/((?!api|trpc|_next|_vercel|media|.*\\..*).*)"],
};
