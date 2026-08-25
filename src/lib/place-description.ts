const ADDRESS_SUFFIX =
  /(\n\s*)?(Адрес\s*:\s*[\s\S]*|Address\s*:\s*[\s\S]*|地址\s*[：:]\s*[\s\S]*)$/i;

export function extractDescriptionBody(description: string): string {
  return description.replace(ADDRESS_SUFFIX, "").trim();
}

/**
 * Pull the venue address from a localized description.
 * Addresses often start with abbreviations like "г. Иркутск" — never treat
 * those periods as the end of the address value.
 */
export function extractAddress(description: string): string {
  const match =
    description.match(/Адрес\s*:\s*([\s\S]*)$/i) ??
    description.match(/Address\s*:\s*([\s\S]*)$/i) ??
    description.match(/地址\s*[：:]\s*([\s\S]*)$/);

  if (!match?.[1]) return "";

  return match[1].replace(/\.\s*$/, "").replace(/。\s*$/, "").trim();
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
