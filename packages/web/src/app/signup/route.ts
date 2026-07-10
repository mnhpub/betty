import { redirectToLocale } from "@/lib/locale-redirect";

export async function GET(request: Request) {
  return redirectToLocale(request, "/signup");
}
