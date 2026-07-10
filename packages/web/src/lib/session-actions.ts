"use server";

import { redirect } from "next/navigation";
import { clearSessionToken } from "@/lib/session";
import { currentLocale } from "@/lib/i18n/server-locale";

export async function logout() {
  await clearSessionToken();
  redirect(`/${await currentLocale()}/login`);
}
