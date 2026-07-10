import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { DEFAULT_LOCALE, isLocale, LOCALE_COOKIE } from "@/lib/i18n/locales";

// Shared by the root-level route.ts shims that replace proxy.ts (removed):
// Next.js 16 forces Proxy onto the Node.js runtime, which
// @opennextjs/cloudflare doesn't support yet (opennextjs/opennextjs-cloudflare#962).
export async function redirectToLocale(request: Request, path: string = ""): Promise<NextResponse> {
  const cookieLocale = (await cookies()).get(LOCALE_COOKIE)?.value;
  const locale = isLocale(cookieLocale) ? cookieLocale : DEFAULT_LOCALE;

  const response = NextResponse.redirect(new URL(`/${locale}${path}`, request.url));
  response.cookies.set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
  return response;
}
