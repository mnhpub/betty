import { notFound } from "next/navigation";
import AppShell from "@/components/AppShell";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/locales";

export default async function ShellLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const dict = await getDictionary(locale);

  return (
    <AppShell locale={locale} dict={dict.nav}>
      {children}
    </AppShell>
  );
}
