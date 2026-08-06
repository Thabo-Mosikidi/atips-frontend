/**
 * lib/i18n.ts
 * Multi-language support (#5): English, Zulu, Afrikaans.
 *
 * Copy lives in keyed dictionaries, never hardcoded in components, so the
 * platform is translatable from the start. English ships complete; Zulu and
 * Afrikaans fall back to English per-key until translated — so partial
 * translation never leaves a blank string on screen.
 *
 * Usage (server or client):
 *   import { t, DEFAULT_LOCALE } from "@/lib/i18n";
 *   t(locale, "home.heroTitle")
 */

export const LOCALES = ["en", "zu", "af"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_LABELS: Record<Locale, string> = {
  en: "English",
  zu: "isiZulu",
  af: "Afrikaans",
};

// Flat, dotted keys keep lookups simple and translations diff-friendly.
const en = {
  "common.tipNow": "Tip Now",
  "common.processing": "Processing...",
  "common.securePaypal": "Secure payment powered by PayPal",
  "common.minTip": "Minimum tip is R{min}",
  "home.badge": "QR Tipping Directory",
  "home.heroTitle": "Directly Reward the Talents You",
  "home.heroTitleAccent": "Value",
  "home.heroSubtitle":
    "Scan a QR code during screen credits or search our directory to tip your favorite South African actors.",
  "home.searchPlaceholder": "Search actors by name...",
  "booking.title": "Book Private Access",
  "booking.videoCall": "Private Video Call",
  "booking.mentorship": "Mentorship Session",
  "booking.industryAdvice": "Industry Advice",
  "booking.selectSlot": "Choose a time",
  "booking.contactEmail": "Your email (so {actor} can reach you)",
  "booking.confirm": "Confirm & Pay",
  "booking.from": "from R{price}",
} as const;

export type MessageKey = keyof typeof en;

// Zulu / Afrikaans: begin empty; add keys as they are translated. Missing
// keys fall through to English via t().
const zu: Partial<Record<MessageKey, string>> = {
  "common.tipNow": "Nikela Manje",
  "home.badge": "Uhla lwe-QR Tipping",
};

const af: Partial<Record<MessageKey, string>> = {
  "common.tipNow": "Gee nou 'n fooitjie",
  "home.badge": "QR-fooitjie-gids",
};

const DICTIONARIES: Record<Locale, Partial<Record<MessageKey, string>>> = {
  en,
  zu,
  af,
};

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (LOCALES as readonly string[]).includes(value);
}

/**
 * Translate a key for a locale, interpolating {tokens}. Falls back to English,
 * then to the raw key, so nothing ever renders blank.
 */
export function t(
  locale: Locale,
  key: MessageKey,
  vars?: Record<string, string | number>
): string {
  const template = DICTIONARIES[locale]?.[key] ?? en[key] ?? key;
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (_, name) =>
    name in vars ? String(vars[name]) : `{${name}}`
  );
}
