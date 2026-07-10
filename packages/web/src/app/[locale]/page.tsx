import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/locales";
import HomeHero from "./HomeHero";

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await getCurrentUser();
  if (user) {
    redirect(`/${locale}/dashboard`);
  }

  const dict = await getDictionary(locale);

  return <HomeHero locale={locale} dict={dict.landing} />;
}
