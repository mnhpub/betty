import "server-only";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE, type Locale } from "./locales";

// Server Action redirects are followed client-side and don't visibly pass
// back through proxy.ts's URL rewrite, so actions resolve the locale
// themselves (from the cookie proxy.ts already set) rather than relying on
// a follow-up redirect to reattach it.
export async function currentLocale(): Promise<Locale> {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  return isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;
}
