export const SUPPORTED_LOCALES = ["en", "es"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en";

export const LOCALE_COOKIE = "NEXT_LOCALE";

export function isLocale(value: string | undefined | null): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

export const LOCALE_LABELS: Record<Locale, { name: string; flag: string }> = {
  en: { name: "English", flag: "us" },
  es: { name: "Español", flag: "es" },
};

// Plain (non-component/hook) helper so client callers can update the
// locale preference from an event handler without the react-hooks lint
// rule mistaking it for a render-time mutation of external state.
export function setLocaleCookie(locale: Locale) {
  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${60 * 60 * 24 * 365}`;
}
