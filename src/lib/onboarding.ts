/** Cookie / storage keys for first-run onboarding. */
export const LANG_SELECTED_COOKIE = "tea_language_selected";
export const ONBOARDING_DONE_COOKIE = "hasCompletedOnboarding";

export const ONBOARDING_MAX_AGE = 60 * 60 * 24 * 365 * 2; // 2 years

export const ONBOARDING_PATHS = ["/language-select", "/welcome"] as const;

export function isOnboardingPath(pathWithoutLocale: string): boolean {
  return ONBOARDING_PATHS.some(
    (path) =>
      pathWithoutLocale === path || pathWithoutLocale.startsWith(`${path}/`),
  );
}

export function setClientCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${ONBOARDING_MAX_AGE}; SameSite=Lax`;
}

export function completeLanguageSelection(locale: string) {
  setClientCookie(LANG_SELECTED_COOKIE, "1");
  setClientCookie("NEXT_LOCALE", locale);
  try {
    localStorage.setItem(LANG_SELECTED_COOKIE, "1");
    localStorage.setItem("tea_locale", locale);
  } catch {
    // ignore private mode / blocked storage
  }
}

export function completeOnboarding() {
  setClientCookie(ONBOARDING_DONE_COOKIE, "1");
  try {
    localStorage.setItem(ONBOARDING_DONE_COOKIE, "1");
  } catch {
    // ignore
  }
}
