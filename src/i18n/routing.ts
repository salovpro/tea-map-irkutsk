import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  locales: ["ru", "en", "zh"],
  defaultLocale: "ru",
  localePrefix: "as-needed",
});
