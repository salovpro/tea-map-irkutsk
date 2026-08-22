const ADDRESS_SUFFIX =
  /(\n\s*)?(Адрес:\s*[\s\S]*|Address:\s*[\s\S]*|地址[：:][\s\S]*)$/i;

export function extractDescriptionBody(description: string): string {
  return description.replace(ADDRESS_SUFFIX, "").trim();
}

export function addressSuffixForLocale(
  locale: "ru" | "en" | "zh",
  address: string,
): string {
  const trimmed = address.trim();
  if (locale === "en") return `Address: ${trimmed}.`;
  if (locale === "zh") return `地址：${trimmed}。`;
  return `Адрес: ${trimmed}.`;
}

/** Keep the catalog address suffix while storing the public about-text. */
export function composePlaceDescription(
  body: string,
  address: string,
  locale: "ru" | "en" | "zh",
): string {
  const trimmedBody = body.trim();
  const suffix = addressSuffixForLocale(locale, address);
  if (!trimmedBody) return suffix;
  if (ADDRESS_SUFFIX.test(trimmedBody)) return trimmedBody;
  return `${trimmedBody}\n\n${suffix}`;
}
