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

/** Swap the public about-text and keep an existing Адрес/Address/地址 suffix. */
export function replaceDescriptionBody(
  existing: string,
  newBody: string,
): string {
  const suffixMatch = existing.match(ADDRESS_SUFFIX);
  const suffix = suffixMatch
    ? suffixMatch[0].replace(/^\n\s*/, "").trim()
    : "";
  const body = newBody.trim();
  if (!suffix) return body;
  if (
    body.includes(suffix) ||
    body.includes(suffix.replace(/[。.]$/, ""))
  ) {
    return body;
  }
  return `${body}\n\n${suffix}`;
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
