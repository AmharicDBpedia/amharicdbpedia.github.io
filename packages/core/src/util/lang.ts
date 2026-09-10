import type { LangTag } from "../rdf/terms";

export type SupportedLanguage = "en" | "am" | "de";

export function toLangTag(value: string): LangTag {
  if (!/^[a-z]{2,3}(-[a-z0-9]+)*$/i.test(value)) {
    throw new Error(`Invalid language tag: ${value}`);
  }
  return value as LangTag;
}

export function pickLocalized<T>(
  localized: Partial<Record<SupportedLanguage, T>>,
  preferred: SupportedLanguage,
): T | undefined {
  const preferredValue = localized[preferred];
  if (preferredValue !== undefined && isUsableLocalizedValue(preferredValue, preferred)) {
    return preferredValue;
  }

  if (localized.en !== undefined) return localized.en;

  if (preferredValue !== undefined) return preferredValue;

  const amharicValue = localized.am;
  if (amharicValue !== undefined && isUsableLocalizedValue(amharicValue, "am")) {
    return amharicValue;
  }

  if (amharicValue !== undefined) return amharicValue;

  return localized.de;
}

function isUsableLocalizedValue<T>(value: T, language: SupportedLanguage): boolean {
  if (language !== "am" || typeof value !== "string") return true;

  const trimmed = value.trim();
  if (!trimmed) return false;
  if (containsEthiopic(trimmed)) return true;
  if (isAllowedSharedLabel(trimmed)) return true;

  return false;
}

function containsEthiopic(value: string): boolean {
  return /[\u1200-\u137f]/.test(value);
}

function isAllowedSharedLabel(value: string): boolean {
  return /^(DBpedia|SPARQL|GitHub|GSoC(?:\s+\d{4})?(?: contributor)?|LREC(?:\s+\d{4})?)$/i.test(
    value,
  );
}
