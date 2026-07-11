import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getAuditLog } from "@/lib/audit";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/locales";
import AuditLogTable from "./AuditLogTable";

export default async function AuditLogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [events, dict] = await Promise.all([getAuditLog(), getDictionary(locale)]);

  return <AuditLogTable events={events} dict={dict.auditLog} />;
}
